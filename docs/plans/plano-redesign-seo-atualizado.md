# Diretriz de execução atualizada — prevalece sobre as etapas abaixo

O usuário autoriza a implementação completa do redesign e do SEO previstos neste plano, em todas as rotas e idiomas, sem pausas de aprovação entre etapas. A revisão visual da composição estática e da primeira entrega vertical passa a ser um checkpoint interno de organização, sem interromper a expansão para as demais páginas. Concluir também as animações e os ajustes de responsividade previstos.

## Economia de tokens e validação pelo usuário

- Não executar build, lint, npm test, typecheck, Lighthouse ou suítes automatizadas durante esta implementação, inclusive no encerramento. O usuário executará a validação ao final.
- Não iniciar servidores ou instalar ferramentas apenas para validar ou produzir screenshots. Preferir assets existentes; se indisponíveis, usar as alternativas demonstrativas já previstas, claramente identificadas e sem chamadas pagas.
- Não criar testes novos nesta entrega; preservar os existentes e ajustar apenas os que precisarem acompanhar mudanças de contratos ou estrutura.
- Fazer revisão estática focada dos arquivos editados: imports, tipos, caminhos, referências a assets, APIs utilizadas, consistência de idiomas e regras de interação. Corrigir problemas evidentes encontrados nessa leitura.
- Não declarar testes aprovados, desempenho medido ou funcionamento validado quando não houve execução. Metas de desempenho permanecem pendentes de medição.
- Não criar commits, fazer push, abrir PR ou executar deploy. Deixar as alterações locais disponíveis para revisão.
- Preservar alterações locais preexistentes. Não usar reset, checkout destrutivo ou limpeza de arquivos para preparar o trabalho.
- Trabalhar em etapas coerentes, reaproveitar os arquivos já lidos, evitar buscas amplas repetidas e não imprimir arquivos inteiros ou logs extensos sem necessidade.
- Enviar atualizações curtas nos marcos relevantes e um único relatório final conciso.
- Não interromper para escolhas rotineiras de implementação. Apenas dependências realmente indispensáveis que não tenham alternativa podem bloquear o trabalho.
- Itens opcionais ainda não aprovados, e-mail não fornecido e currículos ausentes permanecem fora da implementação; não inventar dados nem deixar links quebrados.

## Correções técnicas pendentes incorporadas ao escopo

- Calcular a faixa central de ativação pela altura da viewport em pixels; não usar porcentagens de rootMargin como equivalentes à altura. Recalcular ao redimensionar e liberar observadores/listeners no cleanup.
- A prioridade do foco nos controles dos projetos prevalece sobre qualquer regra de retomada do scroll após 80 px.
- Preservar o idioma correto no HTML inicial e prever a navegação EN/PT/DE, inclusive PT ↔ DE, sem presumir recarregamento completo entre todas as combinações. Deixar essa navegação no checklist manual.
- Medir as dimensões reais da imagem fornecida: preservar sua proporção intrínseca, sem fixar 3:4 por aproximação.

## Entrega final e validação manual

Entregar um resumo dos arquivos e comportamentos alterados, pendências externas e uma lista curta de comandos realmente disponíveis no package.json, com o diretório onde devem ser executados. Marcar todos os checks não executados como pendentes do usuário.

Fornecer checklist manual com: todas as rotas afetadas; acesso direto e troca entre EN/PT/DE; light/dark/system; largura de 320 px; zoom de 200%; textos longos em alemão; teclado e foco; seleção por clique e scroll; movimento reduzido; assets; canonical/hreflang; sitemap/robots; redirecionamentos e rotas inexistentes. A verificação de Search Console e de desempenho em produção permanece posterior à publicação pelo usuário.

---

**# Plano de Implementação: Redesign Editorial ("Revista + Colagem") e SEO Internacional — App 00**



**## 1. Diagnóstico e Auditoria da Estrutura Atual**



**### 1.1 Fatos Confirmados no Código do Repositório**



\- **\*\*Aplicação e Stack\*\***: *\`apps/00-portfolio/frontend\`* opera com Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 3.4, *\`lucide-react\`*, *\`clsx\`* e *\`tailwind-merge\`*. A aplicação compila em modo autônomo (*\`output: "standalone"\`* em *\`next.config.mjs\`*) para execução em container Docker via Coolify.

\- **\*\*Inventário Real de Rotas\*\***:

  - **\*\*Página Inicial\*\***: *\`/\`* (inglês) e *\`/[locale]\`* (*\`/pt\`*, *\`/de\`*), consumindo *\`components/views/HomePageView\.tsx\`*.

  - **\*\*Experiência Profissional\*\***: *\`/experience\`* e *\`/[locale]/experience\`*, consumindo *\`ExperiencePageView\.tsx\`*.

  - **\*\*Estudo de Caso Profissional\*\***: *\`/experience/ai-review-platform\`* e *\`/[locale]/experience/ai-review-platform\`*, consumindo *\`ProfessionalCasePageView\.tsx\`*.

  - **\*\*Catálogo de Aplicações\*\***: *\`/apps\`* e *\`/[locale]/apps\`*, consumindo *\`CatalogPageView\.tsx\`*.

  - **\*\*Estudos de Caso de Projetos Pessoais\*\***: *\`/apps/[slug]\`* e *\`/[locale]/apps/[slug]\`*, consumindo *\`CaseStudyPageView\.tsx\`* com conteúdo markdown em *\`content/\*.md\`*.

  - **\*\*Sobre & Perfil\*\***: *\`/about\`* e *\`/[locale]/about\`*, consumindo *\`AboutPageView\.tsx\`*.

  - **\*\*Roadmap de Aprendizado\*\***: *\`/roadmap\`* e *\`/[locale]/roadmap\`*, consumindo *\`RoadmapPageView\.tsx\`*.

  - **\*\*Páginas Legais\*\***: *\`/datenschutz\`* e *\`/[locale]/datenschutz\`* (*\`DatenschutzPageView\.tsx\`*); *\`/impressum\`* e *\`/[locale]/impressum\`* (*\`ImpressumPageView\.tsx\`*).

\- **\*\*Conteúdo Aprovado da&#x20;**_\`main\`_**&#x20;(Fonte de Verdade)\*\***:

  - Todo o conteúdo textual reside em *\`lib/personal-content.ts\`* e nos dicionários *\`lib/i18n/dictionaries/{en,pt,de}.ts\`*.

  - Campos oficiais consumidos na Home:

    - Cargo: *\`text.role\`*

      - EN: *\`"Senior Software Engineer — Frontend & Applied AI"\`*

      - PT: *\`"Engenheiro de Software Sênior — Frontend & IA Aplicada"\`*

      - DE: *\`"Senior Software Engineer — Frontend & Angewandte KI"\`*

    - Localização: *\`text.location\`*

      - EN: *\`"Based in Essen, Germany"\`*

      - PT: *\`"Residindo em Essen, Alemanha"\`*

      - DE: *\`"Wohnhaft in Essen, Deutschland"\`*

    - Introdução: *\`text.intro\`* (descreve a atuação com Angular, React, TypeScript, Python, FastAPI e LLMs).

    - Rótulos e Navegação: *\`text.experienceLabel\`*, *\`text.projectsLabel\`*, *\`text.readCase\`*, *\`text.workTitle\`*, *\`text.workIntro\`*.

    - Estudo de Caso Profissional: *\`text.professionalLabel\`*, *\`text.caseTitle\`* (*\`"AI Review Platform"\`*), *\`text.caseSummary\`*, *\`text.outcome\`*.

    - Projetos Pessoais Destacados na Home: array *\`text.featured\`*, que contém exatamente:

      1. *\`Pocket RAG\`* (*\`slug: "pocket-rag"\`*)

      2. *\`Agent Workspace\`* (*\`slug: "agent-workspace"\`*)

  - A seleção da home publicada apresenta rigorosamente 3 projetos no Selected Work:

    1. **\*\*Caso Profissional Anonimizado\*\*** (*\`AI Review Platform\`*, rota *\`/experience/ai-review-platform\`*)

    2. **\*\*Pocket RAG\*\*** (*\`slug: "pocket-rag"\`*, rota *\`/apps/pocket-rag\`*)

    3. **\*\*Agent Workspace\*\*** (*\`slug: "agent-workspace"\`*, rota *\`/apps/agent-workspace\`*)

\- **\*\*Estado Atual dos Temas\*\***:

  - *\`lib/theme/ThemeProvider.tsx\`* gerencia os modos *\`light\`*, *\`dark\`* e *\`system\`*, armazenados no *\`localStorage\`* sob *\`portfolio_theme\`*.

  - *\`app/layout.tsx\`* inclui script inline anti-FOUC para prevenir flashes de tema.

\- **\*\*Auditoria de SEO e HTML Inicial\*\***:

  - Atributo *\`lang\`* no HTML: *\`app/layout.tsx\`* define estaticamente *\`\<html lang="en">\`*. O componente *\`HtmlLangSync.tsx\`* altera o atributo no cliente via *\`useEffect\`*. No SSR, o HTML entregue para *\`/pt\`* e *\`/de\`* contém incorretamente *\`lang="en"\`*.

  - Arquivos de Rastreamento: Requisições para *\`/robots.txt\`* e *\`/sitemap.xml\`* retornam HTTP 404, pois os arquivos ou geradores dinâmicos correspondentes inexistem no projeto.

  - Canônicos e Metadados: Inexiste definição de *\`metadataBase\`*, *\`alternates.canonical\`*, *\`alternates.languages\`* (hreflang), Open Graph ou esquemas JSON-LD.

  - Duplicação *\`/\`* e *\`/en\`*: *\`app/page.tsx\`* responde na raiz *\`/\`* e *\`app/[locale]/page.tsx\`* aceita requisições para *\`/en\`*, entregando conteúdo em inglês sem canônico ou redirecionamento.

\- **\*\*Funcionalidades Reais dos Apps no Repositório\*\***:

  - *\`apps/04-pocket-rag\`*: Ingestão de PDF, MD, TXT, DOCX; chunking e vetores em SQLite local; busca semântica com Azure OpenAI; interface com lista de documentos, sugestões de perguntas e respostas com citação de trechos de apoio.

  - *\`apps/06-agent-workspace\`*: Chat com streaming via SSE (tokens e status de ferramentas); ferramentas tipadas (*\`list_tasks\`*, *\`search_notes\`*, *\`create_task\`*, *\`update_task\`* com confirmação); provedor determinístico offline para desenvolvimento local sem custos de nuvem; histórico de conversas em memória.



**### 1.2 Pontos Dependentes de Acesso Externo**



\- Configuração do domínio *\`https\://normando.dev\`* no servidor de produção (Coolify/Hetzner).

\- Verificação de propriedade e envio de sitemap no Google Search Console.



\---



**## 2. Conteúdo Aprovado e Direção Estética**



**### 2.1 Preservação Rígida dos Campos Oficiais**



Os textos da *\`main\`* são a única fonte autorizada de conteúdo. Para evitar divergências:



1\. **\*\*Campos Vinculados\*\***: Os componentes devem interpolar diretamente as chaves de *\`getPersonalContent(locale)\`* e *\`getDictionary(locale)\`*, sem transcrições manuais duplicadas no plano ou código:

   - Cargo: *\`text.role\`*

   - Localização: *\`text.location\`*

   - Apresentação inicial: *\`text.intro\`*

   - Estudo profissional: *\`text.caseTitle\`*, *\`text.caseSummary\`*, *\`text.outcome\`*

   - Projetos pessoais em destaque: array *\`text.featured\`*

2\. **\*\*Projetos em Destaque\*\***: A ordem na home permanece a estabelecida no código:

   - *\`01 / 03\`*: Estudo Profissional Anonimizado (*\`AI Review Platform\`*)

   - *\`02 / 03\`*: Pocket RAG

   - *\`03 / 03\`*: Agent Workspace

3\. **\*\*Propostas Opcionais da Referência\*\***:

   - Elementos estilísticos presentes na referência (como a tipografia display do título, a anotação lateral *\`"/ Interfaces, systems & applied AI"\`* e a nota gráfica) entram no plano como **\*\*propostas de adorno visual opcionais\*\***.

   - Se aprovados pelo usuário, serão renderizados como anotações decorativas secundárias com *\`aria-hidden="true"\`*, sem substituir o nome "Rodrigo Normando" como título semântico principal nem alterar o valor oficial de *\`text.role\`*.



**### 2.2 Direção Visual Editorial Pura (Sem Associação Temática)**



\- A referência aprovada é puramente a **\*\*estética editorial e sua paleta cromática\*\*** (marfim, carvão, terracota, papel rasgado e linhas de precisão), sem vínculo com referências industriais, arquitetônicas ou temáticas locais.

\- A arte do Hero é composta pela **\*\*imagem abstrata fornecida\*\***, que integra texturas de papel rasgado, blocos de impressão xilográfica/litográfica irregular em terracota e preto, sobreposições translúcidas e traços geométricos de desenho técnico.



\---



**## 3. Arte do Hero: Tratamento e Integração Responsiva da Colagem Abstrata**



A imagem fornecida representa uma composição artística única e coesa. O plano adota sua utilização direta como asset de alta fidelidade, descartando qualquer tentativa de simulação artificial por formas CSS genéricas ou divisão em camadas separadas.



**### 3.1 Especificações do Asset Local e Formato**



\- **\*\*Localização e Formato\*\***: O arquivo da imagem abstrata é processado e otimizado localmente como WebP de alta qualidade em *\`public/images/editorial/hero-collage.webp\`* (com fallback PNG se necessário).

\- **\*\*Proporção e Preservação\*\***:

  - Proporção natural vertical aproximada de 3:4 (retrato).

  - A renderização no layout preserva integralmente a proporção intrínseca (*\`aspect-[3/4]\`* ou similar), garantindo que não ocorra estiramento, distorção ou recortes destrutivos da composição gráfica.

\- **\*\*Acessibilidade e Semântica\*\***:

  - O elemento *\`Image\`* recebe *\`alt=""\`* e *\`aria-hidden="true"\`*, declarando seu caráter estritamente decorativo.

  - Todo o conteúdo informativo (nome, cargo, introdução e links) é mantido em HTML semântico acessível no DOM.



**### 3.2 Integração Cromática nos Dois Temas**



1\. **\*\*Tema Claro (Fundo Marfim Editorial)\*\***:

   - A borda externa da imagem (marfim suave texturizado) é integrada perfeitamente ao fundo marfim da página (*\`#F6F3EC\`*).

   - Aplicação de *\`mix-blend-mode: multiply\`* suave ou calibração ótica do tom do container, permitindo que a arte se funda naturalmente com a página, sem linha de corte artificial nas bordas da imagem.

2\. **\*\*Tema Escuro (Carvão Quente)\*\***:

   - **\*\*Sem Inversão Automática de Cores\*\***: As cores da imagem não sofrem filtro de inversão (*\`invert\`*), mantendo a autenticidade dos tons de papel, tinta carvão e pigmento terracota originais.

   - **\*\*Apresentação como Objeto Físico\*\***: A arte é apresentada como uma **\*\*peça de papel de arte montada sobre o fundo escuro\*\*** (*\`#141312\`*), com leve elevação visual conferida por uma sombra suave (*\`shadow-2xl\`*) e/ou contorno sutil de 1px (*\`rgba(234, 230, 223, 0.08)\`*), criando o efeito de uma gravura original exposta sobre superfície escura.



**### 3.3 Comportamento Responsivo e Movimento**



\- **\*\*Desktop (≥ 1024px)\*\***: A arte ocupa o quadrante direito do Hero (aproximadamente 40% a 45% da largura útil), alinhada harmonicamente ao bloco tipográfico da esquerda.

\- **\*\*Mobile (< 768px)\*\***: A imagem é posicionada de forma fluida, escalando proporcionalmente sem extravasamento horizontal (*\`max-w-full h-auto\`*), mantendo respiros laterais adequados e sem cobrir o texto.

\- **\*\*Movimento e Animação\*\***:

  - Por ser uma imagem em composição única, **\*\*não há simulação de parallax entre camadas independentes\*\***.

  - Qualquer interação de scroll aplicada ao bloco da arte deve ser **\*\*extremamente sutil, contida e limitada\*\*** (deslocamento vertical mínimo no scroll do container como um todo).

  - Em ambientes com *\`prefers-reduced-motion: reduce\`*, qualquer movimento é estritamente desligado (*\`transform: none !important;\`*).



**### 3.4 Desempenho e Prevenção de Layout Shift (CLS)**



\- **\*\*Dimensões Reservadas\*\***: Uso do componente *\`next/image\`* com valores explícitos de *\`width\`* e *\`height\`* baseados no aspect ratio intrínseco, ou container com classe CSS de proporção fixa para alocação imediata de espaço no DOM antes do download.

\- **\*\*Avaliação de Prioridade de Carregamento\*\***: A aplicação de *\`priority={true}\`* será decidida após medição concreta com Lighthouse/DevTools. Se o elemento LCP for o *\`\<h1>\`* de texto, o foco de pré-carregamento será a fonte tipográfica; se for a imagem do Hero, esta receberá a prioridade.



\---



**## 4. Arquitetura de Idiomas e Renderização do HTML Inicial**



Para que o servidor entregue o atributo *\`\<html lang="...">\`* semanticamente correto sem requisições adicionais de cookies e preservando as rotas em inglês sem prefixo, adota-se a arquitetura de Route Groups com Layouts Raiz Separados no Next.js App Router.



**### 4.1 Estrutura de Diretórios Proposta**



\`\`\`text

apps/00-portfolio/frontend/app/

├── (en)/                               # Grupo de rotas em inglês (sem prefixo na URL)

│   ├── layout.tsx                      # Root layout emite \<html lang="en">

│   ├── page.tsx                        # Rota /

│   ├── about/page.tsx                  # Rota /about

│   ├── apps/

│   │   ├── page.tsx                    # Rota /apps

│   │   └── [slug]/page.tsx             # Rota /apps/[slug]

│   ├── experience/

│   │   ├── page.tsx                    # Rota /experience

│   │   └── ai-review-platform/page.tsx # Rota /experience/ai-review-platform

│   ├── roadmap/page.tsx                # Rota /roadmap

│   ├── datenschutz/page.tsx            # Rota /datenschutz

│   └── impressum/page.tsx              # Rota /impressum

├── [locale]/                           # Rotas com prefixo (/pt e /de)

│   ├── layout.tsx                      # Root layout dinâmico emite \<html lang="pt-BR"> ou \<html lang="de">

│   ├── page.tsx                        # Rotas /pt e /de

│   ├── about/page.tsx                  # Rotas /pt/about e /de/about

│   ├── apps/

│   │   ├── page.tsx                    # Rotas /pt/apps e /de/apps

│   │   └── [slug]/page.tsx             # Rotas /pt/apps/[slug] e /de/apps/[slug]

│   ├── experience/

│   │   ├── page.tsx                    # Rotas /pt/experience e /de/experience

│   │   └── ai-review-platform/page.tsx # Rotas /pt/experience/ai-review-platform e /de/experience/ai-review-platform

│   ├── roadmap/page.tsx                # Rotas /pt/roadmap e /de/roadmap

│   ├── datenschutz/page.tsx            # Rotas /pt/datenschutz e /de/datenschutz

│   └── impressum/page.tsx              # Rotas /pt/impressum e /de/impressum

├── globals.css

├── robots.ts

└── sitemap.ts

\`\`\`



**### 4.2 Funcionamento Técnico e Implicações**



1\. **\*\*Obtenção do Idioma no Servidor\*\***:

   - Em *\`app/(en)/layout.tsx\`*: define estaticamente *\`\<html lang="en">\`*.

   - Em *\`app/[locale]/layout.tsx\`*: recebe *\`params: Promise<{ locale: string }>\`*. Valida com *\`isValidLocale(locale)\`* e emite *\`\<html lang="pt-BR">\`* para *\`pt\`* e *\`\<html lang="de">\`* para *\`de\`*.

   - Nenhuma lógica depende de *\`useEffect\`* ou de leitura de cookies para definir a tag HTML inicial.

2\. **\*\*Preservação de URLs e Eliminação de&#x20;**_\`/en\`_**\*\***:

   - Inglês opera nas URLs raiz (*\`/\`*, *\`/about\`*, etc.).

   - No *\`next.config.mjs\`*, adiciona-se regra de redirecionamento HTTP 308 de *\`/en\`* e *\`/en/:path\*\`* para *\`/\`* e *\`/:path\*\`*.

3\. **\*\*Navegação e Transições\*\***:

   - A navegação interna entre páginas do mesmo idioma ocorre via client-side transition normalmente.

   - A troca de idioma (ex: de *\`/\`* para *\`/pt\`*) altera o layout raiz, gerando uma transição de documento completa que redefine o DOM e o foco de forma limpa, garantindo a atualização do idioma do leitor de tela.

4\. **\*\*Persistência de Tema\*\***:

   - Ambos os layouts compartilham a mesma inicialização de *\`ThemeProvider\`* e o mesmo script inline anti-FOUC lendo *\`localStorage.getItem("portfolio_theme")\`*. A alternância de idioma preserva o tema escolhido sem qualquer cintilação visual.

5\. **\*\*Renderização Estática\*\***:

   - Mantém suporte integral à geração estática através de *\`generateStaticParams()\`* em *\`[locale]\`*.



\---



**## 5. Sistema de Temas: Claro Editorial e Carvão Quente**



**### 5.1 Definição dos Tokens e Contrastes Reais**



Os contrastes foram calculados com base na fórmula de luminância relativa da WCAG 2.1:



\| Token Semântico | Claro (Marfim Editorial) | Escuro (Carvão Quente) | Função e Cálculo de Contraste |

\|---|---|---|---|

\| *\`--bg-page\`* | *\`#F6F3EC\`* (L: 0.895) | *\`#141312\`* (L: 0.007) | Fundo principal da página. |

\| *\`--bg-surface\`* | *\`#EDE9E0\`* | *\`#1E1D1A\`* | Cartões, molduras e painéis. |

\| *\`--text-ink\`* | *\`#161513\`* (L: 0.008) | *\`#EAE6DF\`* (L: 0.789) | Texto principal.\<br>- Claro: **\*\*16.3:1\*\*** contra fundo marfim.\<br>- Escuro: **\*\*14.8:1\*\*** contra fundo carvão. |

\| *\`--text-muted\`* | *\`#68645E\`* (L: 0.138) | *\`#A29D94\`* (L: 0.352) | Metadados e datas.\<br>- Claro: **\*\*5.0:1\*\*** (conforme AA).\<br>- Escuro: **\*\*7.1:1\*\*** (conforme AA). |

\| *\`--border-hairline\`* | *\`rgba(22, 21, 19, 0.12)\`* | *\`rgba(234, 230, 223, 0.14)\`* | Linhas de 1px e réguas divisórias. |

\| *\`--accent-terracotta\`* | *\`#C83E22\`* (L: 0.158) | *\`#E05338\`* (L: 0.222) | Destaques e indicadores.\<br>- Claro: **\*\*4.54:1\*\*** contra marfim.\<br>- Escuro: **\*\*4.80:1\*\*** contra carvão. |

\| *\`--accent-focus\`* | *\`#C83E22\`* | *\`#F26B50\`* (L: 0.288) | Contorno de foco de teclado (2px). |



**### 5.2 Botões e Elementos Interativos sobre Terracota**



\- **\*\*Tema Claro\*\***: Botões primários com fundo *\`#C83E22\`* e texto branco *\`#FFFFFF\`*. Razão de contraste: **\*\*5.05:1\*\*** (conforme WCAG AA para texto normal).

\- **\*\*Tema Escuro\*\***: Botões com fundo *\`#E05338\`* e texto escuro *\`#141312\`*. Razão de contraste: **\*\*4.80:1\*\*** (conforme WCAG AA para texto normal). O uso de texto escuro evita a queda de contraste que ocorreria com texto branco sobre terracota claro (**\*\*3.86:1\*\***).



**### 5.3 Comportamento de Texturas e Controles**



\- **\*\*Textura Geral de Papel\*\***:

  - Claro: SVG de ruído com *\`mix-blend-mode: multiply\`* e opacidade 0.04 sobre o marfim.

  - Escuro: SVG com *\`mix-blend-mode: screen\`* e opacidade 0.03 sobre o carvão, simulando papel grafite sem desbotar o contraste.

\- **\*\*Controles (**_\`ThemeToggle\`_**,&#x20;**_\`LanguageSelector\`_**)\*\***:

  - Borda sutil de 1px (*\`--border-hairline\`*), fundo transparente ou elevado, e contorno de foco de 2px via *\`--accent-focus\`* com espaçamento de 2px (*\`outline-offset: 2px\`*).



\---



**## 6. Faixa Tipográfica Vinculada ao Progresso do Scroll**



\- **\*\*Comportamento Vinculado Exclusivo\*\***:

  - A faixa não possui animação contínua em loop infinito e não usa aceleração por velocidade.

  - O deslocamento horizontal (*\`transform: translateX(...)\`*) é calculado de forma limitada e proporcional à fração de rolagem do elemento container através da viewport (deslocamento máximo delimitado, por exemplo, de 0 a -120px).

  - Quando a rolagem cessa, o elemento permanece imóvel na posição relativa exata.

\- **\*\*Acessibilidade e&#x20;**_\`prefers-reduced-motion\`_**\*\***:

  - Usuários com *\`prefers-reduced-motion: reduce\`* visualizam a faixa com translação estática (*\`transform: none !important;\`*).

  - O conteúdo é rotulado com *\`aria-hidden="true"\`*, servindo como separador gráfico; nenhum dado essencial depende dessa exibição.



\---



**## 7. Seleção de Projetos: Scroll, Teclado e Prévia Sticky**



A seção Selected Work apresenta os 3 projetos aprovados da *\`main\`* em duas colunas no desktop (lista à esquerda e prévia sticky à direita).



**### 7.1 Regras Explícitas de Interação e Estados**



1\. **\*\*Prioridade do Foco de Teclado\*\***:

   - Enquanto o foco estiver em qualquer controle interno de um projeto (botão de prévia ou link), o observador de scroll é **\*\*completamente inibido\*\*** de sobrescrever a seleção ativa.

2\. **\*\*Retomada de Controle após Seleção por Clique\*\***:

   - Ao clicar em um controle de seleção, o projeto clicado torna-se ativo imediatamente.

   - O scroll retoma o controle apenas após o usuário rolar uma distância mínima (*\`threshold Delta Y ≥ 80px\`*) ou quando o item clicado sair inteiramente da zona de leitura central.

3\. **\*\*Estado Inicial e Extremos da Seção\*\***:

   - Estado Inicial: O primeiro projeto (*\`01 — AI Review Platform\`*) inicia como ativo.

   - Topo da Seção: Se a rolagem voltar acima da seção, o projeto *\`01\`* permanece selecionado.

   - Fim da Seção: Se a rolagem ultrapassar o final da lista para baixo, o último projeto (*\`03 — Agent Workspace\`*) permanece selecionado, sem transição para estado vazio.

4\. **\*\*Desempate entre Projetos Simultaneamente Visíveis\*\***:

   - A cada atualização de rolagem, calcula-se a distância entre o centro vertical de cada artigo e a linha central da viewport (*\`viewportCenterY = window\.innerHeight \* 0.5\`*).

   - O projeto ativo é o elemento com a menor distância absoluta: *\`Math.abs(itemCenterY - viewportCenterY)\`*.

5\. **\*\*Cálculo da Região de Ativação\*\***:

   - O *\`IntersectionObserver\`* monitora a entrada na faixa central correspondente aos 20% médios da altura da viewport (*\`rootMargin: "-40% 0px -40% 0px"\`*). A validação cobrirá telas de 1366x768, 1920x1080 e telas ultrawide.

6\. **\*\*Separação Estrutural entre Seleção e Navegação\*\***:

   - Cada entrada de projeto na lista possui dois controles independentes, sem aninhamento inválido de tags interativas:

     - Um *\`\<button>\`* de seleção: com *\`type="button"\`*, *\`aria-pressed="true|false"\`* e rótulo claro (ex: *\`"Exibir prévia de Pocket RAG"\`*).

     - Um *\`\<Link>\`* de navegação: link HTML nativo (*\`\<a>\`*) com destino ao estudo de caso e texto acessível (*\`"Ler estudo de caso — Pocket RAG"\`*).

7\. **\*\*Regra Absoluta de Acessibilidade\*\***:

   - O scroll da página **\*\*nunca move o foco do teclado\*\***. Chamar *\`element.focus()\`* em resposta à rolagem é expressamente proibido.

8\. **\*\*Adaptação para Mobile (< 768px)\*\***:

   - A coluna fixa é desativada. Cada projeto é apresentado linearmente com seu cabeçalho, tecnologias, resumo e sua captura de tela embutida diretamente abaixo, com o link para o estudo de caso.

9\. **\*\*Movimento Reduzido\*\***:

   - Com *\`prefers-reduced-motion: reduce\`*, a troca da imagem na moldura sticky é instantânea (*\`transition: none;\`*), sem transições de opacidade.



\---



**## 8. Screenshots e Apresentação de Funcionalidades Reais**



**### 8.1 Mapeamento Real dos 3 Projetos em Destaque**



\| Projeto | Funcionalidade Real Verificada no Código | Apresentação Visual no Redesign | Origem dos Dados e Alternativa |

\|---|---|---|---|

\| **\*\*01 — AI Review Platform\*\*** (Caso Profissional) | Plataforma de revisão humana com FastAPI, concorrência otimista (HTTP 409), log de auditoria hash-chained e fluxo de importação → mapeamento → revisão → exportação. | **\*\*Exclusivamente tipográfica e conceitual\*\***. Cartão editorial estruturado com o fluxo metodológico de 4 etapas e tecnologias aprovadas. **\*\*Sem screenshots, sem marcas proprietárias e sem nomes internos\*\***. | Conteúdo aprovado em *\`lib/personal-content.ts\`*. Métricas de teste mencionadas no texto referem-se à suite total do projeto corporativo (*\`outcome\`*), não sendo atribuídas como produção isolada do autor. |

\| **\*\*02 — Pocket RAG\*\*** (*\`apps/04-pocket-rag\`*) | Ingestão local de documentos (PDF, MD, TXT, DOCX), chunking em SQLite, busca semântica e respostas com citações de apoio. | Screenshot da tela real de consulta, exibindo uma resposta formulada com os cartões de citação de fontes dos documentos de teste alemães fornecidos na aplicação. | Demonstração local executada com os 5 PDFs de exemplo empacotados no próprio app, sem chamadas a APIs pagas. Caso a captura live não ocorra, utilizar mockup técnico baseado nos componentes reais de *\`apps/04-pocket-rag/frontend\`*, identificado como "Demonstração com dados de exemplo". |

\| **\*\*03 — Agent Workspace\*\*** (*\`apps/06-agent-workspace\`*) | Chat de trabalho com streaming SSE, ferramentas tipadas de tarefas e notas, aprovação humana para mutações e histórico em memória. | Screenshot da interface do workspace exibindo o fluxo de conversa com uma ferramenta de listagem de tarefas (*\`list_tasks\`*) executada no painel. | Captura gerada executando o app localmente com o provedor determinístico offline (*\`AGENT_PROVIDER=offline\`*), sem consumo de créditos do Azure Foundry. Identificado como "Demonstração com dados de exemplo". |



\---



**## 9. Auditoria e Plano de SEO Internacional**



**### 9.1 Semântica, Rastreamento e Indexação**



1\. **\*\*Finalidade Real do Atributo&#x20;**_\`lang\`_**\*\***:

   - A correção de *\`lang="en"\`*, *\`lang="pt-BR"\`* e *\`lang="de"\`* no HTML inicial é fundamental para conformidade com a especificação HTML, motores de acessibilidade, leitores de tela (que utilizam o atributo para carregar a tabela fonética correta) e recursos de tradução de navegadores. Não é descrita como requisito obrigatório para o robô do Google, que determina o idioma pelo conteúdo textual visível.

2\. **\*\*Fonte Única de Verdade para Alternates e Hreflang\*\***:

   - Um módulo utilitário centralizado (*\`lib/i18n/routing.ts\`*) definirá o mapa canônico de rotas correspondentes.

   - Tanto os metadados de página (*\`metadata.alternates.languages\`*) quanto as entradas do sitemap serão gerados a partir dessa **\*\*mesma fonte de verdade\*\***, evitando discrepâncias entre as tags no cabeçalho HTML e os nós XML.

3\. **\*\*Mapeamento Recíproco e&#x20;**_\`x-default\`_**\*\***:

   - Relações de equivalência linguística só serão geradas para rotas que de fato existam e estejam traduzidas nos 3 idiomas (Home, Sobre, Experiência, Catálogo, Roadmap e páginas legais).

   - O valor *\`x-default\`* apontará para a URL canônica em inglês (*\`https\://normando.dev/...\`*).

4\. **\*\*Comportamento das Tags Canônicas\*\***:

   - Cada página traduzida aponta a tag canônica para sua própria URL absoluta (*\`self-canonical\`*). O canônico é tratado tecnicamente como uma sugestão forte ao motor de busca, e não como uma garantia absoluta.

5\. **\*\*Prevenção de Indexação Indevida em Produção e Previews\*\***:

   - Verificação em *\`next.config.mjs\`* de cabeçalhos de resposta: cabeçalhos *\`X-Robots-Tag: noindex, nofollow\`* serão emitidos automaticamente para qualquer host que não corresponda ao domínio oficial de produção (*\`normando.dev\`*).

   - Conferência de ausência de tags *\`\<meta name="robots" content="noindex">\`* nas páginas públicas de produção.

   - O arquivo *\`robots.txt\`* é tratado estritamente como guia de rastreamento para agentes automatizados, e não como controle de acesso ou mecanismo de proteção de dados.



**### 9.2 Metadados e Dados Estruturados**



1\. **\*\*Metadados Sociais (Open Graph e Twitter)\*\***:

   - Configurados com *\`metadataBase: new URL("https\://normando.dev")\`*, títulos e descrições específicos por idioma a partir dos textos aprovados.

   - Imagem de compartilhamento social editorial dedicada: *\`public/images/editorial/og-card.png\`* (1200x630px).

2\. **\*\*Dados Estruturados JSON-LD\*\***:

   - Esquemas *\`Person\`*, *\`ProfilePage\`* e *\`WebSite\`* validados no Schema Markup Validator (Schema.org) para correção sintática de entidades.

   - Perfis associados em *\`sameAs\`* restritos aos canais verificados do autor (LinkedIn e GitHub).

   - Não serão feitas promessas de concessão de recursos especiais no Rich Results Test, uma vez que tais exibições são decididas algoritmicamente pelo buscador com base em tipos específicos de conteúdo.



**### 9.3 Propostas Opcionais de Posicionamento e Contato**



Apresentadas como sugestões separadas, sem alteração dos textos vigentes:



1\. **\*\*Frases de Disponibilidade e Modelos de Contratação\*\***:

   - Sugestão para inclusão no rodapé ou página Sobre, condicionada à aprovação:

     - EN: *\`"Open to full-time employment, contract work, and international remote opportunities."\`*

     - PT: *\`"Disponível para contratação PJ ou CLT (Brasil) e projetos remotos internacionais."\`*

     - DE: *\`"Offen für Festanstellung oder freiberufliche Projekte (Deutschland / Remote)."\`*

2\. **\*\*E-mail Profissional Direto\*\***:

   - Proposta de disponibilização de endereço de e-mail na interface, pendente do fornecimento do endereço autorizado pelo usuário. Não há promessa de que codificação de entidades em *\`mailto:\`* impeça raspagem automatizada.

3\. **\*\*Disponibilização de Currículo (PDF)\*\***:

   - Estrutura planejada para *\`public/documents/rodrigo-normando-cv-{en,pt,de}.pdf\`*, a ser ativada apenas após a entrega dos arquivos definitivos pelo usuário.



\---



**## 10. Validação Técnica, Desempenho e Metas Verificáveis**



**### 10.1 Comandos de Validação e Scripts Existentes**



Utilizam-se estritamente os comandos declarados no *\`package.json\`* do frontend (*\`apps/00-portfolio/frontend\`*):



\- *\`npm run lint\`*: Executa a verificação estática do ESLint 9 (*\`eslint .\`*).

\- *\`npm test\`*: Executa os testes unitários do Node.js (*\`node --import tsx --test\`*).

\- *\`npm run build\`*: Compila a aplicação Next.js e valida tipos TypeScript e rotas estáticas.

\- Para auditorias de Lighthouse, utilizar o Chrome DevTools local ou comando externo via *\`npx -y lighthouse \<url>\`*.



**### 10.2 Metas Mensuráveis de Desempenho e Estabilidade**



\- **\*\*LCP (Largest Contentful Paint)\*\***: Meta *\`< 2.5s\`* em emulação móvel (Fast 3G/4G). A imagem da colagem abstrata só receberá *\`priority={true}\`* caso a inspeção do painel Performance comprove que ela é o elemento LCP; caso o título *\`\<h1>\`* seja o LCP, o foco de pré-carregamento será voltado às fontes tipográficas.

\- **\*\*CLS (Cumulative Layout Shift)\*\***: Meta *\`< 0.05\`*. Dimensões intrínsecas reservadas na imagem abstrata através dos atributos *\`width\`* e *\`height\`* do *\`next/image\`* ou classes de *\`aspect-ratio\`*, combinadas com *\`size-adjust\`* nas fontes do *\`next/font/google\`*.

\- **\*\*Validação de Erros 404 Autênticos\*\***:

  - Testar programaticamente que rotas inexistentes (*\`/rota-inexistente\`*), slugs de projetos inexistentes (*\`/apps/projeto-falso\`*) e códigos de idioma inválidos (*\`/fr\`*, *\`/es\`*) retornam status HTTP 404 real no servidor, sem renderização de páginas válidas com erro falso (soft 404).

\- **\*\*Inspeção de HTML Inicial via Terminal\*\***:

  - Para inspecionar o atributo *\`lang\`* no corpo HTML retornado pelo servidor:

    \`\`\`bash

    curl -s http\://localhost:3000/pt | grep -i '\<html'

    \`\`\`

  - Para verificar cabeçalhos HTTP e códigos de status separadamente:

    \`\`\`bash

    curl -sI http\://localhost:3000/robots.txt

    curl -sI http\://localhost:3000/en

    \`\`\`



\---



**## 11. Cobertura de Rotas e Casos de Borda**



**### 11.1 Checklist Completo de Rotas Existentes**



\- [ ] **\*\*Home\*\***: *\`/\`* (EN), *\`/pt\`* (PT), *\`/de\`* (DE).

\- [ ] **\*\*Experiência\*\***: *\`/experience\`* (EN), *\`/pt/experience\`* (PT), *\`/de/experience\`* (DE).

\- [ ] **\*\*Estudo Profissional\*\***: *\`/experience/ai-review-platform\`* (EN), *\`/pt/experience/ai-review-platform\`* (PT), *\`/de/experience/ai-review-platform\`* (DE).

\- [ ] **\*\*Catálogo\*\***: *\`/apps\`* (EN), *\`/pt/apps\`* (PT), *\`/de/apps\`* (DE).

\- [ ] **\*\*Estudos de Caso Pessoais\*\***: *\`/apps/[slug]\`* e *\`/pt/apps/[slug]\`*, *\`/de/apps/[slug]\`* para os 8 slugs existentes no catálogo (*\`pocket-rag\`*, *\`agent-workspace\`*, *\`smart-inspector\`*, *\`support-bot\`*, *\`prompt-forge\`*, *\`agentic-workflow\`*, *\`brief-generator\`*, *\`ai-ops-deployment\`*).

\- [ ] **\*\*Sobre\*\***: *\`/about\`* (EN), *\`/pt/about\`* (PT), *\`/de/about\`* (DE).

\- [ ] **\*\*Roadmap\*\***: *\`/roadmap\`* (EN), *\`/pt/roadmap\`* (PT), *\`/de/roadmap\`* (DE).

\- [ ] **\*\*Páginas Legais\*\***: *\`/datenschutz\`* e *\`/pt/datenschutz\`*, *\`/de/datenschutz\`*; *\`/impressum\`* e *\`/pt/impressum\`*, *\`/de/impressum\`*.



**### 11.2 Casos de Borda**



\- [ ] **\*\*Largura Estreita de 320px\*\***: Garantir que o cabeçalho editorial, a imagem da colagem abstrata e a lista linear de projetos não gerem rolagem horizontal indesejada.

\- [ ] **\*\*Zoom de 200% (Acessibilidade)\*\***: Refluxo limpo de todos os textos e controles.

\- [ ] **\*\*Extensão dos Textos em Alemão\*\***: Quebra correta e alinhamento de termos extensos (*\*Datenschutzerklärung\**, *\*Haftungsausschluss\**, *\*Arbeitserfahrung\**).

\- [ ] **\*\*Navegação Estrita por Teclado\*\***: Ordem natural de tabulação e anel de foco nítido nos temas claro e escuro.



\---



**## 12. Etapas de Implementação e Primeira Entrega Vertical**



**### Etapa 1: Auditoria e Estrutura de Rotas, Idiomas e SEO Inicial**

\- Implementação dos Route Groups *\`app/(en)\`* e *\`app/[locale]\`* para garantia de *\`\<html lang="...">\`* correto no SSR.

\- Redirecionamento permanente de *\`/en\`* para *\`/\`* em *\`next.config.mjs\`*.

\- Criação dos endpoints dinâmicos *\`app/robots.ts\`* e *\`app/sitemap.ts\`*.

\- Mapeamento centralizado de *\`canonical\`* e *\`hreflang\`* recíprocos em *\`lib/i18n/routing.ts\`*.

\- *\*Critério de Aceite\**: *\`curl -s http\://localhost:3000/pt | grep -i '\<html'\`* retorna *\`\<html lang="pt-BR">\`*; requisições para *\`/robots.txt\`* e *\`/sitemap.xml\`* retornam HTTP 200 válido.



**### Etapa 2: Fundação do Design System e Temas**

\- Integração das fontes editoriais via *\`next/font/google\`* (*\`Playfair Display\`* ou *\`Instrument Serif\`* + *\`Inter\`*).

\- Definição dos tokens semânticos no CSS e Tailwind para os temas Claro e Carvão Quente.

\- Validação de contraste das cores e estados de foco.



**### Etapa 3: Preparação da Arte do Hero e Revisão da Composição Estática (Marco de Bloqueio)**

\- Otimização do arquivo de imagem da colagem abstrata fornecida para WebP local de alta resolução (*\`public/images/editorial/hero-collage.webp\`*).

\- Implementação do container responsivo do Hero preservando o aspect ratio sem cortes danosos.

\- Integração visual nos dois temas:

  - Fundo marfim da imagem fundido ao marfim da página no tema claro.

  - Apresentação como peça física de papel de arte montada sobre carvão no tema escuro, sem inversão de cores.

\- *\*Critério de Aceite\**: **\*\*Aprovação formal do usuário sobre a composição estática do Hero com a arte abstrata e os textos oficiais antes de qualquer implementação de movimento.\*\***



**### Etapa 4: Primeira Entrega Vertical**

\- Cabeçalho editorial com monograma, navegação e linha de metadados.

\- Hero editorial apresentando o nome do autor, cargo oficial *\`text.role\`*, introdução oficial *\`text.intro\`*, links de ação e arte abstrata estática aprovada.

\- Faixa tipográfica com movimento estritamente acoplado ao progresso da rolagem (parou o scroll, parou a faixa).

\- Seção Selected Work com lista à esquerda e prévia sticky à direita para os 3 projetos aprovados (*\`AI Review Platform\`*, *\`Pocket RAG\`* e *\`Agent Workspace\`*), incluindo botão de seleção acessível separado do link de navegação e adaptação linear para mobile.

\- *\*Critério de Aceite\**: Primeira entrega vertical operando na Home em desktop e mobile, com dados aprovados preservados e sem dependências pagas de terceiros.



**### Etapa 5: Revisão Visual e Funcional da Primeira Entrega**

\- Avaliação compartilhada com o usuário confrontando a entrega com os critérios de fidelidade estética (equilíbrio cromático, tipografia, textura da arte abstrata, hairlines, estabilidade sticky e responsividade).

\- Refinamento de detalhes apontados pelo usuário.



**### Etapa 6: Expansão para as Demais Rotas**

\- Adaptação das páginas *\`/experience\`*, *\`/apps\`*, *\`/about\`*, *\`/roadmap\`* e páginas legais para a nova linguagem editorial.

\- Atualização do *\`components/Footer.tsx\`*.



**### Etapa 7: Validação Final e Checklist Pós-Deploy**

\- [ ] Execução com sucesso de *\`npm test\`*, *\`npm run lint\`* e *\`npm run build\`*.

\- [ ] Validação de dados estruturados JSON-LD via Schema Markup Validator.

\- [ ] Verificação de cabeçalhos de segurança e ausência de *\`noindex\`* no ambiente de produção.

\- [ ] Envio e inspeção do sitemap no Google Search Console após publicação.
