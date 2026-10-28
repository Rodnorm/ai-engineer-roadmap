# Design System & Guidelines — App 01: Smart Inspector

> **Direção Estética:** Optics Studio / Computer Vision HUD (Estilo Sony Alpha UI, Darkroom, Leica Digital).
> **Filosofia:** Ferramenta de inspeção visual e análise multimodal de alta precisão. Interface escura de laboratório óptico com acentos em Âmbar Técnico, linhas de retícula de 1px e dados de telemetria de imagem (resolução, formato, confiança de OCR).

---

## 1. Diagnóstico de UX/UI Atual & O Que Mudar

1. **Upload Convencional:** A área de upload atual parece um formulário web genérico. Transformá-la em uma mesa de captura óptica (*Optical Stage*) com cantos técnicos de mira (`[+]`) e status de pré-processamento.
2. **Cards de Resultados Desconectados:** Tags, detecção de objetos e OCR aparecem em caixas soltas e coloridas. Devem se integrar em um painel lateral de telemetria estruturado como camadas de análise (*Inspection Layers*).
3. **Métricas Visuais:** Adicionar indicadores de confiança percentual em mono (`CONFIDENCE: 0.94`, `RESOLUTION: 1920x1080px`, `TOKENS_USED`).
4. **Alerta de Inacurácia:** O aviso de que preços/links gerados podem ser imprecisos deve ser estilizado como um aviso de calibração óptica técnica (`[CALIBRATION NOTICE: HEURISTIC ESTIMATE]`), discreto e profissional.

---

## 2. Tokens de Design (Tailwind / CSS)

### Paleta de Cores
```css
/* Backgrounds */
--bg-root: #09090B;          /* Preto de laboratório óptico */
--bg-panel: #111215;         /* Superfície do inspetor */
--bg-surface: #18191E;       /* Camada de análise secundária */
--bg-crosshair: rgba(245, 158, 11, 0.05);

/* Bordas & Retículas */
--border-base: #22232A;      /* Borda técnica 1px */
--border-active: #3C3D4A;

/* Acentos & Sinais Ópticos */
--accent-primary: #F59E0B;   /* Âmbar de Calibração / Safety Amber */
--accent-subtle: rgba(245, 158, 11, 0.12);
--signal-success: #10B981;   /* Verde verificado */
--signal-warn: #F59E0B;
--signal-error: #EF4444;

/* Tipografia */
--text-primary: #F4F4F5;
--text-muted: #71717A;
--text-mono: #A1A1AA;
```

### Tipografia & Geometria
* **Métricas / OCR / Tags:** `JetBrains Mono` ou `Geist Mono` (10px a 12px, tabular numbers).
* **Descrições & Legendas:** `Geist Sans` ou `Inter` (13px a 14px, densidade confortável).
* **Border Radius:** `rounded-none` ou `rounded-xs` (2px).
* **Retículas Visuais:** Linhas de mira sutis de 1px nos quatro cantos da imagem inspecionada.

---

## 3. Especificação de Componentes

### A. Stage de Upload & Imagem ([ImageAnalyzer.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/01-smart-inspector/frontend/components/ImageAnalyzer.tsx))
* Container com cantos técnicos de mira:
  ```text
  ┌────────────────────────────────────────────────────────┐
  │ [+] OPTICAL INSPECTION STAGE                           │
  │     [ SELECT IMAGE OR DROP SENSOR CAPTURE ]            │
  │     SUPPORTED: PNG, JPG, WEBP  < 20MB                │
  └────────────────────────────────────────────────────────┘
  ```
* Preview da imagem analisada cercada por moldura de calibração com réguas de pixel sutis nas bordas.

### B. Camadas de Telemetria & Resultados ([ImageAnalyzerResults.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/01-smart-inspector/frontend/components/ImageAnalyzerResults.tsx))
* Estrutura em abas ou blocos técnicos empilhados:
  * `// 01: CAPTION & SEMANTIC SUMMARY`
  * `// 02: DETECTED OBJECTS & ENTITIES`
  * `// 03: OPTICAL CHARACTER RECOGNITION (OCR)`
  * `// 04: COMMERCE & PRODUCT ATTRIBUTION`
* Badges de tags com formato mono: `[TAG: electronic_circuit | 0.98]`.
* Trechos de OCR renderizados em bloco mono com numeração de linha `L01: ...`.

### C. Skeleton & Feedback de Processamento ([resultSkeleton.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/01-smart-inspector/frontend/components/resultSkeleton.tsx))
* Efeito radar scanline horizontal suave (`h-0.5 bg-amber-500/50`) em vez de pulsos circulares difusos.

---

## 4. Checklist Técnico de Implementação

- [ ] Configurar `--accent-primary: #F59E0B` e fundo `--bg-root: #09090B` em `globals.css`.
- [ ] Refatorar a dropzone em [ImageAnalyzer.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/01-smart-inspector/frontend/components/ImageAnalyzer.tsx) com miras e tipografia mono.
- [ ] Formatar o container de resultados em [ImageAnalyzerResults.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/01-smart-inspector/frontend/components/ImageAnalyzerResults.tsx) em formato de camadas ópticas.
- [ ] Validar estados de erro da API do Azure OpenAI e mensagens do `LanguageProvider`.
- [ ] Rodar `npm run typecheck` e `npm run build`.
