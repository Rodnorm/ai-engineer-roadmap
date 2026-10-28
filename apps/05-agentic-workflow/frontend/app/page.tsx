'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { runAgentTask, approveAgentTask, AgentStep, PendingApproval } from '@/lib/api';
import { I18nProvider, useT } from '@/lib/i18n/I18nProvider';
import { Header } from '@/components/Header';
import { AgentTimeline } from '@/components/AgentTimeline';
import { ApprovalCard } from '@/components/ApprovalCard';
import { QuickPrompts } from '@/components/QuickPrompts';

function AgenticWorkflowContent() {
  const tApp = useT('app');
  const tTimeline = useT('timeline');

  const [prompt, setPrompt] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [sessionToken, setSessionToken] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<'idle' | 'running' | 'waiting_approval' | 'completed' | 'rejected' | 'error'>('idle');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | undefined>(undefined);
  const [finalAnswer, setFinalAnswer] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cancelRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const staggerRevealSteps = useCallback(
    async (allSteps: AgentStep[], startIndex: number, onComplete: () => void) => {
      if (allSteps.length <= startIndex) {
        setSteps(allSteps);
        onComplete();
        return;
      }

      for (let i = startIndex + 1; i <= allSteps.length; i++) {
        if (cancelRef.current) return;
        setSteps(allSteps.slice(0, i));
        if (i < allSteps.length) {
          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(resolve, 450);
          });
        }
      }

      if (!cancelRef.current) {
        onComplete();
      }
    },
    [],
  );

  const handleRun = async (taskPrompt: string) => {
    if (!taskPrompt.trim() || isLoading) return;

    cancelRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setError(null);
    setIsLoading(true);
    setStatus('running');
    setSteps([]);
    setFinalAnswer(undefined);
    setPendingApproval(undefined);
    setSessionId(undefined);
    setSessionToken(undefined);

    try {
      const response = await runAgentTask(taskPrompt);
      setSessionId(response.session_id);
      setSessionToken(response.session_token);

      await staggerRevealSteps(response.steps, 0, () => {
        setStatus(response.status);
        setPendingApproval(response.pending_approval);
        setFinalAnswer(response.final_answer);
        setIsLoading(false);
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing the task.');
      setStatus('error');
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!sessionId || !sessionToken || isLoading) return;
    cancelRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsLoading(true);
    setError(null);
    setPendingApproval(undefined);

    const prevCount = steps.length;

    try {
      const response = await approveAgentTask(sessionId, sessionToken, true);
      await staggerRevealSteps(response.steps, prevCount, () => {
        setStatus(response.status);
        setSteps(response.steps);
        setFinalAnswer(response.final_answer);
        setPendingApproval(undefined);
        setIsLoading(false);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to authorize agent action.');
      setIsLoading(false);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!sessionId || !sessionToken || isLoading) return;
    cancelRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsLoading(true);
    setError(null);
    setPendingApproval(undefined);

    const prevCount = steps.length;

    try {
      const response = await approveAgentTask(sessionId, sessionToken, false, reason);
      await staggerRevealSteps(response.steps, prevCount, () => {
        setStatus(response.status);
        setSteps(response.steps);
        setFinalAnswer(response.final_answer);
        setPendingApproval(undefined);
        setIsLoading(false);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to cancel agent action.');
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    cancelRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPrompt('');
    setSessionId(undefined);
    setSessionToken(undefined);
    setStatus('idle');
    setSteps([]);
    setPendingApproval(undefined);
    setFinalAnswer(undefined);
    setError(null);
    setIsLoading(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40';
      case 'waiting_approval':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/40';
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40';
      case 'rejected':
      case 'error':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/40';
      default:
        return 'text-muted bg-surface border-border';
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <Header hasSteps={steps.length > 0} onReset={handleReset} />

        {/* SCADA Telemetry Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border border-border bg-panel p-2.5 rounded-xs font-mono text-xs">
          <div className="flex items-center gap-2">
            <Activity className="size-3.5 text-accent" />
            <span className="text-muted text-[11px] uppercase tracking-wider">LOOP_STATE:</span>
            <span className={`px-2 py-0.5 rounded-xs border text-[10px] font-bold uppercase tracking-wider ${getStatusColor()}`}>
              {status}
            </span>
          </div>

          <div className="flex items-center gap-4 text-muted text-[11px]">
            {sessionId && (
              <span>
                RUN_ID: <span className="text-text font-bold">#{sessionId.slice(0, 8)}</span>
              </span>
            )}
            <span>
              STEPS: <span className="text-text font-bold">{steps.length}</span>
            </span>
          </div>
        </div>

        {/* Task Input Section */}
        <section className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRun(prompt);
            }}
            className="space-y-2.5"
          >
            <div className="relative border border-border bg-panel rounded-xs focus-within:border-accent">
              <div className="flex items-center justify-between border-b border-border px-3 py-1.5 font-mono text-[10px] uppercase text-muted">
                <span>{"//"} MISSION_OBJECTIVE_CONSOLE</span>
                <span className="text-accent">[RE-ACT ENGINE v0.5]</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={tApp('inputPlaceholder')}
                rows={3}
                disabled={isLoading || status === 'waiting_approval'}
                className="w-full bg-transparent p-3 text-xs sm:text-sm text-text placeholder:text-muted/60 focus:outline-none resize-none font-mono leading-relaxed disabled:opacity-50"
              />
              <div className="flex items-center justify-between border-t border-border px-3 py-2 bg-surface/40">
                <span className="font-mono text-[10px] text-muted hidden sm:inline">
                  {prompt.length} chars
                </span>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading || status === 'waiting_approval'}
                  className="ml-auto px-3.5 py-1.5 rounded-xs text-xs font-mono font-medium uppercase tracking-wider text-white bg-accent hover:bg-accent-strong border border-accent/80 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Clock className="size-3 animate-spin" />
                      <span>[ {tApp('runningButton')} ]</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-3" />
                      <span>[ {tApp('runButton')} ↵ ]</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Suggested Quick Prompts */}
          {steps.length === 0 && (
            <QuickPrompts
              onSelectPrompt={(p) => {
                setPrompt(p);
                handleRun(p);
              }}
              disabled={isLoading}
            />
          )}
        </section>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xs bg-rose-500/10 border border-rose-500/40 text-rose-500 text-xs font-mono flex items-center gap-2.5 animate-fade-to-light">
            <XCircle className="size-4 shrink-0 text-rose-500" />
            <div className="flex-1">[!] FAULT: {error}</div>
          </div>
        )}

        {/* Human-in-the-Loop Approval Modal/Card */}
        {status === 'waiting_approval' && pendingApproval && (
          <ApprovalCard
            pending={pendingApproval}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={isLoading}
          />
        )}

        {/* Execution Timeline */}
        {steps.length > 0 && (
          <section className="space-y-5 pt-2">
            <AgentTimeline steps={steps} isThinking={isLoading} />

            {/* Final Answer Banner if Completed */}
            {finalAnswer && status === 'completed' && (
              <div className="p-4 rounded-xs bg-emerald-500/10 border border-emerald-500/40 space-y-1.5 animate-fade-to-light font-mono">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="size-3.5" />
                  <span>{"//"} {tTimeline('completedTitle')}</span>
                </div>
                <p className="text-text text-xs leading-relaxed font-sans whitespace-pre-wrap">{finalAnswer}</p>
              </div>
            )}

            {/* Final Answer Banner if Rejected */}
            {finalAnswer && status === 'rejected' && (
              <div className="p-4 rounded-xs bg-rose-500/10 border border-rose-500/40 space-y-1.5 animate-fade-to-light font-mono">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <XCircle className="size-3.5" />
                  <span>{"//"} {tTimeline('rejectedTitle')}</span>
                </div>
                <p className="text-text text-xs leading-relaxed font-sans whitespace-pre-wrap">{finalAnswer}</p>
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="pt-6 border-t border-border text-center font-mono text-[0.7rem] text-muted">
          {tApp('footer')}
        </footer>
      </div>
    </main>
  );
}

export default function AgenticWorkflowPage() {
  return (
    <I18nProvider>
      <AgenticWorkflowContent />
    </I18nProvider>
  );
}
