# Estudo de Caso: App 05 — Agentic Workflow

## Visão Geral

O Agentic Workflow implementa um ciclo autônomo de execução baseado no paradigma ReAct (Pensamento -> Ação -> Observação -> Resposta Final), com chamada de ferramentas determinísticas e autorização obrigatória Human-in-the-Loop (humano no circuito).

## Arquitetura

O FastAPI orquestra um loop iterativo de raciocínio no qual o LLM (ou um planejador determinístico offline) analisa tarefas, seleciona ferramentas a partir de esquemas registrados e avalia os resultados. Ações críticas pausam a máquina de estados da sessão até que um operador revise a ação proposta no Next.js e aprove ou cancele explicitamente a operação.

## Controles de confiabilidade, segurança e custos

- Limite estrito de iterações (máximo de 4 passos) previne loops infinitos e consumo descontrolado de tokens.
- Argumentos de ferramentas são validados antes da execução; fórmulas matemáticas são avaliadas com segurança via AST sem execução dinâmica de código (`eval`).
- Ferramentas sensíveis (`send_alert`) entram em estado persistente de `waiting_approval`, garantindo que nenhuma ação de alto impacto seja disparada sem aprovação humana.
- Rate limiter em memória com três níveis de cota e semáforos de concorrência protegem a infraestrutura do backend.
- Execução 100% testável e funcional offline, sem dependência obrigatória de chaves de API pagas.

## Status

A implementação está completa com suporte multilíngue no frontend (EN, PT, DE), interface de aprovação acessível e cobertura de testes automatizados.
