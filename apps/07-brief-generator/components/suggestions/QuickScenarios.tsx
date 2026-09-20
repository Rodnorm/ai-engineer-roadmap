"use client";

import React, { useState } from "react";
import { BriefTone } from "@/types/agent";
import {
  Boxes,
  Check,
  Code2,
  Cpu,
  Database,
  DollarSign,
  FileCode,
  Gauge,
  Leaf,
  Lock,
  Network,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";

export interface ScenarioItem {
  id: number;
  category: string;
  title: string;
  topic: string;
  scope: string;
  tone: BriefTone;
  focus: string;
  iconName: string;
}

export const COMPLETE_SCENARIOS: ScenarioItem[] = [
  {
    id: 1,
    category: "Arquitetura",
    title: "Monólito Modular vs Microsserviços",
    topic:
      "Avaliação comparativa de transição de um e-commerce em monólito para monólito modular vs microsserviços orientados a eventos.",
    scope: "Arquitetura e Latência de Rede",
    tone: "technical",
    focus: "Latência de rede, overhead operacional, custos de infra e complexidade de deploy.",
    iconName: "Boxes",
  },
  {
    id: 2,
    category: "Segurança",
    title: "Implementação de Zero Trust Híbrido",
    topic:
      "Estratégia de modernização de segurança para uma empresa financeira migrando para modelo Zero Trust em nuvem híbrida (Azure e On-Premises).",
    scope: "Segurança e Conformidade LGPD/BACEN",
    tone: "executive",
    focus: "Gestão de identidades (Entra ID), micro-segmentação de rede e conformidade regulatória.",
    iconName: "Lock",
  },
  {
    id: 3,
    category: "Inteligência Artificial",
    title: "RAG Privado vs Fine-Tuning de SLM",
    topic:
      "Trade-offs técnicos e de custo entre arquitetura RAG com Azure AI Search vs Fine-Tuning de SLMs (Phi-4/Llama 3) para análise de contratos jurídicos.",
    scope: "Inteligência Artificial & FinOps",
    tone: "critical",
    focus: "Acurácia, janelas de contexto, custos de inferência, vazamento de PII e facilidade de atualização.",
    iconName: "Cpu",
  },
  {
    id: 4,
    category: "FinOps & Cloud",
    title: "Redução de Custos em Clusters Kubernetes",
    topic:
      "Plano de otimização de custos e FinOps para clusters Azure Kubernetes Service (AKS) com cargas de trabalho sazonais e autoscale agressivo.",
    scope: "FinOps & Infraestrutura Cloud",
    tone: "executive",
    focus: "Spot Instances, Savings Plans, direitos de dimensionamento (rightsizing) e KEDA.",
    iconName: "DollarSign",
  },
  {
    id: 5,
    category: "Governança de Dados",
    title: "Adoção de Data Mesh Corporativo",
    topic:
      "Viabilidade e desafios operacionais de migrar de um Data Lakehouse centralizado para uma arquitetura descentralizada de Data Mesh.",
    scope: "Estratégia de Dados & Governança",
    tone: "executive",
    focus: "Propriedade dos dados por domínio, governança federada, interoperabilidade e gargalos culturais.",
    iconName: "Database",
  },
  {
    id: 6,
    category: "DevOps & CI/CD",
    title: "Migração de Jenkins para GitHub Actions",
    topic:
      "Plano de migração e riscos de esteiras legadas do Jenkins On-Premises para GitHub Actions Enterprise com runners auto-hospedados.",
    scope: "Engenharia de Plataforma & DevOps",
    tone: "technical",
    focus: "Compatibilidade de plugins, tempo de builds, segurança de segredos e curva da equipe.",
    iconName: "FileCode",
  },
  {
    id: 7,
    category: "SRE & Confiabilidade",
    title: "Definição de SLOs e Error Budgets",
    topic:
      "Estruturação de Service Level Objectives (SLOs), Service Level Indicators (SLIs) e políticas de Error Budget para APIs de pagamento críticas.",
    scope: "Operações & Confiabilidade",
    tone: "executive",
    focus: "Consequências de esgotamento de budget, alertas inteligentes e equilíbrio entre velocidade e estabilidade.",
    iconName: "Gauge",
  },
  {
    id: 8,
    category: "Banco de Dados",
    title: "PostgreSQL Relacional vs Azure Cosmos DB",
    topic:
      "Análise de migração de um banco PostgreSQL relacional de alta escrita para Azure Cosmos DB NoSQL com particionamento global.",
    scope: "Engenharia de Dados & Armazenamento",
    tone: "technical",
    focus: "Modelagem desnormalizada, consistência eventual, custos de Request Units (RUs) e migração de schema.",
    iconName: "Database",
  },
  {
    id: 9,
    category: "Segurança em IA",
    title: "Mitigação de Prompt Injection em Agentes",
    topic:
      "Guia executivo de vetores de ataque em agentes autônomos (OWASP LLM01 - Prompt Injection) e defesas com Azure AI Content Safety e Prompt Shields.",
    scope: "Segurança Ofensiva & Defensiva em IA",
    tone: "critical",
    focus: "Ataques indiretos via documentos externos, contenção de privilégios de ferramentas e isolamento.",
    iconName: "ShieldAlert",
  },
  {
    id: 10,
    category: "Estratégia de Produto",
    title: "Modelo Freemium vs 14-Day Free Trial B2B",
    topic:
      "Estudo comparativo de conversão e unit economics para produto SaaS B2B: modelo Freemium com limites de uso vs Trial gratuito ilimitado de 14 dias.",
    scope: "Gestão de Produto & Economia Unitária",
    tone: "executive",
    focus: "CAC, LTV, churn precoce, atrito de onboarding e qualificação de leads por produto (PQLs).",
    iconName: "Users",
  },
  {
    id: 11,
    category: "Gestão & Cultura",
    title: "Política de Engenharia 100% Assíncrona",
    topic:
      "Diretrizes executivas para adoção de comunicação assíncrona profunda e documentação contínua em times globais de engenharia de software.",
    scope: "Liderança de Engenharia & Cultura",
    tone: "executive",
    focus: "Redução de reuniões síncronas, rastreabilidade de decisões técnicas (ADRs) e prevenção de isolamento.",
    iconName: "Users",
  },
  {
    id: 12,
    category: "ESG & Sustentabilidade",
    title: "Otimização de Eficiência de Carbono em Nuvem",
    topic:
      "Estratégia de Green Computing para redução de pegada de carbono em data centers de nuvem pública e relatórios ESG de sustentabilidade tecnológica.",
    scope: "Sustentabilidade & Eficiência de Carbono",
    tone: "executive",
    focus: "Seleção de regiões de baixo carbono, medição de intensidade de carbono e otimização de ciclos ociosos.",
    iconName: "Leaf",
  },
];

interface QuickScenariosProps {
  onSelect: (scenario: ScenarioItem) => void;
  activeTopic?: string;
}

export function QuickScenarios({ onSelect, activeTopic }: QuickScenariosProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const categories = [
    "Todos",
    "Arquitetura",
    "Segurança",
    "Inteligência Artificial",
    "FinOps & Cloud",
    "SRE & Confiabilidade",
    "Banco de Dados",
    "Gestão & Cultura",
  ];

  const filtered =
    selectedCategory === "Todos"
      ? COMPLETE_SCENARIOS
      : COMPLETE_SCENARIOS.filter((s) => s.category.includes(selectedCategory));

  return (
    <div className="space-y-3">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap text-xs font-medium transition-all ${
              selectedCategory === cat
                ? "bg-[var(--accent-agent-research)] text-white shadow-sm"
                : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => {
          const isSelected = activeTopic === item.topic;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-[var(--accent-agent-research)] bg-sky-500/10 shadow-sm"
                  : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--card-hover-border)] hover:-translate-y-0.5"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-agent-research)] px-2 py-0.5 rounded-md bg-sky-500/10">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    #{item.id}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {item.topic}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--border-subtle)]/60 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="capitalize font-mono">Tom: {item.tone}</span>
                <span className="text-[var(--accent-agent-writer)] font-semibold flex items-center gap-1">
                  Carregar <Sparkles className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
