# Posicionamento dos elementos

Relatório de `PROMPT-MASTER-POSICIONAMENTO-CORRETO.md`, de 08/10/2026: medição
(fase 1, secções A a D) e correção (fase 2, resultado no fim).
Screenshots de prova em `docs/design/posicionamento-shots/`.

## A. Verificação automática (`npm run qa:layout`)

Script novo: `scripts/qa-layout.mjs`, adaptado do `qa-layout.mjs` do BV Seguros.
Chrome headless pelo DevTools Protocol, sem dependências novas. Corre com o
servidor de desenvolvimento ligado:

```bash
npm run qa:layout
```

Opções: `--widths=375,1280`, `--regions=acores`, `--shots=pasta`,
`--json=ficheiro`, `--url=...`.

**Cobertura:** 2 regiões, 9 larguras (375, 560, 768, 880, 1024, 1200, 1280,
1440, 1920) e 32 rotas por região, num total de 576 páginas medidas. As rotas
são descobertas a partir dos próprios links do site:
- páginas fixas, uma cidade, resultados com e sem datas, uma viatura Rent a
  Car e uma TVDE;
- o checkout, a confirmação e os 4 passos da candidatura;
- as áreas de cliente (com a conta de demonstração) e a 404.

O script entra com a conta de demonstração e cria uma candidatura TVDE de
teste no estado em memória do servidor, para chegar aos passos de documentos
e pagamento.

**As 8 verificações** são as do prompt: scroll horizontal, fora do
`Container`, alturas na mesma linha, órfãos na última linha, coluna lateral e
sticky, texto cortado, alvos de 44 px abaixo de 768 px, e elementos fixos.

**Isenções, por serem composição intencional:**
- faixas com scroll horizontal que sangram até à borda (menu da área de
  cliente em mobile, `-mx-4` com `overflow-x-auto`);
- elementos `fixed` (barra do checkout);
- links esticados sobre um cartão (o alvo é o cartão inteiro);
- links dentro de uma frase (WCAG 2.5.8).

### Resultado da primeira corrida

| Verificação | Resultado |
|---|---|
| 1. Scroll horizontal | Nenhum com a página como carrega. Com "Alterar datas" aberto na viatura Rent a Car há scroll horizontal (ver A2) |
| 2. Fora do `Container` | Painel da viatura Rent a Car, 1024 a 1920 px; stepper TVDE a 375 px |
| 3. Alturas na mesma linha | Sem falhas |
| 4. Órfãos na última linha | Sem falhas |
| 5. Coluna lateral e sticky | Em mobile a coluna lateral fica sempre abaixo do conteúdo. Três painéis sticky mais altos do que o ecrã em 1024 a 1920 px |
| 6. Texto cortado | Sem falhas |
| 7. Alvos abaixo de 44 px | Em todas as páginas a 375 e 560 px (componentes partilhados) |
| 8. Elementos fixos | Cabeçalho sticky sem `scroll-padding-top` em todas as páginas e larguras; barra do checkout tapa o rodapé de 375 a 880 px |

**Continente e Açores** dão os mesmos resultados. A única diferença vem dos
dados: os filtros TVDE só passam a altura do ecrã no Continente, que tem mais
categorias.

**Limitações:** o script não mede saltos de layout ao carregar (skeleton
versus conteúdo final); isso fica na inspeção manual com rede lenta, na fase 2.

## B. Inspeção manual

| # | Rota / largura | Problema | Regra | Prova | Correção proposta | Ficheiros |
|---|---|---|---|---|---|---|
| B1 | Todas, todas as larguras | O cabeçalho é `sticky` (64 a 80 px) e o `html` não tem `scroll-padding-top`: ao navegar com Tab para cima, ou ao seguir uma âncora, o elemento focado pode ficar por baixo do cabeçalho | Elementos fixos não tapam o foco (WCAG 2.4.11) | script, verificação 8 | `scroll-padding-top` no `html` a partir de um token da altura do cabeçalho | `globals.css`, `tokens.css` |
| B2 | Viatura Rent a Car com datas, 1024 a 1920 | "Alterar datas" abre o formulário em modo `bar` (5 colunas lado a lado) dentro do painel lateral estreito: os campos saem do cartão e a página ganha scroll horizontal | Nada sai do `Container` | `01-painel-viatura-alterar-datas-1280.jpg` | Variante empilhada do formulário para colunas estreitas (o modo `bar` só em largura de página) | `rentacar/search-form.tsx`, `rent-a-car/viatura/[slug]/page.tsx` |
| B3 | Resultados Rent a Car e TVDE, viatura TVDE, 1024 a 1920 | Os filtros (até 1191 px) e o painel da viatura TVDE (até 1099 px) são `sticky` mas mais altos do que o ecrã: o fim só aparece no fim da página | Sticky só quando cabe | `02-filtros-sticky-1280x800.jpg`, `03-painel-tvde-sticky-1280x800.jpg` | Painel sticky com altura máxima do ecrã e scroll próprio (utilidade nomeada com token), ou sem sticky quando não cabe | `vehicles/vehicle-results.tsx`, `vehicles/vehicle-details.tsx`, `tailwind.css` |
| B4 | Checkout, 375 a 880 | No fim da página a barra fixa tapa o fim do rodapé (copyright e links) | Fixos não tapam conteúdo | `04-checkout-barra-sobre-rodape-375.jpg` | O espaço para a barra vai para o fim da página (depois do rodapé), não só para o fim do passo | `booking/booking-wizard.tsx`, `globals.css` |
| B5 | Candidatura TVDE, 375 | O stepper com 4 passos e o rótulo "Candidatura TVDE" na mesma linha passam 7 px do `Container`: o "4" fica cortado | Nada sai do `Container` | `08-stepper-tvde-375.jpg` | Em mobile o rótulo fica numa linha própria e o stepper ocupa a largura toda | `tvde/application-layout.tsx`, `shared/stepper.tsx` |
| B6 | Todas, 375 e 560 | Alvos abaixo de 44 px: ícone de conta no cabeçalho (42 x 40), separadores da área de cliente (42 px de altura), breadcrumbs (15 px), links do rodapé (15 px), etiquetas de checkbox (22 px), perguntas do FAQ (24 px), links soltos nos formulários de conta (22 px) | Alvos de 44 px em mobile (`docs/accessibility.md`) | `06-conta-separadores-375.jpg`, script | Altura mínima de 44 px em cada componente partilhado, sem mudar o tamanho do texto | `layout/site-header.tsx`, `account/account-nav.tsx`, `shared/page-header.tsx`, `layout/site-footer.tsx`, `shared/form.tsx`, página de perguntas frequentes, `account/auth-forms.tsx` |
| B7 | Áreas de cliente, entrar, registar | O ritmo vertical vem de `py-8 lg:py-10` e `py-14` no `Container`, fora do `Section` | Ritmo vertical só via `Section` | código | `Section` à volta do `Container` | `account/account-shell.tsx`, `account/auth-shell.tsx` |
| B8 | Cadastro TVDE, 375 a 1023 | O resumo (viatura, preço por semana, sinal) só aparece depois dos 17 campos, a cerca de 3400 px do topo | Resumos acessíveis sem scroll longo em mobile | `07-cadastro-tvde-resumo-no-fim-375.jpg` | Em mobile, uma linha de resumo antes do formulário (viatura, semana, sinal) que abre o resumo completo | `tvde/application-layout.tsx`, `tvde/tvde-summary.tsx` |
| B9 | Passos TVDE, 375 | "Guardar e continuar" e "Pagar ... e enviar candidatura" ficam à direita com a largura do texto; no checkout Rent a Car a ação principal ocupa a largura toda no fundo | Ação principal no mesmo sítio (largura total no fundo em mobile) | screenshots da corrida | Botão de largura total abaixo de `sm` | `tvde/application-steps.tsx` |
| B10 | Pagamento e dados, 1024 a 1920 | Campos curtos esticados: validade e CVV com 360 px cada, código postal com metade da coluna | Campos curtos não esticam | `05-pagamento-campos-curtos-1280.jpg` | Largura máxima por tipo de campo (token `--layout-field-*` e utilidade nomeada) | `payment/payment-form.tsx`, `booking/customer-form.tsx`, `tvde/dynamic-form.tsx` |
| B11 | Cartões de viatura | A ordem difere entre produtos: Rent a Car (imagem, nome, especificações, preço, cartão clicável) e TVDE (imagem, nome, sinal e semana, condições, "Ver viatura") | O prompt pede a mesma ordem nos dois | código | **Não corrigir.** A diferença vem da decisão de design aprovada (um cartão por produto, brief §127). Fica registada como exceção | `DECISIONS.md` |

**Verificado e sem problemas:**
- **Eixo esquerdo:** cabeçalho de página, pesquisa, grelhas e rodapé começam no mesmo eixo do `Container`.
- **Grelhas de cartões:** sem alturas diferentes e sem órfãos.
- **Quebras de linha:** nos títulos em Anton e nos preços das páginas vistas não há elos gramaticais partidos nem valor separado da unidade. O preço usa espaço não separável antes de "€".
- **Grupos de campos:** data + hora e levantamento + devolução ficam juntos em todas as larguras.

**Composições intencionais a documentar** (ficam como estão):
- a pesquisa que sobe 24 px sobre o cabeçalho (`-mt-6`) nas páginas Rent a Car;
- o menu da área de cliente com scroll horizontal até à borda em mobile.

## C. Ordem de leitura e foco

| Página | Visual | DOM e Tab | Avaliação |
|---|---|---|---|
| Homepage, mobile | Título, pesquisa, cartões dos serviços | Título, cartões, pesquisa | Divergência aceite na fase 2 de UX (o DOM segue o desktop); já em `DECISIONS.md` |
| Viatura | Mobile: galeria, painel de decisão, detalhes. Desktop: painel à direita | Galeria, painel, detalhes | Coerente |
| Checkout | Passo, resumo à direita (desktop), barra fixa (mobile) | Passo, resumo, barra, rodapé | Coerente: a barra vem depois do passo, antes do rodapé |
| Checkout, passo 3, desktop | "Voltar" à esquerda, "Pagar" à direita | "Voltar", "Pagar" | Coerente; a ação principal é a última do passo |
| Resultados, desktop | Filtros à esquerda, cartões à direita | Cerca de 25 controlos de filtro antes do primeiro cartão | **C1:** link "Saltar para os resultados" no início dos filtros (desktop) |
| Candidatura TVDE, mobile | Formulário, resumo no fim | Igual | Coerente mas tardio (ver B8) |
| Área de cliente | Menu, conteúdo | Igual | Coerente |

## Lista priorizada (para aprovar)

Agrupada por componente, para corrigir na origem.

| # | Item | Componente | Tipo | Esforço |
|---|---|---|---|---|
| 1 | Formulário de pesquisa empilhado em colunas estreitas (B2) | `search-form.tsx` | defeito visível (scroll horizontal) | P |
| 2 | `scroll-padding-top` com a altura do cabeçalho (B1) | `globals.css` + token | acessibilidade | P |
| 3 | Barra fixa do checkout não tapa o rodapé (B4) | `booking-wizard.tsx` | defeito visível | P |
| 4 | Stepper TVDE cabe em 375 px (B5) | `application-layout.tsx`, `stepper.tsx` | defeito visível | P |
| 5 | Painéis sticky com altura máxima do ecrã (B3) | `vehicle-results.tsx`, `vehicle-details.tsx` + utilidade | defeito em portáteis | M |
| 6 | Alvos de 44 px: cabeçalho e separadores da conta (B6) | `site-header.tsx`, `account-nav.tsx` | acessibilidade | P |
| 7 | Alvos de 44 px: breadcrumbs e rodapé (B6) | `page-header.tsx`, `site-footer.tsx` | acessibilidade | P |
| 8 | Alvos de 44 px: checkbox, FAQ, links dos formulários de conta (B6) | `form.tsx`, FAQ, `auth-forms.tsx` | acessibilidade | P |
| 9 | Resumo TVDE visível antes do formulário em mobile (B8) | `application-layout.tsx`, `tvde-summary.tsx` | UX mobile | M |
| 10 | Ação principal TVDE com largura total em mobile (B9) | `application-steps.tsx` | consistência | P |
| 11 | Ritmo vertical das áreas de cliente e de entrar/registar via `Section` (B7) | `account-shell.tsx`, `auth-shell.tsx` | regra do Blueprint | P |
| 12 | Larguras máximas para campos curtos (B10) | `payment-form.tsx`, `customer-form.tsx`, `dynamic-form.tsx` + token | acabamento | M |
| 13 | "Saltar para os resultados" nos filtros em desktop (C1) | `vehicle-results.tsx` | acessibilidade | P |
| 14 | Registar as exceções: cartões por produto (B11), pesquisa sobre o cabeçalho e menu da conta até à borda | `DECISIONS.md`, `docs/design-system.md` | documentação | P |

P = pequeno (menos de 1 hora), M = médio (meio dia ou menos).

## D. Por confirmar com o utilizador

- **`qa:layout` no `npm run check`?** A recomendação é ficar como comando separado. Precisa do servidor ligado e a corrida completa demora vários minutos; o `check` deve continuar rápido e sem servidor.
- **Largura mínima suportada:** a recomendação é 360 px. O script mede a partir de 375; acrescentar 320 só se o cliente o pedir.

**Lista aprovada a 08/10/2026.**

## Resultado da fase 2

Os 14 itens foram aplicados, na origem (componentes partilhados, tokens e
utilidades nomeadas), sem valores arbitrários novos.

| | Antes | Depois |
|---|---|---|
| Problemas no `qa:layout` (576 páginas, 9 larguras, 2 regiões) | 335 | 4 na corrida final (a faixa de pesquisa a 768 px); corrigidos e medidos de novo nessa página nas 9 larguras e 2 regiões: 0 |
| Scroll horizontal (incluindo "Alterar datas" aberto) | sim, em 1024 a 1920 | não |
| Painéis sticky mais altos do que o ecrã | 3 | 0 |
| Alvos de toque abaixo de 44 px em mobile | todas as páginas | 0 |
| Foco escondido pelo cabeçalho fixo | todas as páginas | 0 (`scroll-padding-top`) |

**Encontrado e corrigido durante a fase 2:**
- **Botões achatados na confirmação:** os botões da confirmação de reserva tinham 24 px de altura em mobile (`flex-1` numa coluna). Ficou registado como regra em `docs/responsive.md`.
- **Seta dos seletores sobre o texto:** em todos os `Select`, o `px-3.5` do controlo anulava o espaço da seta, e textos compridos como "Preço: mais baixo" ficavam por baixo dela.
- **Regressão da faixa de pesquisa:** com o espaço da seta corrigido, a faixa dos resultados deixou de caber numa linha a 768 px. Passou a uma linha só a partir de 1024 px; abaixo disso usa duas colunas, como o cartão de pesquisa.
- **Stepper e leitores de ecrã:** os passos não ativos estavam escondidos também para leitores de ecrã, que só ouviam números.

**Prova "depois":** `posicionamento-shots/01-depois-*`, `03-depois-*`, `04-depois-*` e `09-depois-saltar-resultados-1280.jpg`.

**Verificação:**
- `npm run check`, `npm run qa` e `npm run qa:layout` passam.
- O atalho "Saltar para os resultados" foi testado com teclado.
- **Limitação do teste:** em Chrome headless, `:focus` só se aplica com emulação de foco ativa.
