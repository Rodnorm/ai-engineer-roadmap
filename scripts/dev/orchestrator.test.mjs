import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";

import { loadManifest, checkPortAvailable, resolveCommand } from "./run.mjs";

test("loadManifest loads apps.json and validates port assignments", () => {
  const manifest = loadManifest();
  assert.ok(Array.isArray(manifest.apps));
  assert.equal(manifest.apps.length >= 4, true);

  const expectedPorts = {
    "00": { frontend: 3000 },
    "01": { frontend: 3001, backend: 8001 },
    "02": { frontend: 3002, backend: 8002 },
    "03": { frontend: 3003, backend: 8003 },
  };

  const assignedPorts = new Set();

  for (const [id, config] of Object.entries(expectedPorts)) {
    const app = manifest.apps.find((a) => a.id === id);
    assert.ok(app, `App ${id} must exist in manifest`);

    assert.equal(app.frontend.port, config.frontend);
    assert.equal(assignedPorts.has(app.frontend.port), false, `Port ${app.frontend.port} duplicated`);
    assignedPorts.add(app.frontend.port);

    if (config.backend) {
      assert.ok(app.backend, `App ${id} must have backend`);
      assert.equal(app.backend.port, config.backend);
      assert.equal(assignedPorts.has(app.backend.port), false, `Port ${app.backend.port} duplicated`);
      assignedPorts.add(app.backend.port);
    }
  }
});

test("resolveCommand handles cross-platform executables", () => {
  const npmCmd = resolveCommand("npm run dev", process.cwd());
  if (process.platform === "win32") {
    assert.equal(npmCmd.cmd, "npm.cmd");
  } else {
    assert.equal(npmCmd.cmd, "npm");
  }
  assert.deepEqual(npmCmd.args, ["run", "dev"]);
});

test("checkPortAvailable detects open and busy ports", async () => {
  // Find a free port dynamically
  const tempServer = net.createServer();
  await new Promise((resolve) => tempServer.listen(0, "127.0.0.1", resolve));
  const freePort = tempServer.address().port;

  // While tempServer is listening, port is busy
  const isAvailableBusy = await checkPortAvailable(freePort, "127.0.0.1");
  assert.equal(isAvailableBusy, false);

  // Close tempServer
  await new Promise((resolve) => tempServer.close(resolve));

  // Now port should be available
  const isAvailableFree = await checkPortAvailable(freePort, "127.0.0.1");
  assert.equal(isAvailableFree, true);
});
