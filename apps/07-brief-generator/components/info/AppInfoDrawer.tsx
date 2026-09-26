"use client";

import React, { useEffect } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle,
  Cpu,
  Feather,
  Lock,
  Search,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

interface AppInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppInfoDrawer({ isOpen, onClose }: AppInfoDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-violet-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Como Funciona o Brief Generator
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Arquitetura Multi-Agente & Governança
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed">
            {/* 1. O Conceito Multi-Agente */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-wider text-[11px]">
                <Bot className="w-4 h-4" />
                <h4>1. Por que Arquitetura Multi-Agente?</h4>
              </div>
              <p className="text-[var(--text-muted)]">
                Pedir ao mesmo modelo que pesquise evidências extensas e redija uma síntese executiva gera sobrecarga de atenção, alucinações e perda de rastreabilidade (Audit Trail).
              </p>
              <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Isolamento de Tarefas:</strong> Quem investiga foca em fatos e métricas; quem redige foca em clareza executiva e síntese estratégica.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Dossiê Auditável:</strong> Todo dado contido no sumário final possui fonte explícita e nível de confiabilidade mensurável.</span>
                </div>
              </div>
            </section>

            {/* 2. Os Agentes Especializados */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-violet-400 font-bold uppercase tracking-wider text-[11px]">
                <Cpu className="w-4 h-4" />
                <h4>2. Quem São os Agentes</h4>
              </div>

              {/* Researcher Card */}
              <div className="p-3.5 rounded-lg border border-sky-500/20 bg-sky-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Researcher Agent
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Tool Calling
                  </span>
                </div>
                <p className="text-[var(--text-muted)]">
                  Equipado com 3 ferramentas determinísticas: <code>search_facts</code>, <code>verify_claim</code> e <code>extract_metrics</code>. Constrói o <code>ResearchDossier</code> estruturado com schema validado.
                </p>
              </div>

              {/* Writer Card */}
              <div className="p-3.5 rounded-lg border border-violet-500/20 bg-violet-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-400 flex items-center gap-1.5">
                    <Feather className="w-3.5 h-3.5" /> Writer Agent
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    Zero-Tool Synthesis
                  </span>
                </div>
                <p className="text-[var(--text-muted)]">
                  Sem acesso a ferramentas de rede/execução. Consome estritamente o dossiê entregue no handoff e sintetiza um briefing executivo estilo McKinsey / Amazon PR-FAQ.
                </p>
              </div>
            </section>

            {/* 3. Topologia e Protocolo de Handoff */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                <Activity className="w-4 h-4" />
                <h4>3. Topologia do Handoff Trace</h4>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-[11px] space-y-2">
                <div className="flex items-center gap-2 text-sky-400">
                  <span>[1. Researcher]</span>
                  <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>Levanta fatos, métricas e trade-offs</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <span>[2. Handoff]</span>
                  <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>Validação Zod do Schema do Dossiê</span>
                </div>
                <div className="flex items-center gap-2 text-violet-400">
                  <span>[3. Writer]</span>
                  <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                  <span>Redação final e recomendações</span>
                </div>
              </div>
            </section>

            {/* 4. Segurança, Concorrência e Sessão */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <Shield className="w-4 h-4" />
                <h4>4. Governança & Segurança</h4>
              </div>
              <ul className="space-y-2 text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Sessão Privada com HMAC:</strong> Cada usuário possui identificador isolado via cookie assinado (<code>app07-owner</code>). Briefings são visíveis apenas para o seu navegador.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Rate Limit em Memória:</strong> Máximo de 10 requisições por IP a cada minuto para contenção de custos de API.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Semáforo de Concorrência:</strong> Limita o pipeline a 2 execuções simultâneas para prevenir exaustão de TPM da Azure.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Kill-Switch Mestre:</strong> Trava global via <code>GENERATION_ENABLED=false</code> para interrupção emergencial de custos.</span>
                </li>
              </ul>
            </section>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/30 text-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--card-hover-border)] transition-colors"
            >
              Fechar Painel Informativo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
