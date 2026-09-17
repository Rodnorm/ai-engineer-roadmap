import { z } from "zod";

const DEVELOPMENT_SESSION_SECRET = "development-only-session-secret-change-me";

const envSchema = z.object({
  AGENT_PROVIDER: z.enum(["offline", "foundry"]).default("offline"),
  GENERATION_ENABLED: z.enum(["true", "false"]).default("true"),
  MCP_SERVER_URL: z.string().url().default("http://localhost:8006"),
  INTERNAL_API_TOKEN: z.string().optional(),
  CONVERSATION_SESSION_SECRET: z.string().min(32).default(DEVELOPMENT_SESSION_SECRET),
  AZURE_AI_PROJECT_ENDPOINT: z.string().url().optional(),
  AZURE_AI_AGENT_NAME: z.string().optional(),
  COSMOS_ENDPOINT: z.string().url().optional(),
  COSMOS_KEY: z.string().optional(),
  COSMOS_DATABASE_NAME: z.string().default("agent-workspace"),
  COSMOS_CONTAINER_NAME: z.string().default("conversations-v2"),
});

export type AppConfig = z.infer<typeof envSchema>;

let cached: AppConfig | undefined;

export function getConfig(): AppConfig {
  if (!cached) {
    const parsed = envSchema.parse(process.env);
    if (
      process.env.NODE_ENV === "production"
      && parsed.CONVERSATION_SESSION_SECRET === DEVELOPMENT_SESSION_SECRET
    ) {
      throw new Error("CONVERSATION_SESSION_SECRET must be configured in production");
    }
    cached = parsed;
  }
  return cached;
}
