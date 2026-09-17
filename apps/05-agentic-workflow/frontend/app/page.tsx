'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  CheckCircle2,
  XCircle,
  Clock,
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
            timeoutRef.current = setTimeout(resolve, 550);
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

  return (
    <main className="min-h-screen bg-bg text-text p-4 sm:p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-8">
        <Header hasSteps={steps.length > 0} onReset={handleReset} />

        {/* Task Input Section */}
        <section className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRun(prompt);
            }}
            className="space-y-3"
          >
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={tApp('inputPlaceholder')}
                rows={3}
                disabled={isLoading || status === 'waiting_approval'}
                className="w-full rounded-2xl bg-panel border border-border p-4 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all resize-none shadow-xs disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading || status === 'waiting_approval'}
                className="absolute right-3 bottom-3 min-h-9 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-accent hover:bg-accent-strong shadow-md shadow-accent/20 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    {tApp('runningButton')}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    {tApp('runButton')}
                  </>
                )}
              </button>
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
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-sm flex items-center gap-3 animate-in fade-in duration-200">
            <XCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <div className="flex-1 text-xs sm:text-sm">{error}</div>
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
          <section className="space-y-6 pt-2">
            <AgentTimeline steps={steps} isThinking={isLoading} />

            {/* Final Answer Banner if Completed */}
            {finalAnswer && status === 'completed' && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {tTimeline('completedTitle')}
                </div>
                <p className="text-text text-xs sm:text-sm leading-relaxed">{finalAnswer}</p>
              </div>
            )}

            {/* Final Answer Banner if Rejected */}
            {finalAnswer && status === 'rejected' && (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                  <XCircle className="w-4 h-4" />
                  {tTimeline('rejectedTitle')}
                </div>
                <p className="text-text text-xs sm:text-sm leading-relaxed">{finalAnswer}</p>
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-border text-center text-xs text-muted">
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
