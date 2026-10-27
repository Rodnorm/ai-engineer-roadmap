# Design System & Guidelines — pocketRag

> **Objetivo:** Elevar o visual do pocketRag de um "dashboard genérico de IA" para uma ferramenta de engenharia premium, minimalista e refinada (estilo Linear, Raycast, Vercel).

---

## 1. Diagnóstico do Design Atual & O Que Mudar

1. **Bordas e Containers Excessivos:** Quase tudo está dentro de caixas com bordas duplas/triplas (card dentro de card). Vamos substituir por hierarquia de contraste e espaçamento limpo (*whitespace*).
2. **Cards de Métricas Superiores (Tokens, Cost, Latency):** Ocupam muito espaço vertical e parecem blocos desconexos. Devem se transformar em uma barra de status discreta ou em pílulas compactas integradas ao cabeçalho/painel.
3. **Empty States & Área de Chat:** Ícone e texto centralizados flutuando num vazio enorme. Precisamos de sugestões rápidas de prompt (*starter prompts*), micro-texturas e um input de chat com visual mais moderno e robusto.
4. **Tratamento de Erros:** O alerta vermelho `JSON.parse` quebra totalmente a estética. Alertas devem ser discretos (*toasts* ou banners com cantos refinados e tipografia mono compacta).

---

## 2. Tipografia & Escala

* **Display / Títulos:** `Plus Jakarta Sans` ou `Geist` (Moderno, geométrico, legível).
* **Corpo de Texto:** `Inter` ou `Geist Sans` (14px para corpo, 13px para metadados/secundários).
* **Métricas / Código:** `JetBrains Mono` ou `Geist Mono` (para valores numéricos, tokens, custos e snippets).

```css
--font-sans: 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'Geist Mono', monospace;
```

---

## 3. Paleta de Cores & Tokens

### Dark Mode (Principal — Estilo Dark Slate / Obsidian)
* **Background Primário:** `#090D16` (Mais profundo e sofisticado que o azul acinzentado atual).
* **Superfície Secundária / Painéis:** `#0E1424` (Subtle elevation).
* **Bordas / Linhas Sutis:** `rgba(255, 255, 255, 0.08)` (1px suave em vez de bordas azuladas grossas).
* **Acentos (Primary Brand):** `#38BDF8` (Sky) ou `#6366F1` (Indigo vibrante com leve glow).
* **Texto Primário:** `#F8FAFC`
* **Texto Secundário / Muted:** `#94A3B8`

### Light Mode (Refinado & Limpo)
* **Background Primário:** `#F8FAFC`
* **Superfície:** `#FFFFFF`
* **Bordas:** `rgba(0, 0, 0, 0.08)`
* **Texto Primário:** `#0F172A`
* **Texto Secundário:** `#64748B`

---

## 4. Reestruturação de Componentes

### A. Header & Métricas Compactas
* O cabeçalho deve integrar o status da Vector Store e os contadores (Tokens, Custo, Latência) em uma **fita de telemetria fina** no topo ou no rodapé, liberando espaço para o conteúdo principal.
* O badge `Local Vector DB` ganha um indicador de pulso sutil verde/azul (`animate-pulse`).

### B. Barra Lateral (Document Knowledge Base)
* Substituir o botão gigante "Upload Document" por uma área de drag-and-drop estilizada com linhas tracejadas sutis e hover com micro-animação.
* Lista de documentos com ícones de tipo de arquivo (PDF, MD, DOCX) com status individual de indexação.
* Toggle "My documents / Try example" refinado no estilo *Segmented Control* (estilo macOS/iOS).

### C. Chat Assistant & Playground
* **Empty State:** Em vez de apenas o ícone no centro, mostrar 2 a 3 cartões clicáveis com exemplos de perguntas:
  * *"Resuma as seções principais deste documento"*
  * *"Liste os pontos de ação e prazos citados"*
* **Input Bar:**
  * Barra de chat flutuante com suporte a múltiplos comandos (`/search`, `/clear`).
  * Botão de envio integrado com atalho de teclado visível (`⌘ + Enter` ou `Ctrl + Enter`).
  * Foco com anel de brilho suave (`ring-1 ring-sky-500/50`).

---

## 5. Micro-Interações & Animações
* **Transições:** `transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1)` para hovers de botões e seletores.
* **Shimmer / Skeleton:** Efeito de loading discreto ao processar embeddings ou consultas vetoriais.
* **Toasts / Notificações:** Erros (como erros de JSON) aparecem no canto inferior direito via Toast autolimpante, sem poluir a lista de documentos.
