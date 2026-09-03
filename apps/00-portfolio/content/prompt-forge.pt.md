# Estudo de Caso: App 03 — Prompt Forge

## 1. Visão Geral
O Prompt Forge é uma bancada interativa para testes e geração de conteúdo corporativo. Ele permite selecionar personas, ajustar parâmetros de geração e visualizar respostas com streaming SSE em tempo real.

## 2. Objetivos Técnicos e de Aprendizado
- Filtragem prévia de moderação com Azure Content Safety antes do consumo de tokens na LLM.
- Implementação de respostas via Server-Sent Events (SSE) sem cache intermediário.
- Armazenamento de histórico 100% no navegador do usuário (`localStorage`), sem persistir dados no servidor.

## 3. Arquitetura e Tecnologias
- **Frontend:** Next.js 16, Tailwind CSS, TypeScript.
- **Backend:** FastAPI, Python 3.12, Azure OpenAI SDK, Azure Content Safety SDK.

## 4. Decisões de Segurança e Confiabilidade
- **Content Safety:** O prompt é inspecionado preventivamente contra discursos de ódio, violência e conteúdo impróprio.
- **Zero-Storage Server:** O servidor não retém prompts nem gera identificadores de clientes no disco.
- **Controle de Vazão:** Rate limiter em memória e semáforo de concorrência ativa.

## 5. Resultado
Uma ferramenta ágil para marketing e engenharia de prompts, rápida e protegida contra abuso.
