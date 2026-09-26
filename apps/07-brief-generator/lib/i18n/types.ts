import { BriefTone } from "@/types/agent";

export interface LocalizedScenario {
  id: number;
  category: string;
  title: string;
  topic: string;
  scope: string;
  tone: BriefTone;
  focus: string;
}

export interface Dictionary {
  header: {
    title: string;
    subtitle: string;
    badge: string;
    sessionTitle: string;
    historyBtn: string;
    aboutBtn: string;
    switchLanguage: string;
  };
  controlPanel: {
    title: string;
    scenariosBtn: string;
    scenariosCatalogTitle: string;
    topicLabel: string;
    topicPlaceholder: string;
    scopeLabel: string;
    scopePlaceholder: string;
    toneLabel: string;
    toneExecutive: string;
    toneTechnical: string;
    toneCritical: string;
    generateBtn: string;
    generatingBtn: string;
  };
  scenarios: {
    allCategories: string;
    loadAction: string;
    items: LocalizedScenario[];
  };
  handoffVisualizer: {
    title: string;
    subtitle: string;
    telemetryTitle: string;
    totalLatency: string;
    researchLatency: string;
    writerLatency: string;
    estimatedTokens: string;
    toolCalls: string;
    waitingTitle: string;
    waitingSubtitle: string;
    inputLabel: string;
    outputLabel: string;
    handoffCardTitle: string;
    handoffCardDesc: string;
    agentResearcher: string;
    agentWriter: string;
    agentOrchestrator: string;
  };
  briefViewer: {
    tabBrief: string;
    tabDossier: string;
    copyMarkdown: string;
    copied: string;
    print: string;
    emptyTitle: string;
    emptySubtitle: string;
    executiveSummaryLabel: string;
    keyInsightsHeading: string;
    metricsHeading: string;
    risksHeading: string;
    recommendationsHeading: string;
    dossierTopicsTitle: string;
    dossierFactsTitle: string;
    dossierMetricsTitle: string;
    dossierFrictionTitle: string;
    confidenceLabel: string;
    sourceLabel: string;
  };
  appInfo: {
    title: string;
    subtitle: string;
    section1Title: string;
    section1Text: string;
    section1Point1Title: string;
    section1Point1Text: string;
    section1Point2Title: string;
    section1Point2Text: string;
    section2Title: string;
    section2ResearcherTitle: string;
    section2ResearcherDesc: string;
    section2WriterTitle: string;
    section2WriterDesc: string;
    section3Title: string;
    section3RateLimitTitle: string;
    section3RateLimitDesc: string;
    section3KillSwitchTitle: string;
    section3KillSwitchDesc: string;
    section3PrivacyTitle: string;
    section3PrivacyDesc: string;
    section4Title: string;
    section4Text: string;
  };
  historyDrawer: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    privacyNotice: string;
    clearSessionBtn: string;
    loadBrief: string;
    activeBadge: string;
  };
}
