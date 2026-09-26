import { describe, it } from "node:test";
import assert from "node:assert";
import { executeMultiAgentPipeline } from "../lib/orchestrator/pipeline";
import { isValidLocale, LOCALES, localizeStepAction } from "../lib/i18n/locales";

describe("i18n Multilingual Support & Localization", () => {
  it("validates supported locales", () => {
    assert.strictEqual(isValidLocale("en"), true);
    assert.strictEqual(isValidLocale("pt"), true);
    assert.strictEqual(isValidLocale("de"), true);
    assert.strictEqual(isValidLocale("fr"), false);
    assert.strictEqual(isValidLocale(""), false);
    assert.strictEqual(isValidLocale(null), false);
    assert.strictEqual(isValidLocale(undefined), false);
    assert.deepStrictEqual(LOCALES, ["en", "pt", "de"]);
  });

  it("localizes trace step actions accurately across locales", () => {
    const rawAction = "Initialize Heterogeneous Multi-Agent Pipeline";
    assert.strictEqual(
      localizeStepAction(rawAction, "de"),
      "Heterogene Multi-Agenten-Pipeline Initialisieren"
    );
    assert.strictEqual(
      localizeStepAction(rawAction, "pt"),
      "Inicializar Pipeline Multi-Agente Heterogêneo"
    );
    assert.strictEqual(localizeStepAction(rawAction, "en"), rawAction);

    assert.strictEqual(
      localizeStepAction("Tool Call: search_facts", "de"),
      "Werkzeugaufruf: search_facts"
    );
    assert.strictEqual(
      localizeStepAction("Tool Call: search_facts", "pt"),
      "Chamada de Ferramenta: search_facts"
    );
    assert.strictEqual(
      localizeStepAction("Tool Call: search_facts", "en"),
      "Tool Call: search_facts"
    );
  });

  it("generates an English brief when locale='en'", async () => {
    const result = await executeMultiAgentPipeline({
      topic: "Kubernetes Autoscaling with KEDA",
      scope: "Infrastructure & Cost Efficiency",
      tone: "executive",
      locale: "en",
      clientIp: "test-ip-en",
    });

    assert.ok(result.brief.title.startsWith("Executive Briefing:"));
    assert.ok(result.brief.fullMarkdown.includes("## 1. Executive Summary"));
    assert.ok(result.brief.fullMarkdown.includes("## 2. Key Evidence & Verified Facts"));
    assert.ok(result.brief.fullMarkdown.includes("## 3. Operational Metrics & Performance Indicators"));
    assert.ok(result.brief.fullMarkdown.includes("## 4. Critical Risks, Constraints & Trade-offs"));
    assert.ok(result.brief.fullMarkdown.includes("## 5. Strategic Action Recommendations"));
  });

  it("generates a German brief when locale='de'", async () => {
    const result = await executeMultiAgentPipeline({
      topic: "Kubernetes Autoscaling mit KEDA",
      scope: "Infrastruktur und Kosteneffizienz",
      tone: "technical",
      locale: "de",
      clientIp: "test-ip-de",
    });

    assert.ok(result.brief.title.startsWith("Management-Briefing:"));
    assert.ok(result.brief.fullMarkdown.includes("## 1. Management-Zusammenfassung"));
    assert.ok(result.brief.fullMarkdown.includes("## 2. Wichtigste Nachweise & Verifizierte Fakten"));
    assert.ok(result.brief.fullMarkdown.includes("## 3. Operative Kennzahlen & Leistungsindikatoren"));
    assert.ok(result.brief.fullMarkdown.includes("## 4. Kritische Risiken, Einschränkungen & Trade-offs"));
    assert.ok(result.brief.fullMarkdown.includes("## 5. Strategische Handlungsempfehlungen"));
  });

  it("generates a Portuguese brief when locale='pt'", async () => {
    const result = await executeMultiAgentPipeline({
      topic: "Autoscaling no Kubernetes com KEDA",
      scope: "Infraestrutura e Eficiência de Custos",
      tone: "executive",
      locale: "pt",
      clientIp: "test-ip-pt",
    });

    assert.ok(result.brief.title.startsWith("Briefing Executivo:"));
    assert.ok(result.brief.fullMarkdown.includes("## 1. Sumário Executivo"));
    assert.ok(result.brief.fullMarkdown.includes("## 2. Principais Evidências & Fatos Verificados"));
    assert.ok(result.brief.fullMarkdown.includes("## 3. Métricas Operacionais & Indicadores de Performance"));
    assert.ok(result.brief.fullMarkdown.includes("## 4. Riscos, Restrições & Trade-offs Críticos"));
    assert.ok(result.brief.fullMarkdown.includes("## 5. Recomendações Estratégicas de Ação"));
  });
});
