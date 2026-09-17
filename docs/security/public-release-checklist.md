# Public Release Security Audit Checklist

**Data da Auditoria:** 2026-09-03  
**Branch:** `security/public-release-audit`  
**Responsável:** AI Engineer Team  

---

## 1. Escopo e Objetivo

Esta auditoria tem como objetivo verificar o repositório `ai-engineer-roadmap` antes da liberação pública, garantindo que nenhum segredo (chaves de API, tokens, certificados, senhas), arquivo de ambiente privado, banco de dados local ou artefato de build esteja presente no histórico do Git ou nos arquivos rastreados.

---

## 2. Metodologia e Ferramentas Utilizadas

1. **Inspeção do Índice do Git (`git ls-files`):**
   - Listagem completa dos arquivos sob controle de versão.
   - Identificação e remoção de artefatos indevidos (ex: arquivos `.pyc` compilados).

2. **Varredura de Segredos no Histórico (`git log -p --all`):**
   - Execução de script de análise estática cobrindo expressões regulares para chaves Azure OpenAI, Azure AI Services, Bearer tokens, private keys e credenciais de cliente.
   - Resultado: **0 segredos encontrados**.

3. **Revisão de Arquivos `.gitignore`:**
   - Expansão das regras na raiz para ignorar explicitamente `.env`, `.env.*` (exceto `.env.example`), arquivos de certificado (`*.pem`, `*.key`), bancos de dados SQLite/DB, logs, caches Python (`__pycache__`, `.venv`, `.pytest_cache`, `.mypy_cache`, `.ruff_cache`) e diretórios de build (`.next`, `node_modules`, `coverage`, `dist`).

4. **Auditoria dos Arquivos de Exemplo (`.env.example`):**
   - Inspeção de todos os arquivos `.env.example` nos Apps 01, 02, 03, 04, 05 e 06.
   - Confirmação de que contêm **apenas placeholders** sanitizados (ex: `<openai-api-key>`, `<deployment-name>`).

5. **Hardening de Containers e Redes:**
   - Imagens base pinadas com digests imutáveis SHA-256 (`python:3.12-slim@sha256:...`, `node:20-alpine@sha256:...`).
   - `no-new-privileges: true` e `cap_drop: [ALL]` habilitados.
   - Headers de segurança padronizados (HSTS de 2 anos com preload, CSP restritivo, `frame-ancestors 'none'`).

6. **Governança de IA e Avaliações Empíricas:**
   - Suite de avaliação determinística em `evals/run_evals.py` cobrindo injeção de prompt, vazamento de PII, fundamentação de RAG e autorização de ferramentas.
   - Publicação de AI System Cards em `docs/system-cards/` para todas as aplicações.

---

## 3. Checklist de Verificação

| Item | Status | Observações |
| --- | --- | --- |
| Nenhum arquivo `.env` real está rastreado no Git | **APROVADO** | Apenas `.env.example` rastreados |
| Todos os `.env.example` contêm apenas placeholders | **APROVADO** | Verificados Apps 01 a 06 |
| Sem chaves privadas, certificados ou tokens no histórico | **APROVADO** | Gitleaks em CI com 0 achados |
| Caches e artefatos de build ignorados no `.gitignore` | **APROVADO** | `.gitignore` expandido e atualizado |
| Remoção de artefatos legados do índice | **APROVADO** | Repositório limpo sem arquivos temporários |
| Variáveis sensíveis no frontend usando `NEXT_PUBLIC_` | **APROVADO** | Nenhuma credencial exposta via prefixo `NEXT_PUBLIC_` |
| Credenciais em ambientes de deploy | **APROVADO** | Segredos restritos a variáveis de ambiente no Coolify |
| Headers de segurança e CSP | **APROVADO** | Verificados via `tests/test_security_headers.py` |
| Contratos OpenAPI e Types TypeScript | **APROVADO** | Validados via `scripts/export_openapi.py --check` |
| Testes E2E Smoke & A11y (Playwright) | **APROVADO** | 7/7 jornadas críticas aprovadas offline |
| Telemetria sem PII (OpenTelemetry) | **APROVADO** | Semantic conventions aplicadas sem retenção de prompt |
| Suite de Avaliação e System Cards | **APROVADO** | Evals 100% aprovados, AIBOM publicado |

---

## 4. Conclusão de Liberação Pública

Com a conclusão de todas as 7 etapas do `docs/TECHNICAL_HARDENING_ROADMAP.md`, o repositório cumpre integralmente os requisitos de confiabilidade, segurança e transparência para liberação pública.

