import { ChatWorkspace } from "@/components/ChatWorkspace";
import { getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function AgentWorkspacePage() {
  const config = getConfig();
  return <ChatWorkspace provider={config.AGENT_PROVIDER} />;
}
