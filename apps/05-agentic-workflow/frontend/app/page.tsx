'use client';

import React, { useState } from 'react';
import {
  Bot,
  Send,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { runAgentTask, approveAgentTask, AgentStep, PendingApproval } from '@/lib/api';
import { AgentTimeline } from '@/components/AgentTimeline';
import { ApprovalCard } from '@/components/ApprovalCard';
import { QuickPrompts } from '@/components/QuickPrompts';

export default function AgenticWorkflowPage() {
  const [prompt, setPrompt] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<'idle' | 'running' | 'waiting_approval' | 'completed' | 'rejected' | 'error'>('idle');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | undefined>(undefined);
  const [finalAnswer, setFinalAnswer] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async (taskPrompt: string) => {
    if (!taskPrompt.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);
    setStatus('running');
    setFinalAnswer(undefined);
    setPendingApproval(undefined);

    try {
      const response = await runAgentTask(taskPrompt, sessionId);
      setSessionId(response.session_id);
      setStatus(response.status);
      setSteps(response.steps);
      setFinalAnswer(response.final_answer);
      setPendingApproval(response.pending_approval);
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing the task.');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!sessionId || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await approveAgentTask(sessionId, true);
      setStatus(response.status);
      setSteps(response.steps);
      setFinalAnswer(response.final_answer);
      setPendingApproval(undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to authorize agent action.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!sessionId || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await approveAgentTask(sessionId, false, reason);
      setStatus(response.status);
      setSteps(response.steps);
      setFinalAnswer(response.final_answer);
      setPendingApproval(undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel agent action.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setSessionId(undefined);
    setStatus('idle');
    setSteps([]);
    setPendingApproval(undefined);
    setFinalAnswer(undefined);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top App Header */}
        <header className="border-b border-slate-800/80 pb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
                <Bot className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    APP 05
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    PORT 3005
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                  Agentic Workflow
                </h1>
              </div>
            </div>

            {/* Reset Button */}
            {steps.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Session
              </button>
            )}
          </div>

          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Autonomous ReAct agent loop executing multi-step task reasoning, deterministic tool calls, state persistence, and mandatory Human-in-the-Loop authorization for sensitive actions.
          </p>

          {/* Capabilities Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              ReAct Loop (Max 4 Steps)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Tools: Calculator & Knowledge Search
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Human-in-the-Loop (send_alert)
            </span>
          </div>
        </header>

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
                placeholder="Instruct the agent (e.g. 'Calcule quanto é (25 * 40) + 150', 'Qual a política de reembolso?', 'Envie um alerta para @ops-team')..."
                rows={3}
                disabled={isLoading || status === 'waiting_approval'}
                className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all resize-none shadow-inner disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading || status === 'waiting_approval'}
                className="absolute right-3 bottom-3 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-900/30 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Run Agent
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
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <XCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div className="flex-1">{error}</div>
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
            <AgentTimeline steps={steps} />

            {/* Final Answer Banner if Completed */}
            {finalAnswer && status === 'completed' && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Mission Accomplished
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{finalAnswer}</p>
              </div>
            )}

            {/* Final Answer Banner if Rejected */}
            {finalAnswer && status === 'rejected' && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                  <XCircle className="w-4 h-4" />
                  Execution Terminated
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{finalAnswer}</p>
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-900 text-center text-xs text-slate-600">
          AI Engineer Roadmap &bull; App 05: Agentic Workflow &bull; Next.js 15 & FastAPI
        </footer>
      </div>
    </main>
  );
}
