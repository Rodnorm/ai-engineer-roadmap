"use client";

import {
  Bot,
  Check,
  ChevronRight,
  CirclePlus,
  Database,
  Menu,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { AgentEvent, ChatMessage, Conversation, PendingApproval } from "@/lib/types";

const suggestions = [
  "Which tasks are still open?",
  "Search the notes for deployment information",
  "Create a task to verify the Coolify health checks",
];

async function json<T>(response: Response): Promise<T> {
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Request failed");
  return payload;
}

async function consumeEvents(response: Response, onEvent: (event: AgentEvent) => void): Promise<void> {
  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => ({ error: "Request failed" })) as { error?: string };
    throw new Error(payload.error ?? "Request failed");
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const line = block.split("\n").find((item) => item.startsWith("data: "));
      if (line) onEvent(JSON.parse(line.slice(6)) as AgentEvent);
    }
  }
}

function Sidebar({
  conversations,
  activeId,
  open,
  onClose,
  onCreate,
  onSelect,
  onDelete,
}: {
  conversations: Conversation[];
  activeId?: string;
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      {open && <button className="sidebar-scrim" aria-label="Close conversations" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`} aria-label="Conversations">
        <div className="brand-row">
          <div className="brand-mark"><Sparkles aria-hidden="true" /></div>
          <div>
            <strong>Agent Workspace</strong>
            <span>Workspace · MCP</span>
          </div>
          <button className="icon-button ml-auto lg:hidden" onClick={onClose} aria-label="Close sidebar"><X /></button>
        </div>

        <button className="new-chat-button" onClick={onCreate}>
          <CirclePlus aria-hidden="true" /> New conversation
        </button>

        <div className="conversation-label">Conversations</div>
        <nav className="conversation-list">
          {conversations.map((conversation) => (
            <div className={`conversation-row ${conversation.id === activeId ? "conversation-active" : ""}`} key={conversation.id}>
              <button className="conversation-select" onClick={() => onSelect(conversation.id)}>
                <MessageSquareText aria-hidden="true" />
                <span>
                  <strong>{conversation.title}</strong>
                  <small>{conversation.messages.length} messages</small>
                </span>
              </button>
              <button className="delete-button" onClick={() => onDelete(conversation.id)} aria-label={`Delete ${conversation.title}`}>
                <Trash2 />
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-status">
          <span className="status-dot" />
          <div><strong>Workspace online</strong><small>Offline-ready agent</small></div>
        </div>
      </aside>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const assistant = message.role === "assistant";
  return (
    <article className={`message ${assistant ? "assistant-message" : "user-message"}`}>
      <div className="message-avatar">{assistant ? <Bot /> : "R"}</div>
      <div className="message-body">
        <div className="message-meta">
          <strong>{assistant ? "Workspace agent" : "You"}</strong>
          {message.toolName && <span><Wrench /> {message.toolName}</span>}
        </div>
        <p>{message.content}</p>
      </div>
    </article>
  );
}

function ApprovalCard({ approval, busy, onDecision }: {
  approval: PendingApproval;
  busy: boolean;
  onDecision: (approved: boolean) => void;
}) {
  return (
    <section className="approval-card" aria-labelledby="approval-title">
      <div className="approval-icon"><Wrench /></div>
      <div className="approval-content">
        <p className="eyebrow">Approval required</p>
        <h2 id="approval-title">Allow <code>{approval.toolName}</code>?</h2>
        <p>The agent paused before calling this tool. Review the exact arguments first.</p>
        <pre>{JSON.stringify(approval.arguments, null, 2)}</pre>
        <div className="approval-actions">
          <button className="secondary-button" disabled={busy} onClick={() => onDecision(false)}><X /> Reject</button>
          <button className="primary-button" disabled={busy} onClick={() => onDecision(true)}><Check /> Approve once</button>
        </div>
      </div>
    </section>
  );
}

export function ChatWorkspace() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation>();
  const [input, setInput] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [toolStatus, setToolStatus] = useState<string>();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const refreshList = useCallback(async () => {
    const { conversations } = await json<{ conversations: Conversation[] }>(await fetch("/api/conversations", { cache: "no-store" }));
    setConversations(conversations);
    return conversations;
  }, []);

  const createConversation = useCallback(async () => {
    setBusy(true);
    setError(undefined);
    try {
      const { conversation } = await json<{ conversation: Conversation }>(await fetch("/api/conversations", { method: "POST" }));
      setActive(conversation);
      setConversations((current) => [conversation, ...current]);
      setSidebarOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create a conversation");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const items = await refreshList();
        if (items[0]) setActive(items[0]);
        else await createConversation();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load conversations");
        setBusy(false);
      }
    })();
  }, [createConversation, refreshList]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages, streamedText, toolStatus]);

  const selectConversation = async (id: string) => {
    setBusy(true);
    setError(undefined);
    try {
      const { conversation } = await json<{ conversation: Conversation }>(await fetch(`/api/conversations/${id}`, { cache: "no-store" }));
      setActive(conversation);
      setSidebarOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the conversation");
    } finally {
      setBusy(false);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!window.confirm("Delete this conversation?")) return;
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    const items = await refreshList();
    if (active?.id === id) {
      if (items[0]) await selectConversation(items[0].id);
      else await createConversation();
    }
  };

  const applyEvent = (event: AgentEvent) => {
    if (event.type === "delta") setStreamedText((current) => current + event.text);
    if (event.type === "tool") setToolStatus(event.status === "running" ? event.name : undefined);
    if (event.type === "approval") {
      setActive((current) => current ? { ...current, pendingApproval: event.approval } : current);
      setToolStatus(undefined);
    }
    if (event.type === "done") {
      setActive((current) => current ? {
        ...current,
        messages: [...current.messages, event.message],
        pendingApproval: undefined,
        updatedAt: event.message.createdAt,
      } : current);
      setStreamedText("");
      setToolStatus(undefined);
    }
    if (event.type === "error") setError(event.message);
  };

  const send = async (message: string) => {
    if (!active || !message.trim() || busy || active.pendingApproval) return;
    const text = message.trim();
    const optimistic: ChatMessage = { id: `local-${Date.now()}`, role: "user", content: text, createdAt: new Date().toISOString() };
    setActive({ ...active, title: active.messages.length ? active.title : text.slice(0, 52), messages: [...active.messages, optimistic] });
    setInput("");
    setError(undefined);
    setStreamedText("");
    setBusy(true);
    try {
      await consumeEvents(await fetch(`/api/conversations/${active.id}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text }),
      }), applyEvent);
      await refreshList();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The message could not be sent");
    } finally {
      setBusy(false);
    }
  };

  const decideApproval = async (approved: boolean) => {
    if (!active || busy) return;
    setBusy(true);
    setError(undefined);
    setStreamedText("");
    try {
      await consumeEvents(await fetch(`/api/conversations/${active.id}/approvals`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ approved }),
      }), applyEvent);
      await refreshList();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The decision could not be submitted");
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const empty = !active?.messages.length && !streamedText;

  return (
    <main className="workspace-shell">
      <Sidebar
        conversations={conversations}
        activeId={active?.id}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreate={() => void createConversation()}
        onSelect={(id) => void selectConversation(id)}
        onDelete={(id) => void deleteConversation(id)}
      />

      <section className="chat-panel">
        <header className="topbar">
          <button className="icon-button lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open conversations"><Menu /></button>
          <div>
            <p className="eyebrow">Foundry agent + MCP</p>
            <h1>{active?.title ?? "Agent Workspace"}</h1>
          </div>
          <div className="topbar-badges">
            <span><Database /> Durable threads</span>
            <span><Wrench /> 3 tools</span>
          </div>
        </header>

        <div className="messages" aria-live="polite">
          {empty ? (
            <section className="welcome">
              <div className="welcome-orbit"><Bot /><span /><span /></div>
              <p className="eyebrow">Workspace intelligence</p>
              <h2>Ask. Inspect. Act.</h2>
              <p>Your focused assistant can inspect notes and tasks through a local MCP server. Write actions always pause for your approval.</p>
              <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <button key={suggestion} disabled={busy} onClick={() => void send(suggestion)}>
                    <span>0{index + 1}</span>{suggestion}<ChevronRight />
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <div className="message-stack">
              {active?.messages.map((message) => <MessageBubble key={message.id} message={message} />)}
              {(streamedText || toolStatus) && (
                <article className="message assistant-message">
                  <div className="message-avatar"><Bot /></div>
                  <div className="message-body">
                    <div className="message-meta"><strong>Workspace agent</strong></div>
                    {toolStatus && <div className="tool-running"><Search /> Using {toolStatus}<i /><i /><i /></div>}
                    {streamedText && <p>{streamedText}<span className="cursor" /></p>}
                  </div>
                </article>
              )}
              {active?.pendingApproval && <ApprovalCard approval={active.pendingApproval} busy={busy} onDecision={(value) => void decideApproval(value)} />}
            </div>
          )}
          {error && <div className="error-banner" role="alert"><X /> {error}</div>}
          <div ref={endRef} />
        </div>

        <div className="composer-wrap">
          <form className="composer" onSubmit={submit}>
            <textarea
              aria-label="Message"
              placeholder={active?.pendingApproval ? "Resolve the pending approval to continue" : "Ask about your workspace…"}
              value={input}
              disabled={busy || Boolean(active?.pendingApproval)}
              rows={1}
              maxLength={2000}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
            />
            <button type="submit" disabled={busy || !input.trim() || Boolean(active?.pendingApproval)} aria-label="Send message"><Send /></button>
          </form>
          <p>Agent responses may be inaccurate. Review every tool action before approval.</p>
        </div>
      </section>
    </main>
  );
}
