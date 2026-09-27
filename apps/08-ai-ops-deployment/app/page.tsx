"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { TrafficControlPanel } from "@/components/controls/TrafficControlPanel";
import { ChaosSimulationPanel } from "@/components/controls/ChaosSimulationPanel";
import { SLADashboard } from "@/components/dashboard/SLADashboard";
import { LatencyPercentilesChart } from "@/components/dashboard/LatencyPercentilesChart";
import { IncidentAlertBanner } from "@/components/dashboard/IncidentAlertBanner";
import { DeploymentTraceVisualizer } from "@/components/trace/DeploymentTraceVisualizer";
import { QuickScenarios } from "@/components/suggestions/QuickScenarios";
import { AppInfoDrawer } from "@/components/info/AppInfoDrawer";
import { DeploymentHistoryDrawer } from "@/components/session/DeploymentHistoryDrawer";
import { InvocationTelemetry, TrafficPolicy } from "@/types/deployment";
import { DeploymentMetrics } from "@/types/metrics";
import { RollbackIncidentEvent } from "@/lib/resilience/rollback-trigger";
import { ChaosType } from "@/lib/simulation/chaos-injector";
import { QuickScenario } from "@/types/agent";
import { DEFAULT_SLO } from "@/lib/metrics/sla-monitor";
import { DEFAULT_TRAFFIC_POLICY } from "@/lib/router/traffic-router";

const INITIAL_METRICS: DeploymentMetrics = {
  overall: {
    totalRequests: 0,
    successRequests: 0,
    errorRequests: 0,
    errorRatePercent: 0,
    avgTtftMs: 0,
    p95LatencyMs: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    schemaValidRatePercent: 100,
  },
  blue: {
    totalRequests: 0,
    successRequests: 0,
    errorRequests: 0,
    errorRatePercent: 0,
    avgTtftMs: 0,
    p95LatencyMs: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    schemaValidRatePercent: 100,
  },
  green: {
    totalRequests: 0,
    successRequests: 0,
    errorRequests: 0,
    errorRatePercent: 0,
    avgTtftMs: 0,
    p95LatencyMs: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    schemaValidRatePercent: 100,
  },
  bluePercentiles: { p50: 0, p90: 0, p95: 0, p99: 0, avgLatencyMs: 0 },
  greenPercentiles: { p50: 0, p90: 0, p95: 0, p99: 0, avgLatencyMs: 0 },
  errorBudget: {
    totalBudgetPercent: 1.0,
    consumedPercent: 0,
    remainingPercent: 100,
    status: "healthy",
  },
  circuitBreakerState: "CLOSED",
  slo: DEFAULT_SLO,
};

export default function AIOpsDeploymentPage() {
  const [policy, setPolicy] = useState<TrafficPolicy>(DEFAULT_TRAFFIC_POLICY);
  const [metrics, setMetrics] = useState<DeploymentMetrics>(INITIAL_METRICS);
  const [telemetry, setTelemetry] = useState<InvocationTelemetry[]>([]);
  const [incidents, setIncidents] = useState<RollbackIncidentEvent[]>([]);
  const [deployEnabled, setDeployEnabled] = useState(true);
  const [mode, setMode] = useState("offline");

  const [prompt, setPrompt] = useState(
    "Analyze the operational trade-offs of microservices vs modular monolith for low-latency streaming applications."
  );
  const [chaosType, setChaosType] = useState<ChaosType>("none");
  const [batchSize, setBatchSize] = useState(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("01");

  const [infoOpen, setInfoOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load session state on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/session");
        if (res.ok) {
          const data = await res.json();
          if (data.policy) setPolicy(data.policy);
          if (data.metrics) setMetrics(data.metrics);
          if (data.telemetry) setTelemetry(data.telemetry);
          if (data.incidents) setIncidents(data.incidents);
          if (typeof data.deployEnabled === "boolean") setDeployEnabled(data.deployEnabled);
          if (data.mode) setMode(data.mode);
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      }
    }
    loadSession();
  }, []);

  // Run simulation invocation
  const handleRunSimulation = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          batchSize,
          chaosType,
          requireStructuredJson: selectedScenarioId === "10",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.invocations) {
          setTelemetry((prev) => [...data.invocations, ...prev].slice(0, 50));
        }
        if (data.policy) setPolicy(data.policy);
        if (data.metrics) setMetrics(data.metrics);
        if (data.incidents) setIncidents(data.incidents);
      } else {
        alert(data.error || "Simulation request failed");
      }
    } catch (err) {
      console.error("Error executing simulation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update policy
  const handleUpdatePolicy = async (newPolicy: Partial<TrafficPolicy>) => {
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_policy", policy: newPolicy }),
      });
      const data = await res.json();
      if (res.ok && data.policy) {
        setPolicy(data.policy);
      }
    } catch (err) {
      console.error("Failed to update policy:", err);
    }
  };

  // Promote green 100%
  const handlePromoteGreen = async () => {
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "promote_green" }),
      });
      const data = await res.json();
      if (res.ok && data.policy) {
        setPolicy(data.policy);
      }
    } catch (err) {
      console.error("Failed to promote green:", err);
    }
  };

  // Revert blue 100%
  const handleRevertBlue = async () => {
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revert_blue" }),
      });
      const data = await res.json();
      if (res.ok && data.policy) {
        setPolicy(data.policy);
      }
    } catch (err) {
      console.error("Failed to revert blue:", err);
    }
  };

  // Clear rollback condition
  const handleClearRollback = async () => {
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_rollback" }),
      });
      const data = await res.json();
      if (res.ok && data.policy) {
        setPolicy(data.policy);
      }
    } catch (err) {
      console.error("Failed to clear rollback:", err);
    }
  };

  // Toggle master kill-switch
  const handleToggleKillSwitch = async () => {
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_kill_switch" }),
      });
      const data = await res.json();
      if (res.ok && typeof data.deployEnabled === "boolean") {
        setDeployEnabled(data.deployEnabled);
      }
    } catch (err) {
      console.error("Failed to toggle kill-switch:", err);
    }
  };

  // Reset session metrics
  const handleResetSession = async () => {
    if (!confirm("Deseja realmente resetar todas as métricas e histórico desta sessão?")) {
      return;
    }
    try {
      const res = await fetch("/api/session", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setTelemetry([]);
        setIncidents([]);
        if (data.policy) setPolicy(data.policy);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to reset session:", err);
    }
  };

  // Quick scenario selection
  const handleSelectScenario = (scenario: QuickScenario) => {
    setSelectedScenarioId(scenario.id);
    setPrompt(scenario.defaultPrompt);
    setChaosType(scenario.chaosType || "none");
    if (scenario.testCount) setBatchSize(scenario.testCount);

    if (scenario.defaultPolicy) {
      handleUpdatePolicy(scenario.defaultPolicy);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <Header
        mode={mode}
        deployEnabled={deployEnabled}
        onToggleKillSwitch={handleToggleKillSwitch}
        onOpenInfo={() => setInfoOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onReset={handleResetSession}
        incidentCount={incidents.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Incident Alert Banner if active */}
        <IncidentAlertBanner
          incidents={incidents}
          isRollbackActive={policy.isRollbackActive}
          onClear={handleClearRollback}
        />

        {/* 12 Quick Scenarios Catalog */}
        <QuickScenarios
          onSelectScenario={handleSelectScenario}
          selectedId={selectedScenarioId}
        />

        {/* Two-Column Grid: Left Controls, Right Observability */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Traffic Control & Chaos Injection (5 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <TrafficControlPanel
              policy={policy}
              onUpdatePolicy={handleUpdatePolicy}
              onPromoteGreen={handlePromoteGreen}
              onRevertBlue={handleRevertBlue}
              onClearRollback={handleClearRollback}
              isUpdating={isLoading}
            />

            <ChaosSimulationPanel
              prompt={prompt}
              onPromptChange={setPrompt}
              chaosType={chaosType}
              onChaosTypeChange={setChaosType}
              batchSize={batchSize}
              onBatchSizeChange={setBatchSize}
              onRunSimulation={handleRunSimulation}
              isLoading={isLoading}
              deployEnabled={deployEnabled}
            />
          </div>

          {/* Right Column: SLA Dashboard & Latency Distribution (7 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <SLADashboard metrics={metrics} />
            <LatencyPercentilesChart metrics={metrics} />
          </div>
        </div>

        {/* Real-time Telemetry Trace */}
        <DeploymentTraceVisualizer telemetry={telemetry} />
      </main>

      {/* Drawers */}
      <AppInfoDrawer isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
      <DeploymentHistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        incidents={incidents}
        policy={policy}
      />
    </div>
  );
}
