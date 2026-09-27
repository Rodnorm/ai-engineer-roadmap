export interface Dictionary {
  common: {
    appTitle: string;
    appSubtitle: string;
    aboutApp: string;
    history: string;
    systemCard: string;
    onlineMode: string;
    offlineMode: string;
    killSwitchActive: string;
    killSwitchInactive: string;
    toggleKillSwitch: string;
    emergencyStop: string;
    emergencyResume: string;
    resetState: string;
    resetStateConfirm: string;
    loading: string;
    executing: string;
    success: string;
    error: string;
    warning: string;
    close: string;
    copy: string;
    copied: string;
  };
  trafficControl: {
    title: string;
    subtitle: string;
    modeCanary: string;
    modeBlueGreen: string;
    modeShadow: string;
    modeMaintenance: string;
    baselineBlueLabel: string;
    canaryGreenLabel: string;
    trafficSplit: string;
    promoteGreenTo100: string;
    revertBlueTo100: string;
    activeRollbackAlert: string;
    manualOverrideHint: string;
    applyPolicy: string;
    policyUpdated: string;
  };
  chaos: {
    title: string;
    subtitle: string;
    testPrompt: string;
    promptPlaceholder: string;
    batchSize: string;
    injectChaos: string;
    none: string;
    latencySpike: string;
    latencySpikeDesc: string;
    azure429: string;
    azure429Desc: string;
    promptInjection: string;
    promptInjectionDesc: string;
    schemaCorruption: string;
    schemaCorruptionDesc: string;
    runSimulation: string;
    burstTraffic: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    p95Latency: string;
    p50Latency: string;
    ttft: string;
    errorBudget: string;
    errorBudgetDesc: string;
    estimatedCost: string;
    circuitBreaker: string;
    cbClosed: string;
    cbOpen: string;
    cbHalfOpen: string;
    totalRequests: string;
    successRate: string;
    schemaConformity: string;
    blueMetrics: string;
    greenMetrics: string;
  };
  trace: {
    title: string;
    subtitle: string;
    emptyTrace: string;
    target: string;
    model: string;
    latency: string;
    ttft: string;
    cost: string;
    tokens: string;
    status: string;
    viewResponse: string;
    shadowResult: string;
  };
  scenarios: {
    title: string;
    subtitle: string;
    selectScenario: string;
    items: {
      [scenarioId: string]: {
        title: string;
        description: string;
        focus: string;
      };
    };
  };
  infoDrawer: {
    title: string;
    subtitle: string;
    overviewTitle: string;
    overviewContent: string;
    routingTitle: string;
    routingContent: string;
    sloTitle: string;
    sloContent: string;
    resilienceTitle: string;
    resilienceContent: string;
    governanceTitle: string;
    governanceContent: string;
  };
  historyDrawer: {
    title: string;
    subtitle: string;
    emptyHistory: string;
    incidentHistory: string;
    policyHistory: string;
    noIncidents: string;
  };
}
