# Estudo de Caso: App 04 — pocketRag

## Visão geral

O pocketRag é uma base de conhecimento privada e multilíngue para documentos PDF, Markdown, TXT e DOCX. Ele preserva os arquivos enviados por um período limitado, indexa o conteúdo e retorna respostas fundamentadas com citações inline verificáveis.

## Arquitetura

O FastAPI valida e processa uploads com limites definidos. O Azure OpenAI cria vetores com o modelo `text-embedding-3-small`, enquanto o SQLite armazena metadados, chunks, embeddings, cotas compartilhadas e eventos de geração. A recuperação calcula similaridade de cosseno diretamente com SQLite/NumPy, sem depender de um serviço separado de banco vetorial. O Next.js oferece gerenciamento de documentos, exemplos fictícios em alemão, perguntas sugeridas, chat, telemetria e diálogos de citação acessíveis por teclado.

## Confiabilidade, privacidade e controle de custos

- As operações de upload e exclusão coordenam arquivos originais, metadados e vetores no SQLite com mecanismos de rollback.
- Uploads pessoais expiram após 30 minutos por uma rotina no servidor; os documentos de exemplo ficam isolados e não expiram.
- Em produção, uma chave bearer privada é obrigatória; o modo foi projetado para um único usuário, não como demonstração pública multi-tenant.
- A recuperação se abstém quando as evidências são fracas, trata o texto dos documentos como dado não confiável e rejeita referências de citação desconhecidas.
- Cotas compartilhadas no SQLite, limites de contexto e saída, timeout, retentativas, controle de concorrência e kill switch protegem o uso pago do Azure.
- Os testes usam armazenamento temporário, embeddings determinísticos, um LLM simulado e rede bloqueada.

## Status

A implementação, a cobertura de CI, os documentos de exemplo e as ferramentas reproduzíveis de RAGAS estão concluídos. Resultados medidos do RAGAS e evidências de persistência após reinício no host definitivo ainda são critérios de lançamento; por isso, o app permanece marcado como em desenvolvimento.
