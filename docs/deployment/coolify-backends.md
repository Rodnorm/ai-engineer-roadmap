# Deploy dos backends no Coolify

Este monorepo usa **uma aplicação Coolify por backend**. Todos podem rodar no mesmo VPS e no mesmo projeto do Coolify; cada aplicação aponta para seu próprio diretório e Dockerfile. Não é necessário manter um `docker-compose.yml` para esse cenário.

## Matriz de aplicações

| Aplicação | Base Directory | Dockerfile Location | Porta | Health check |
| --- | --- | --- | ---: | --- |
| App 01 — Smart Inspector | `/apps/01-smart-inspector/backend` | `/Dockerfile` | `8000` | `/health` |
| App 02 — Support Bot | `/apps/02-support-bot/backend` | `/Dockerfile` | `8000` | `/health` |
| App 03 — Prompt Forge | `/apps/03-prompt-forge/backend` | `/Dockerfile` | `8000` | `/health` |
| App 04 — pocketRag | `/apps/04-pocket-rag/backend` | `/Dockerfile` | `8000` | `/health` |

> O App 05 ainda não existe na `main`. Quando ele entrar no repositório, adicione um Dockerfile no backend e crie uma quinta aplicação seguindo o mesmo padrão.

## Criar cada aplicação

1. No Coolify, crie um **Project** para o roadmap e conecte este repositório GitHub.
2. Adicione uma **Application** e escolha **Dockerfile** como build pack.
3. Selecione a branch `chore/coolify-backend-deploy` durante a homologação. Depois do merge, altere para `main`.
4. Preencha `Base Directory` e `Dockerfile Location` conforme a tabela.
5. Configure `Ports Exposes` como `8000`.
6. Configure um domínio por backend, por exemplo `api-app01.seudominio.com`.
7. Configure o health check HTTP em `/health`.
8. Ative deploy automático somente para a branch usada em produção.

Repita os passos para cada backend. O proxy do Coolify publica HTTPS; não abra as portas dos containers diretamente no firewall do VPS.

## Variáveis de ambiente

Use o `.env.example` de cada backend como checklist e cadastre os valores reais na tela **Environment Variables** do Coolify. Nunca cole secrets no Dockerfile ou faça commit de `.env`.

Defina pelo menos:

```dotenv
APP_ENV=production
PORT=8000
```

No App 04, configure também a origem exata do frontend:

```dotenv
CORS_ORIGINS=https://frontend-app04.seudominio.com
```

Além dessas variáveis, configure as credenciais Azure e os limites de custo/rate limit indicados em cada arquivo:

- `apps/01-smart-inspector/backend/.env.example`
- `apps/02-support-bot/backend/.env.example`
- `apps/03-prompt-forge/backend/.env.example`
- `apps/04-pocket-rag/backend/.env.example`

## Storage do App 04

O App 04 não usa mais ChromaDB. Os documentos enviados, embeddings, metadados e contadores de rate limit são armazenados em SQLite e arquivos locais dentro de `/app/data`.

- Para uma demo efêmera, não configure volume. Os dados serão perdidos em rebuilds ou redeploys.
- Para manter documentos entre deploys, adicione um **Persistent Storage** no Coolify com destino `/app/data`. Em bind mounts, garanta permissão de escrita para o UID `1000`; volumes Docker normalmente herdam as permissões do diretório criado na imagem.

Não monte somente o arquivo SQLite: o banco e os uploads precisam permanecer sincronizados, portanto persista o diretório `/app/data` inteiro.

## Watch paths recomendados

Para evitar rebuild de todos os serviços a cada commit, configure no Coolify:

| Aplicação | Watch Path |
| --- | --- |
| App 01 | `apps/01-smart-inspector/backend/**` |
| App 02 | `apps/02-support-bot/backend/**` |
| App 03 | `apps/03-prompt-forge/backend/**` |
| App 04 | `apps/04-pocket-rag/backend/**` |

Se mudanças em arquivos compartilhados da raiz passarem a afetar os backends, acrescente esses caminhos às respectivas aplicações.

## Smoke test após o deploy

```bash
curl --fail https://api-app01.seudominio.com/health
curl --fail https://api-app02.seudominio.com/health
curl --fail https://api-app03.seudominio.com/health
curl --fail https://api-app04.seudominio.com/health
```

Todos os comandos devem retornar HTTP `200`. Em seguida, atualize as URLs públicas consumidas pelos frontends para apontar aos novos domínios.
