# Estudo de Caso: App 07 — Multi-Agent Brief Generator

## Visão Geral

Líderes de engenharia e arquitetos corporativos frequentemente enfrentam o desafio de equilibrar uma pesquisa técnica aprofundada com uma comunicação executiva clara e persuasiva. Análises arquiteturais geram registros dispersos de benchmarks, riscos e restrições, enquanto executivos demandam sínteses concisas, focadas em trade-offs e sem alucinações técnicas. Abordagens de prompt único tendem a sobrecarregar a liderança com detalhes de baixo nível ou omitir atritos arquiteturais essenciais.

## Solução

O Multi-Agent Brief Generator implementa um pipeline multi-agente heterogêneo de dois estágios que separa estritamente as fases de investigação e redação executiva:

1. **Agente Pesquisador (Researcher Agent):** Equipado com ferramentas de investigação determinísticas (`search_facts`, `verify_claim`, `extract_metrics`) e heurísticas especializadas para coletar evidências, verificar alegações e mapear pontos de atrito operacional.
2. **Orquestrador e Protocolo de Handoff:** Valida o dossiê de pesquisa contra um esquema de dados estrito, estima a volumetria de tokens e injeta os achados estruturados no estágio downstream por meio de um protocolo de contexto com zero ferramentas.
3. **Agente Redator (Writer Agent):** Especialista em síntese executiva sem ferramentas, instruído a estruturar o documento em 5 seções estratégicas (Sumário Executivo, Evidências e Fatos Principais, Métricas Operacionais e Benchmarks, Riscos e Trade-offs Arquiteturais, e Recomendações Práticas de Ação).

A interface oferece telemetria em streaming contínuo via Server-Sent Events (SSE), gaveta de inspeção técnica de runtime, catálogo de 12 cenários rápidos e isolamento de sessão do navegador.

## Decisões de Arquitetura

- **Especialização Heterogênea:** O Agente Pesquisador tem acesso a ferramentas de coleta e validação; o Agente Redator opera sem ferramentas para evitar alucinações na invocação de APIs durante a produção do texto executivo.
- **Contratos de Dados Rígidos:** Os limites entre agentes são mediados por esquemas Zod validados em tempo de execução, garantindo rastreabilidade e reprodutibilidade.
- **Camada Dual Agnóstica de Provedor:** Funciona com modelos Azure OpenAI em produção ou com um motor determinístico offline para testes e integração contínua (CI) sem custos.
- **Protocolo de Telemetria Streaming:** SSE transmite passos de progresso, estimativas de tokens e transições de fase em tempo real sem polling.
- **Isolamento Criptográfico de Sessão:** Espaços de trabalho e histórico de briefs são isolados no navegador via cookies assinados com HMAC-SHA256, sem exigir cadastro de usuário.

## Controles de Segurança, Confiabilidade e Custos

- Validação estrita de tamanho em tópicos e escopos para evitar injeção de prompt e esgotamento de memória.
- Limite configurável de rodadas de pesquisa (`MAX_RESEARCH_ROUNDS`) para controlar a profundidade de investigação e uso de APIs.
- Semáforo global de concorrência e rate limiting por IP de cliente protegem a capacidade do servidor.
- Kill-switch administrativo (`GENERATION_ENABLED`) permite suspensão imediata da funcionalidade quando necessário.
- Consultas de usuários e conteúdos de briefs não são persistidos em logs do servidor.

## Validação

- Testes automatizados cobrem o pipeline ponta a ponta, rate limiting, kill-switch, limite de rodadas e integridade do token de sessão.
- Execução 100% testável offline em CI sem dependência de credenciais externas de nuvem.
- Validação completa com verificação de tipos em TypeScript e build de produção no Next.js.

## O que este projeto demonstra

O projeto demonstra orquestração avançada de múltiplos agentes especializados, handoff tipado de dados, telemetria em streaming, segurança de sessão no navegador e governança de custos e riscos em arquitetura fullstack TypeScript.
