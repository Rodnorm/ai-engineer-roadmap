# Estudo de Caso: App 01 — Smart Inspector

## 1. Visão Geral
O Smart Inspector é uma aplicação de inspeção visual multimodal. Ela permite o upload de imagens e extrai automaticamente legendas estruturadas, tags de palavras-chave, objetos físicos detectados e transcrição OCR precisa.

## 2. Objetivos Técnicos e de Aprendizado
- Integrar a API de Responses do Azure OpenAI para análise multimodal de imagens.
- Aplicar validação estrita de imagens no servidor (magic bytes, dimensões, remoção de EXIF).
- Implementar modelo duplo de contenção de custos (rate limiting, limite de concorrência, kill switch).

## 3. Arquitetura e Tecnologias
- **Frontend:** Next.js 14, Tailwind CSS, TypeScript.
- **Backend:** FastAPI, Python 3.12, Pillow, Azure OpenAI SDK.

## 4. Decisões de Segurança e Controle de Custos
- **Validação de Imagens:** Uploads inspecionados via Pillow (`Image.open`, `verify`). Limite de dimensões rigoroso (máx. 8000x8000 px / 24M pixels).
- **Remoção de EXIF:** Metadados de câmera e localização removidos em memória antes do envio para o Azure.
- **Rate Limiting:** `InMemoryRateLimiter` limitando a 3 req/min por IP e cota diária de 100 requisições globais.
- **Controle de Concorrência:** `asyncio.Semaphore` limitando operações ativas simultâneas a 2.

## 5. Resultado
O Smart Inspector está blindado, responsivo, internacionalizado em 3 idiomas (`pt-BR`, `en`, `de`) e seguro para demonstração pública.
