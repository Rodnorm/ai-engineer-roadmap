import { TrafficPolicy } from "./deployment";

export type ScenarioCategory =
  | "canary"
  | "blue-green"
  | "chaos"
  | "quota"
  | "finops"
  | "security"
  | "governance"
  | "shadow"
  | "latency"
  | "schema"
  | "concurrency"
  | "emergency";

export interface QuickScenario {
  id: string;
  category: ScenarioCategory;
  titleKey: string;
  descriptionKey: string;
  focusKey: string;
  defaultPolicy: Partial<TrafficPolicy>;
  defaultPrompt: string;
  chaosType?: "latency_spike" | "azure_429" | "prompt_injection" | "schema_corruption" | "none";
  chaosDelayMs?: number;
  testCount?: number;
}
