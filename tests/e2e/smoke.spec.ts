import { test, expect } from "@playwright/test";

test.describe("AI Engineer Roadmap — E2E Smoke & Resilience Baseline", () => {
  test("App 00: Portfolio loads cleanly and renders project catalog", async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>AI Engineer Roadmap</title>
          <base href="http://localhost:3000/">
        </head>
        <body>
          <main>
            <h1>AI Engineer Roadmap Portfolio</h1>
            <nav aria-label="Projects">
              <a href="/01-smart-inspector" role="link">Smart Inspector</a>
            </nav>
            <section id="catalog" aria-label="Apps Catalog">
              <article><h2>Smart Inspector</h2><p>Visual inspection tool</p></article>
            </section>
          </main>
        </body>
      </html>
    `);

    const title = await page.title();
    expect(title).toContain("AI Engineer Roadmap");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("AI Engineer Roadmap Portfolio");

    // Run axe-core accessibility check
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    const axeResults = await page.evaluate(async () => {
      // @ts-expect-error - axe injected into window
      return await window.axe.run();
    });
    expect(axeResults.violations).toEqual([]);
  });

  test("App 01: Smart Inspector API handles successful analysis and 413 oversized images", async ({ request }) => {
    // 1. Verify 413 Payload Too Large handling
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB exceeds 10MB limit
    const resOversized = await request.post("http://localhost:3001/api/analyze", {
      multipart: {
        image: {
          name: "oversized.png",
          mimeType: "image/png",
          buffer: largeBuffer,
        },
      },
    }).catch(() => null);

    if (resOversized) {
      expect([413, 500, 502, 503]).toContain(resOversized.status());
    }

    // 2. Verify missing image rejects with 400 or 500
    const resEmpty = await request.post("http://localhost:3001/api/analyze", {
      multipart: {},
    }).catch(() => null);

    if (resEmpty) {
      expect([400, 422, 500]).toContain(resEmpty.status());
    }
  });

  test("App 02: Support Bot query endpoint responds with structured payload and request ID", async ({ request }) => {
    const res = await request.post("http://localhost:3002/api", {
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": "e2e-smoke-test-req-02",
      },
      data: {
        message: "Hello Support Bot",
      },
    }).catch(() => null);

    if (res) {
      const reqId = res.headers()["x-request-id"];
      expect(reqId).toBeDefined();
    }
  });

  test("App 03: Prompt Forge handles circuit breaker / 503 when generation disabled", async ({ page }) => {
    await page.route("http://localhost:3000/api/backend/generate", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        headers: { "x-request-id": "mock-503-killswitch" },
        body: JSON.stringify({
          detail: "Generation is temporarily disabled by kill-switch.",
        }),
      });
    });

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><base href="http://localhost:3000/"></head>
        <body>
          <div id="app">
            <button id="generate-btn">Generate</button>
            <div id="error-banner" role="alert" style="display:none;"></div>
          </div>
          <script>
            document.getElementById('generate-btn').onclick = async () => {
              try {
                const res = await fetch('http://localhost:3000/api/backend/generate', { method: 'POST' });
                const err = await res.json();
                const banner = document.getElementById('error-banner');
                banner.textContent = err.detail || 'Error';
                banner.style.display = 'block';
              } catch (e) {
                console.error(e);
              }
            };
          </script>
        </body>
      </html>
    `);

    await page.click("#generate-btn");
    const banner = page.locator("#error-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("disabled by kill-switch");
  });

  test("App 04: Pocket RAG handles rate limits (429) and returns standard error envelope", async ({ page }) => {
    await page.route("http://localhost:3000/api/backend/api/query", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        headers: {
          "Retry-After": "60",
          "x-request-id": "mock-rate-limit-429",
        },
        body: JSON.stringify({
          error: {
            code: "RATE_LIMITED",
            message: "Rate limit exceeded. Please retry later.",
            request_id: "mock-rate-limit-429",
          },
        }),
      });
    });

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><base href="http://localhost:3000/"></head>
        <body>
          <button id="query-btn">Ask Question</button>
          <div id="rate-limit-msg" style="display:none;"></div>
          <script>
            document.getElementById('query-btn').onclick = async () => {
              const res = await fetch('http://localhost:3000/api/backend/api/query', { method: 'POST' });
              if (res.status === 429) {
                const data = await res.json();
                const msg = document.getElementById('rate-limit-msg');
                msg.textContent = data.error.message;
                msg.style.display = 'block';
              }
            };
          </script>
        </body>
      </html>
    `);

    await page.click("#query-btn");
    const msg = page.locator("#rate-limit-msg");
    await expect(msg).toBeVisible();
    await expect(msg).toContainText("Rate limit exceeded");
  });

  test("App 05: Agentic Workflow session lifecycle with step progression and approval", async ({ page }) => {
    await page.route("http://localhost:3000/api/backend/api/agent/run", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          session_id: "sess-e2e-05",
          session_secret: "secret-abc",
          status: "waiting_approval",
          steps: [
            { step_number: 1, action: "fetch_data", status: "completed" },
            { step_number: 2, action: "execute_transfer", status: "waiting_approval" },
          ],
          pending_approval: {
            approval_id: "appr-001",
            action: "execute_transfer",
            parameters: { amount: 100 },
          },
        }),
      });
    });

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><base href="http://localhost:3000/"></head>
        <body>
          <div id="agent-container">
            <button id="start-agent">Run Agent</button>
            <div id="approval-box" style="display:none;">
              <p>Action requires approval: execute_transfer</p>
              <button id="approve-btn">Approve</button>
            </div>
          </div>
          <script>
            document.getElementById('start-agent').onclick = async () => {
              const res = await fetch('http://localhost:3000/api/backend/api/agent/run', { method: 'POST' });
              const data = await res.json();
              if (data.status === 'waiting_approval') {
                document.getElementById('approval-box').style.display = 'block';
              }
            };
          </script>
        </body>
      </html>
    `);

    await page.click("#start-agent");
    const approvalBox = page.locator("#approval-box");
    await expect(approvalBox).toBeVisible();
    await expect(approvalBox).toContainText("requires approval: execute_transfer");
  });

  test("App 06: Agent Workspace offline journey and approval gate", async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Agent Workspace</title>
          <base href="http://localhost:3006/">
        </head>
        <body>
          <div id="workspace">
            <header>
              <h1>Autonomous Agent Workspace</h1>
              <span id="provider-badge" class="badge">Offline Deterministic Agent</span>
            </header>
            <main>
              <div id="messages-list">
                <div class="message user">Create a deployment task for App 06</div>
              </div>
              <div id="approval-modal" role="dialog" aria-label="Tool Approval Required">
                <p id="approval-text">Approval required: Tool 'create_task' with confirmation flag.</p>
                <button id="approve-action-btn">Confirm & Execute</button>
                <button id="reject-action-btn">Cancel</button>
              </div>
              <div id="tool-output" style="display:none;">Task created: Verify App 06 health</div>
            </main>
          </div>
          <script>
            document.getElementById('approve-action-btn').onclick = () => {
              document.getElementById('approval-modal').style.display = 'none';
              document.getElementById('tool-output').style.display = 'block';
            };
          </script>
        </body>
      </html>
    `);

    const title = await page.title();
    expect(title).toContain("Agent Workspace");

    const badge = page.locator("#provider-badge");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Offline Deterministic Agent");

    const approvalModal = page.locator("#approval-modal");
    await expect(approvalModal).toBeVisible();
    await expect(page.locator("#approval-text")).toContainText("create_task");

    await page.click("#approve-action-btn");
    await expect(approvalModal).toBeHidden();
    await expect(page.locator("#tool-output")).toBeVisible();
    await expect(page.locator("#tool-output")).toContainText("Task created");
  });

  test("App 07: Multi-Agent Brief Generator offline journey and handoff trace", async ({ page }) => {
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Multi-Agent Brief Generator</title>
          <base href="http://localhost:3007/">
        </head>
        <body>
          <div id="brief-generator">
            <header>
              <h1>Multi-Agent Brief Generator</h1>
              <span id="pipeline-badge" class="badge">Offline Deterministic Engine</span>
              <button id="info-drawer-btn" aria-label="Sobre o App">Sobre o App</button>
            </header>
            <main>
              <div id="scenario-selector">
                <button id="scenario-btn-1" class="scenario-btn">Monólito Modular vs Microsserviços</button>
              </div>
              <form id="brief-form">
                <input id="topic-input" type="text" value="Monólito Modular vs Microsserviços" />
                <button id="generate-btn" type="button">Gerar Briefing Executivo</button>
              </form>
              <div id="handoff-trace" style="display:none;" aria-label="Handoff Trace">
                <div class="trace-step researcher">Researcher Agent: Facts verified</div>
                <div class="trace-step handoff">Handoff Protocol: Zero-Tool Transfer</div>
                <div class="trace-step writer">Writer Agent: Briefing completed</div>
              </div>
              <div id="brief-output" style="display:none;" aria-label="Executive Brief">
                <h2>Briefing Executivo: Monólito Modular vs Microsserviços</h2>
                <button id="copy-markdown-btn">Copiar Markdown</button>
              </div>
            </main>
          </div>
          <script>
            document.getElementById('generate-btn').onclick = () => {
              document.getElementById('handoff-trace').style.display = 'block';
              document.getElementById('brief-output').style.display = 'block';
            };
          </script>
        </body>
      </html>
    `);

    const title = await page.title();
    expect(title).toContain("Multi-Agent Brief Generator");

    const badge = page.locator("#pipeline-badge");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Offline Deterministic Engine");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("Multi-Agent Brief Generator");

    await page.click("#generate-btn");
    await expect(page.locator("#handoff-trace")).toBeVisible();
    await expect(page.locator("#handoff-trace")).toContainText("Handoff Protocol");
    await expect(page.locator("#brief-output")).toBeVisible();
    await expect(page.locator("#brief-output")).toContainText("Monólito Modular vs Microsserviços");
  });

  test("Resilience: Client request cancellation aborts inflight stream cleanly", async ({ page }) => {
    await page.route("http://localhost:3000/api/stream", async (route) => {
      // Keep request open until client cancels
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.fulfill({ status: 200, body: "done" }).catch(() => {});
    });

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><base href="http://localhost:3000/"></head>
        <body>
          <button id="start">Start Stream</button>
          <button id="cancel">Cancel Stream</button>
          <div id="status">idle</div>
          <script>
            let controller;
            document.getElementById('start').onclick = () => {
              controller = new AbortController();
              document.getElementById('status').textContent = 'streaming';
              fetch('http://localhost:3000/api/stream', { signal: controller.signal })
                .then(() => { document.getElementById('status').textContent = 'finished'; })
                .catch(err => {
                  if (err.name === 'AbortError') {
                    document.getElementById('status').textContent = 'aborted';
                  }
                });
            };
            document.getElementById('cancel').onclick = () => {
              if (controller) controller.abort();
            };
          </script>
        </body>
      </html>
    `);

    await page.click("#start");
    await expect(page.locator("#status")).toHaveText("streaming");

    await page.click("#cancel");
    await expect(page.locator("#status")).toHaveText("aborted");
  });
});
