import { z } from "zod";

const envSchema = z.object({
  AGENT_PROVIDER: z.enum(["offline", "foundry"]).default("offline"),
  GENERATION_ENABLED: z.enum(["true", "false"]).default("true"),
  MCP_SERVER_URL: z.string().url().default("http://localhost:8006"),
  INTERNAL_API_TOKEN: z.string().optional(),
  AZURE_AI_PROJECT_ENDPOINT: z.string().url().optional(),
  AZURE_AI_AGENT_NAME: z.string().optional(),
  COSMOS_ENDPOINT: z.string().url().optional(),
  COSMOS_KEY: z.string().optional(),
  COSMOS_DATABASE_NAME: z.string().default("agent-workspace"),
  COSMOS_CONTAINER_NAME: z.string().default("conversations"),
});

export type AppConfig = z.infer<typeof envSchema>;

let cached: AppConfig | undefined;

export function getConfig(): AppConfig {
  cached ??= envSchema.parse(process.env);
  return cached;
}
