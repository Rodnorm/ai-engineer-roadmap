# Estudo de Caso: App 02 — Support Bot

## 1. Visão Geral
O Support Bot é um assistente de inteligência artificial voltado para faturamento na área da saúde. Ele processa solicitações de pacientes em linguagem natural e consulta uma base de FAQ oficial com respostas estritamente fundamentadas.

## 2. Objetivos Técnicos e de Aprendizado
- Integrar serviços do Azure AI Language (detecção de idioma, análise de sentimento e extração de termos-chave).
- Mascarar entidades de dados sensíveis (PII) antes de registrar logs ou acionar LLMs.
- Aplicar isolamento contra prompt injection em inputs não confiáveis utilizando tags XML delimitadoras.

## 3. Arquitetura e Tecnologias
- **Frontend:** Next.js 16, Tailwind CSS, TypeScript.
- **Backend:** FastAPI, Python 3.12, Azure AI Language SDK, Azure AI Agents SDK.

## 4. Decisões de Segurança e Confiabilidade
- **Proteção de PII:** Dados de cartões e identificadores pessoais são mascarados via regex e Azure Text Analytics.
- **Isolamento de Prompts:** Perguntas de usuários são demarcadas com `<user_input>` com regras estritas para a LLM ignorar tentativas de sobrescrita de instruções.
- **Limites de Cota:** Proteção contra abusos por meio de rate limiting em memória no backend.

## 5. Resultado
Um assistente de suporte focado, seguro contra vazamentos de dados de pacientes e alinhado a conformidades de saúde.
