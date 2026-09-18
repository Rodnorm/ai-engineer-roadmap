"use client";

import {
  Bot,
  Check,
  ChevronRight,
  CirclePlus,
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
import { useT } from "@/lib/i18n/I18nProvider";
import { LangSwitcher } from "./LangSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { AppInfo } from "./AppInfo";

async function json<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Request failed");
  return payload;
}

async function consumeEvents(response: Response, onEvent: (event: AgentEvent) => void): Promise<void> {
  if (!response.ok || !response.body) {
    const payload = (await response.json().catch(() => ({ error: "Request failed" }))) as { error?: string };
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
  provider = "offline",
  onClose,
  onCreate,
  onSelect,
  onDelete,
}: {
  conversations: Conversation[];
  activeId?: string;
  open: boolean;
  provider?: "offline" | "foundry";
  onClose: () => void;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const appT = useT("app");
  const sidebarT = useT("sidebar");
  const controlsT = useT("controls");

  return (
    <>
      {open && (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label={controlsT("close")}
          onClick={onClose}
        />
      )}
      <aside
        className={`sidebar ${open ? "sidebar-open" : ""}`}
        aria-label={sidebarT("conversations")}
      >
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/60">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            {sidebarT("conversations")}
          </span>
          {/* Close button inside drawer for mobile */}
          <button
            type="button"
            className="control-button size-8 p-0 lg:hidden cursor-pointer"
            onClick={onClose}
            aria-label={controlsT("close")}
            title={controlsT("close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <button type="button" className="new-chat-button" onClick={onCreate}>
          <CirclePlus aria-hidden="true" /> {appT("newConversation")}
        </button>

        <div className="conversation-label">{sidebarT("conversations")}</div>
        <nav className="conversation-list">
          {conversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted">
              {sidebarT("noConversations")}
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                className={`conversation-row ${conversation.id === activeId ? "conversation-active" : ""}`}
                key={conversation.id}
              >
                <button
                  type="button"
                  className="conversation-select"
                  onClick={() => onSelect(conversation.id)}
                >
                  <MessageSquareText aria-hidden="true" />
                  <span>
                    <strong>{conversation.title}</strong>
                    <small>{sidebarT("messagesCount", { count: conversation.messages.length })}</small>
                  </span>
                </button>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => onDelete(conversation.id)}
                  aria-label={`Delete ${conversation.title}`}
                >
                  <Trash2 />
                </button>
              </div>
            ))
          )}
        </nav>

        <div className="sidebar-status">
          <span className="status-dot" />
          <div>
            <strong>{appT("onlineStatus")}</strong>
            <small>{provider === "foundry" ? (appT("foundryStatus") || "Azure Foundry conectado") : appT("offlineStatus")}</small>
          </div>
        </div>
      </aside>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const chatT = useT("chat");
  const assistant = message.role === "assistant";
  return (
    <article className={`message ${assistant ? "assistant-message" : "user-message"}`}>
      <div className="message-avatar">{assistant ? <Bot /> : "R"}</div>
      <div className="message-body">
        <div className="message-meta">
          <strong>{assistant ? chatT("agent") : chatT("you")}</strong>
          {message.toolName && (
            <span>
              <Wrench /> {message.toolName}
            </span>
          )}
        </div>
        <p>{message.content}</p>
      </div>
    </article>
  );
}

function ApprovalCard({
  approval,
  busy,
  onDecision,
}: {
  approval: PendingApproval;
  busy: boolean;
  onDecision: (approved: boolean) => void;
}) {
  const chatT = useT("chat");
  return (
    <section className="approval-card" aria-labelledby="approval-title">
      <div className="approval-icon">
        <Wrench />
      </div>
      <div className="approval-content">
        <p className="eyebrow">{chatT("approvalEyebrow")}</p>
        <h2 id="approval-title">{chatT("approvalTitle", { tool: approval.toolName })}</h2>
        <p>{chatT("approvalDescription")}</p>
        <pre>{JSON.stringify(approval.arguments, null, 2)}</pre>
        <div className="approval-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={busy}
            onClick={() => onDecision(false)}
          >
            <X /> {chatT("approvalReject")}
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={busy}
            onClick={() => onDecision(true)}
          >
            <Check /> {chatT("approvalApprove")}
          </button>
        </div>
      </div>
    </section>
  );
}

export function ChatWorkspace({
  provider = "offline",
}: {
  provider?: "offline" | "foundry";
} = {}) {
  const appT = useT("app");
  const controlsT = useT("controls");
  const welcomeT = useT("welcome");
  const chatT = useT("chat");
  const composerT = useT("composer");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation>();
  const [input, setInput] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [toolStatus, setToolStatus] = useState<string>();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string>();

  // Responsive sidebar open state: opens on desktop, closes on mobile initially
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  const endRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    welcomeT("suggestion1"),
    welcomeT("suggestion2"),
    welcomeT("suggestion3"),
    welcomeT("suggestion4"),
    welcomeT("suggestion5"),
    welcomeT("suggestion6"),
    welcomeT("suggestion7"),
    welcomeT("suggestion8"),
    welcomeT("suggestion9"),
    welcomeT("suggestion10"),
    welcomeT("suggestion11"),
    welcomeT("suggestion12"),
  ];

  const refreshList = useCallback(async () => {
    const { conversations } = await json<{ conversations: Conversation[] }>(
      await fetch("/api/conversations", { cache: "no-store" })
    );
    setConversations(conversations);
    return conversations;
  }, []);

  const createConversation = useCallback(async () => {
    setBusy(true);
    setError(undefined);
    try {
      const { conversation } = await json<{ conversation: Conversation }>(
        await fetch("/api/conversations", { method: "POST" })
      );
      setActive(conversation);
      setConversations((current) => [conversation, ...current]);
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
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
      const { conversation } = await json<{ conversation: Conversation }>(
        await fetch(`/api/conversations/${id}`, { cache: "no-store" })
      );
      setActive(conversation);
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the conversation");
    } finally {
      setBusy(false);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!window.confirm(appT("deleteConfirm"))) return;
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
      setActive((current) => (current ? { ...current, pendingApproval: event.approval } : current));
      setToolStatus(undefined);
    }
    if (event.type === "done") {
      setActive((current) =>
        current
          ? {
              ...current,
              messages: [...current.messages, event.message],
              pendingApproval: undefined,
              updatedAt: event.message.createdAt,
            }
          : current
      );
      setStreamedText("");
      setToolStatus(undefined);
    }
    if (event.type === "error") setError(event.message);
  };

  const send = async (message: string) => {
    if (!active || !message.trim() || busy || active.pendingApproval) return;
    const text = message.trim();
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setActive({
      ...active,
      title: active.messages.length ? active.title : text.slice(0, 52),
      messages: [...active.messages, optimistic],
    });
    setInput("");
    setError(undefined);
    setStreamedText("");
    setBusy(true);
    try {
      await consumeEvents(
        await fetch(`/api/conversations/${active.id}/messages`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: text }),
        }),
        applyEvent
      );
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
      await consumeEvents(
        await fetch(`/api/conversations/${active.id}/approvals`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ approved }),
        }),
        applyEvent
      );
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
      <header className="topbar">
        <div className="flex items-center gap-3">
          {/* Permanent hamburger toggle button */}
          <button
            type="button"
            className="control-button size-9 p-0 shrink-0 cursor-pointer"
            onClick={() => setSidebarOpen((curr) => !curr)}
            aria-label={controlsT("toggleSidebar")}
            title={controlsT("toggleSidebar")}
          >
            <Menu className="size-4 text-muted hover:text-text transition-colors" />
          </button>
          <div className="brand-mark hidden sm:grid">
            <Sparkles aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">{appT("eyebrow")}</p>
            <h1>{active?.title ?? appT("title")}</h1>
          </div>
        </div>

        <div className="topbar-controls">
          <LangSwitcher />
          <ThemeToggle />
          <AppInfo />
        </div>
      </header>

      <div className="workspace-body">
        <Sidebar
          conversations={conversations}
          activeId={active?.id}
          open={sidebarOpen}
          provider={provider}
          onClose={() => setSidebarOpen(false)}
          onCreate={() => void createConversation()}
          onSelect={(id) => void selectConversation(id)}
          onDelete={(id) => void deleteConversation(id)}
        />

        <section className="chat-panel">
          <div className="messages" aria-live="polite">
          {empty ? (
            <section className="welcome">
              <div className="welcome-orbit">
                <Bot />
                <span />
                <span />
              </div>
              <p className="eyebrow">{welcomeT("eyebrow")}</p>
              <h2>{welcomeT("title")}</h2>
              <p>{welcomeT("description")}</p>
              <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={busy}
                    onClick={() => void send(suggestion)}
                  >
                    <span>{index < 9 ? `0${index + 1}` : index + 1}</span>
                    {suggestion}
                    <ChevronRight />
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <div className="message-stack">
              {active?.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {(streamedText || toolStatus) && (
                <article className="message assistant-message">
                  <div className="message-avatar">
                    <Bot />
                  </div>
                  <div className="message-body">
                    <div className="message-meta">
                      <strong>{chatT("agent")}</strong>
                    </div>
                    {toolStatus && (
                      <div className="tool-running">
                        <Search /> {chatT("usingTool", { tool: toolStatus })}
                        <i />
                        <i />
                        <i />
                      </div>
                    )}
                    {streamedText && (
                      <p>
                        {streamedText}
                        <span className="cursor" />
                      </p>
                    )}
                  </div>
                </article>
              )}
              {active?.pendingApproval && (
                <ApprovalCard
                  approval={active.pendingApproval}
                  busy={busy}
                  onDecision={(value) => void decideApproval(value)}
                />
              )}
            </div>
          )}
          {error && (
            <div className="error-banner" role="alert">
              <X /> {error}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="composer-wrap">
          <form className="composer" onSubmit={submit}>
            <textarea
              aria-label="Message"
              placeholder={
                active?.pendingApproval
                  ? composerT("placeholderBlocked")
                  : composerT("placeholder")
              }
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
            <button
              type="submit"
              disabled={busy || !input.trim() || Boolean(active?.pendingApproval)}
              aria-label={composerT("send")}
            >
              <Send />
            </button>
          </form>
          <p>{composerT("disclaimer")}</p>
        </div>
      </section>
    </div>
  </main>
  );
}
