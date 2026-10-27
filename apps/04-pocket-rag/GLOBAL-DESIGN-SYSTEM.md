# GLOBAL DESIGN SYSTEM — INDUSTRIAL TERMINAL / DEVTOOL EDITION
> **Inspiração:** Railway, Supabase, Warp Terminal, Bloomberg Terminal, Retool CLI.
> **Filosofia:** Ferramenta de precisão, densidade de dados alta, zero firula ("no-bullshit"), estética técnica, bordas nítidas e contraste intencional.

---

## 1. Regras Mestres Anti-"AI Slop" (Para Todos os Apps)

1. **Adeus ao Azul Escuro Clichê:** Proibido fundos `#0f172a` ou gradientes roxo/azul padrão de template. Usar preto asfalto/carvão profundo.
2. **Bordas Nítidas e Técnicas:** Cantos com raio pequeno (`rounded-sm` ou `rounded-none`), separadores finos de 1px (`border-zinc-800`), sem sombras borradas grandes.
3. **Tipografia Monospaçada Funcional:** Títulos, comandos, métricas e tags em fonte mono; corpo em sans-serif limpa e densa.
4. **Telemetria Integrada (Statusline):** Em vez de cards gigantes de métricas ocupando a tela, usar uma barra de status estilo VIM/Terminal no rodapé ou no topo.
5. **Micro-Identidade por App (Accent Único):**
   * **App 1:** Âmbar Terminal (`#F59E0B` / `text-amber-400`)
   * **App 2:** Verde Fósforo (`#10B981` / `text-emerald-400`)
   * **App 3:** Ciano Radar (`#06B6D4` / `text-cyan-400`)
   * **App 4 (pocketRag):** Laranja Industrial / Rust (`#F97316` / `text-orange-500`) ou Verde Hacker Matrix.

---

## 2. Tokens de Design (pocketRag — Industrial Terminal)

### Paleta de Cores
```css
/* Backgrounds */
--bg-root: #0A0A0C;          /* Preto absoluto técnico */
--bg-panel: #111115;         /* Superfície do terminal / painel */
--bg-subtle: #18181D;        /* Destaque sutil de linha / hover */

/* Bordas & Divisores */
--border-base: #23232A;      /* Linha técnica precisa 1px */
--border-focus: #3F3F46;

/* Cores de Sinal (Terminal Status) */
--terminal-accent: #10B981;   /* Verde fósforo terminal (OK / Active) */
--terminal-warn: #F59E0B;     /* Âmbar de atenção */
--terminal-error: #EF4444;    /* Vermelho de erro técnico */

/* Tipografia */
--text-primary: #EDEDED;     /* Alto contraste */
--text-secondary: #71717A;   /* Muted zinc */
--text-terminal: #A1A1AA;    /* Monospace gray */
```

### Tipografia
* **Fontes:**
  * Principal/Código/Status: `JetBrains Mono`, `Fira Code` ou `Geist Mono`.
  * Leitura longa: `Geist Sans` ou `Inter`.
* **Tamanhos:** Mais compactos (11px a 13px para metadados e tags, 14px para corpo, 18px-20px para títulos de seção).

---

## 3. Redesenho Funcional do pocketRag (App 4)

### A. Barra Superior (Console Header)
* Logo com ícone simples em estilo vetor mono: `[>_] pocketRag :: v0.4-local`
* Status de conexão com indicador de dot técnico: `● VECTOR_DB: SQLITE (MOUNTED)`
* Sem botões arredondados bobos; seletores em estilo prompt/dropdown minimalista.

### B. Barra Inferior de Telemetria (Statusline)
Substitui os 4 cards gigantes superiores por uma linha compacta estilo rodapé de terminal:
```text
[STATUS: READY] | EMBEDDINGS: 1.536-dim | TOKENS: 0 | LATENCY: -- | COST: $0.00000 | MEM: 32MB
```

### C. Painel Esquerdo (Document Vault)
* **Tabs:** Em formato de abas de código ou switches estilo `[ 01: MY DOCS ] [ 02: EXAMPLES ]`.
* **Zona de Upload:** Caixa técnica com borda de 1px contínua ou tracejada sutil com visual de console:
  ```text
  ┌──────────────────────────────────────────────┐
  │ [ ↑ ] DRAG & DROP SOURCE FILES HERE          │
  │ FORMATS: .PDF, .TXT, .MD, .DOCX  < 10MB      │
  └──────────────────────────────────────────────┘
  ```
* **Lista de Arquivos:** Renderizada como um explorador de arquivos de terminal (tamanho em KB/MB, data, status de chunking).

### D. Painel Direito (Query Console & Assistant)
* **Prompt de Entrada:** Estilo shell com prefixo de cursor:
  ```text
  guest@pocket-rag:~$ [ Digite sua pergunta sobre os documentos... ]  [ ↵ EXEC ]
  ```
* **Empty State:** Em vez de ícone flutuando no vazio, um bloco ASCII minimalista ou guia de comandos rápidos:
  * `[TAB 1]` — Resumir tópicos principais
  * `[TAB 2]` — Extrair entidades e referências
  * `[TAB 3]` — Diagnóstico de inconsistências
* **Respostas do Chat:** Balões sem bordas desnecessárias, destacando trechos citados com tags numeradas `[ref:doc_01#chunk3]`.
