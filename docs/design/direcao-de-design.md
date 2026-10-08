# Direção de design: diagnóstico e proposta (fase 1)

Execução da fase 1 de `PROMPT-MASTER-DESIGN.md`, 07/10/2026. Nenhum ficheiro da
aplicação foi alterado. A fase 2 só começa depois de aprovada a lista no fim.

**Método.** 56 capturas de página inteira em `docs/design/shots/` (Chrome por
DevTools Protocol, emulação móvel real): 20 rotas em 375 e 1280 px, homepage e
resultados também em 768, 1024 e 1440 px, Continente e Açores, portais com a
conta de demonstração. Nenhuma página tem scroll horizontal. Contrastes
calculados pela fórmula WCAG 2.1; diferença de cor em ΔE (CIELAB). Skills:
`design:design-critique`, `design:design-system`, `frontend-design:frontend-design`.

**Resumo.** A base é sólida (tokens, componentes, fluxos completos), mas há
quatro problemas críticos: texto invisível nos cards TVDE da homepage, verde
dos Açores abaixo de AA nos botões, vermelho de marca indistinguível do
vermelho de erro, e a ação principal da página de viatura enterrada no fundo
em mobile. No plano da direção, o site cai em dois clichés de página gerada
(fundo quase preto dominante com um só acento; tiques de template) e Rent a
Car e TVDE parecem o mesmo produto.

---

## A. Identidade

Fonte única: os quatro logótipos do cliente em `public/brand`.

### Três atributos tirados do logótipo

1. **Movimento.** As três linhas do carro são finas, afiladas e abertas: sugerem
   velocidade sem desenhar um carro inteiro. São o elemento mais próprio da marca.
2. **Ousadia contida.** Lettering condensado, pesado, em maiúsculas, com a
   palavra "OUSADA" numa faixa inclinada. A ousadia está numa palavra, não em
   tudo.
3. **Contraste.** Preto e branco com **uma** cor de marca (vermelho no
   Continente, verde nos Açores). Existe versão para fundo branco e para fundo
   escuro: o fundo escuro não é obrigatório.

### Papel de cada cor (proposta)

| Cor | Papel | Não usar para |
|---|---|---|
| Vermelho `#b00000` / verde Açores | **Ação** (botão principal, link, foco) e identidade pontual (faixa inclinada, linhas do logótipo) | Seleção de opções, erros, bordas decorativas |
| Asfalto `#121315` | Texto, faixas de identidade (header, rodapé, produto TVDE) | Fundo dominante das páginas Rent a Car |
| Branco / papel | Fundo das páginas e cards | |
| Erro | Só validação e falhas | |

### Papel de cada tipo de letra

- **Anton** (`.display`): títulos de página e **números de decisão** (preço total,
  preço semanal). É o "um sítio" onde a ousadia gasta.
- **Archivo**: todo o resto, incluindo títulos de secção pequenos e cards.

### O que não fazemos

- Rótulo em maiúsculas por cima de cada título; separadores "·" em meta; "→" nos
  botões; ícone dentro de quadrado em cada card.
- Linhas do logótipo esbatidas ou cortadas ao acaso.
- Fotos de stock apresentadas como frota; selos, prémios ou números sem fonte.

### Contraste e distinção de cores (medido)

| Par | Rácio | Resultado |
|---|---|---|
| Branco sobre vermelho `#b00000` (botão) | 7,38 | AA |
| **Branco sobre verde `#0f9200` (botão Açores)** | **4,09** | **Falha AA** (texto de botão é tamanho normal) |
| Verde `#0f9200` sobre página (rótulos, links) | 3,78 | Falha AA |
| Vermelho de marca sobre escuro `#121315` | 2,52 | Só decorativo (curvas, ponto da região) |
| **CTA desativado: branco sobre vermelho a 50 %** | **1,76** | **Falha**, e parece estado de erro |
| Texto `copy-muted` sobre página | 4,60 | AA |
| Branco a 70 % sobre escuro | 9,38 | AA |
| Proposta: verde `#0b7a00` com branco / sobre página | 5,53 / 5,02 | AA |
| Proposta: erro `#8a1c5a` com branco | 8,77 | AA |

**Vermelho de marca vs. vermelho de erro: ΔE 9,3.** Abaixo de cerca de 10 o olho
trata-os como a mesma cor. Hoje a opção selecionada (cobertura no checkout, local
de levantamento TVDE) tem borda vermelha e lê-se como erro. Verde dos Açores vs.
verde de sucesso: ΔE 32,9, distinguível.

### Linhas do logótipo no hero

`shots/comparacao-swoosh.jpg`: o desenho do componente `Swoosh` é fiel ao
logótipo, mas a 25 % de opacidade sobre o escuro fica um vermelho acastanhado,
aparece cortado e passa por baixo do título. Perde o atributo "movimento".

---

## B. Diagnóstico visual

Contexto fixo: plataforma de aluguer em Portugal, dois produtos (Rent a Car ao
dia, TVDE à semana), antes do lançamento, objetivo reserva ou candidatura.

### Homepage (`co-home-*`, `ac-home-*`)

**Impressão geral.** Forte e reconhecível em 2 segundos (título condensado,
dois serviços lado a lado), mas é uma página escura com um acento, igual a
muitas outras.

| Achado | Severidade | Recomendação |
|---|---|---|
| Cards TVDE na faixa escura sem nome nem preço (texto branco herdado sobre card branco) | 🔴 Crítico | O card define a sua cor de texto; nunca herda da secção |
| Os dois serviços têm o mesmo peso no hero (cumpre §7) | ✅ | Manter |
| Faixas escuras: header + hero + faixa TVDE + rodapé = página maioritariamente escura | 🟡 | Escuro só para identidade e TVDE; Rent a Car em fundo claro |
| Bloco "Reserva online / Proteção / Sem surpresas" repete a grelha de 3 com ícone | 🟢 | Cortar ou integrar como texto junto à pesquisa |

- **O olho vai primeiro para:** o título. Correto, mas a pesquisa (a ação
  principal de Rent a Car) fica abaixo da dobra em 1280 x 800.
- **Fluxo de leitura:** título, dois cards de serviço, pesquisa, frota. A
  pesquisa repete o que o card "Rent a Car" já oferece (dois pontos de entrada).

### Resultados e frota (`co-rac-resultados-*`, `co-rac-frota-*`)

| Achado | Severidade | Recomendação |
|---|---|---|
| Com datas, o card diz "Desde 37 €/dia" (não é "desde", é o preço) e o total, que é o que se paga, fica secundário | 🟡 | Total em destaque, preço por dia como nota (variação RAC A) |
| Barra preta "Ver detalhes" em cada card: 9 barras pretas dominam a grelha | 🟡 | Card inteiro clicável, sem botão, ou ação discreta |
| Selo "Disponível" em todos os cards | 🟢 | Mostrar só exceções ("Últimas unidades", "Indisponível") |
| Furgões e 7 lugares desenhados como sedan | 🟡 | Silhueta por família de carroçaria |
| Título em 1 ou 2 linhas desloca preço e botão entre cards vizinhos | 🟢 | Passa para o prompt de posicionamento |

### Página de viatura (`co-rac-viatura-*`, `co-tvde-viatura-*`)

| Achado | Severidade | Recomendação |
|---|---|---|
| **Mobile: preço e ação aparecem depois de todo o conteúdo** (cerca de 1900 px de scroll; `shots/mobile-checkout-e-tvde.jpg`) | 🔴 Crítico | Painel de decisão logo a seguir à galeria em mobile |
| Galeria de 4 "ângulos" da mesma ilustração parece uma galeria falsa | 🟡 | Sem foto real: uma ilustração, sem miniaturas |
| CTA TVDE desativado a vermelho claro lê como erro | 🟡 | Estado desativado neutro |
| Local selecionado com borda vermelha lê como erro | 🔴 (ver A) | Seleção em asfalto + marca de verificação |
| TVDE: período mínimo e caução repetidos (painel, tabela, lista) | 🟢 | Uma fonte por informação |

### Checkout (`co-rac-checkout-*`)

Boa hierarquia em desktop: resumo à direita, total claro. A cobertura
selecionada tem borda vermelha (ver A). Em mobile o total só aparece no fim
da lista de extras: passa para o prompt de UX/UI.

### TVDE (`co-tvde-*`)

| Achado | Severidade | Recomendação |
|---|---|---|
| Mesmo topo, mesmo card e mesma grelha que Rent a Car: parece a mesma página com outro título | 🟡 | Direção própria (secção D) |
| "Como funciona" é uma sequência real: a numeração tem função | ✅ | Manter, com outro tratamento |
| Números gigantes esbatidos atrás de cada passo são decoração | 🟢 | Número legível, sem o efeito |

### Portais e institucionais (`co-conta-*`, `co-tvde-conta-*`, `co-entrar-*`, `co-faq-*`, `co-contactos-*`, `co-404-*`)

Sóbrios e legíveis. A banda escura grande no topo ("A MINHA CONTA") e o rodapé
completo são marketing num espaço de trabalho: banda compacta. Os marcadores
"a confirmar" (contactos, FAQ) estão visíveis e honestos.

### O que funciona

- Sistema de tokens e componentes coeso; nenhuma página com scroll horizontal.
- Tipografia condensada dá carácter imediato e liga ao logótipo.
- Resumos de preço claros, com IVA e caução visíveis antes de pagar.
- Troca Continente/Açores limpa: só a cor muda.

---

## C. Sistema visual

**Componentes revistos:** 41 | **Problemas:** 11 | **Pontuação:** 74/100

### Cobertura de tokens

| Categoria | Definidos | Valores soltos |
|---|---|---|
| Cor | 40 + ilustração | 0 (`npm run qa`) |
| Tipografia | 10 tamanhos | 0; mas `text-body-small` em 139 sítios, `text-body` em 7 |
| Raio | 5 | 0 (`control` 31, `panel` 30, `card` 11) |
| Sombra / z-index | 4 / 8 | 0 |

### Inconsistências e consolidação

| Problema | Onde | Proposta |
|---|---|---|
| Corpo de texto a 14 px por omissão (descrições, specs, avisos) | 139 usos de `text-body-small` | Corpo a `text-body`; `small` só para meta e notas |
| Estado selecionado = borda de marca, igual a "erro" | checkout, levantamento TVDE, pagamento, filtros | Token `--color-selected` (asfalto) + ícone de verificação |
| Estado desativado por opacidade | 5 sítios | Variante `disabled` com `panel-sunken` + `copy-muted` |
| Rótulo maiúsculo + tracking acima de títulos | 9 sítios | Remover onde não informa; manter só em navegação |
| Botões: `primary` só em 2 sítios por `buttonClass`, `dark` como CTA de cards | botões | `primary` = ação principal da página; cards sem botão |
| `.display` em títulos de secção pequenos (h3) | 1 sítio | Anton só em títulos de página e números de decisão |

### Completude dos componentes

| Componente | Estados | Variantes | Docs | Nota |
|---|---|---|---|---|
| Button | ⚠️ desativado por opacidade | ✅ | ✅ | 7/10 |
| VehicleCard | ⚠️ herda cor da secção | ⚠️ um só para dois produtos | ✅ | 5/10 |
| Field / Input / Select | ✅ erro, foco | ✅ | ✅ | 9/10 |
| Seleção (rádio em cartão) | ⚠️ seleção = erro | ⚠️ três implementações | ❌ | 4/10 |
| CarIllustration | ✅ | ⚠️ só sedan | ✅ | 6/10 |
| Notice / EmptyState / ErrorState | ✅ | ✅ | ✅ | 9/10 |

---

## D. Direção por produto

Mockup estático: `docs/design/variacoes/index.html` (captura
`shots/variacoes-1280.jpg`). Fora da aplicação; dados de demonstração.

**Rent a Car.** Tom de viagem; a pesquisa é a protagonista; fundo claro.
- **A: o total manda.** Total do período em Anton, preço por dia como nota,
  card inteiro clicável, disponibilidade só em exceção, silhueta por carroçaria,
  linha do logótipo como chão da ilustração. *Recomendada:* resolve 4 achados da
  secção B e funciona em mobile.
- **B: lista de comparação.** Uma viatura por linha, total e ação no mesmo eixo à
  direita. Melhor para comparar em desktop, mais longa em mobile.
- **Topo:** fundo claro, título curto e pesquisa ao lado (acima da dobra).

**TVDE.** Tom profissional; condições tão visíveis como o preço.
- **A: ficha de condições.** Preço semanal em Anton e uma régua com caução,
  "paga agora", km incluídos e período mínimo com o mesmo peso. Fundo claro.
- **B: o recibo.** Card escuro que responde à pergunta do motorista: quanto pago
  agora e quanto pago por semana. *Recomendada:* dá ao TVDE uma identidade
  própria (o escuro fica reservado ao produto profissional) sem nova cor.
- **Topo:** escuro, título, os 5 passos como sequência numerada, linhas do
  logótipo inteiras e nítidas.

**Portais.** Fundo claro, banda de título compacta, sem elementos de marketing.

Teste de `docs/anti-ai.md`: cada variação responde a uma pergunta do
utilizador (quanto pago no total; quanto pago agora e por semana) e reforça a
marca através do único elemento próprio (as linhas do logótipo e o Anton nos
números). Nenhuma acrescenta gradientes, vidro ou ícones decorativos.

---

## Lista priorizada

| # | Item | Tipo | Ficheiros | Esforço |
|---|---|---|---|---|
| 1 | Cards TVDE sem texto na faixa escura: `VehicleCard` define a sua cor de texto | rápido | `components/vehicles/vehicle-card.tsx` | P |
| 2 | Verde dos Açores para `#0b7a00` (hover e ativo derivados) | rápido | `styles/tokens.css` | P |
| 3 | Separar marca de erro: token de seleção neutro e erro distinto; aplicar a todas as opções em cartão | estrutural | `tokens.css`, `tailwind.css`, checkout, levantamento, pagamento, filtros | M |
| 4 | Mobile: painel de decisão logo a seguir à galeria na página de viatura | rápido | `components/vehicles/vehicle-details.tsx` | P |
| 5 | Estado desativado neutro (botões e links-botão) | rápido | `components/shared/ui.tsx`, `pickup-selector.tsx`, `application-steps.tsx` | P |
| 6 | Linhas do logótipo inteiras e nítidas só no topo TVDE e no rodapé; fora dos `PageHeader` | rápido | `shared/swoosh.tsx`, `page-header.tsx`, páginas de topo | P |
| 7 | Rent a Car em fundo claro (homepage, topo Rent a Car); escuro reservado a identidade e TVDE | estrutural | `app/[region]/page.tsx`, `rent-a-car/page.tsx`, `page-header.tsx` | M |
| 8 | Card Rent a Car variação A (total em Anton, card clicável, exceções de disponibilidade) | estrutural | `vehicle-card.tsx`, `vehicle-results.tsx` | M |
| 9 | Card TVDE variação B (recibo) e topo TVDE com os 5 passos | estrutural | novo `components/tvde/tvde-card.tsx`, `tvde/page.tsx` | M |
| 10 | Ilustração: silhuetas sedan, SUV/7 lugares e furgão pela família da categoria; sem miniaturas falsas | estrutural | `car-illustration.tsx`, `vehicle-gallery.tsx`, `mappers.ts` | M |
| 11 | Remover tiques de template: rótulos maiúsculos sem função, "·" em meta, "→" em botões, números esbatidos | rápido | homepage, `SectionHeading`, `tvde/page.tsx`, cards | P |
| 12 | Corpo de texto a `text-body`; `text-body-small` só para meta | estrutural | componentes de conteúdo | M |
| 13 | Uma fonte por informação na viatura TVDE (caução e período mínimo uma vez) | rápido | `vehicle-details.tsx`, `tvde/viatura/[slug]/page.tsx` | P |
| 14 | Portais com banda de título compacta | rápido | `account/account-shell.tsx` | P |
| 15 | Logótipo do header maior em desktop até existir versão horizontal compacta | rápido | `layout/site-header.tsx` | P |

Ordem sugerida: 1, 2, 4, 5 (correções), depois 3 e 12 (sistema), depois 6 a 11
e 13 a 15 (direção).

**Encaminhado para os outros prompts:** km TVDE por mês em vez de por semana,
total visível em mobile no checkout, linha temporal que mostra "Pagamento"
concluído sem pagamento na candidatura de demonstração (UX/UI); alinhamento de
preço e botão entre cards, texto do seletor de ordenação cortado
(posicionamento).

---

## E. Por confirmar com o cliente

- Logótipos em SVG e uma versão horizontal compacta para o header e o favicon
  (hoje só PNG quadrado com muito espaço vazio).
- Se aceita o Rent a Car em fundo claro e o escuro reservado ao TVDE.
- O verde dos Açores ligeiramente mais escuro (`#0b7a00`), por acessibilidade.
- Fotografias próprias da frota e direitos de uso; se a ilustração é aceitável
  no lançamento para modelos sem foto no WeGest.

---

**Aprovas a lista e a direção (Rent a Car A, TVDE B), ou queres cortar ou
reordenar?**

## F. Revisão de 08/10/2026 (feedback da equipa)

Sete pontos de feedback (nota de voz da equipa) e duas maquetes de referência
(DASP RENT: página inicial e lista de veículos de passageiros).

**Referências de mercado (Localiza e DASP RENT):**
- **Pesquisa primeiro:** a pesquisa é o primeiro elemento da página, logo abaixo do menu.
- **Produtos separados:** na Localiza, o aluguer para Uber ("ZARP") é um produto à parte, como o nosso TVDE.
- **Frota por categorias:** a Localiza mostra a frota por grupos ("similar a: ..."), não por uma lista com filtros.
- **Entrada por família:** a DASP RENT separa "Passageiros" de "Comerciais" na entrada.

**O que mudou:**

| Ponto | Resolução |
|---|---|
| Hero principal com pesquisa | `Hero` com foto da região e `HeroSearch` com separadores Rent a Car (ao dia) e TVDE (à semana), cada um com os seus campos e destino |
| Seletor de região | `RegionSwitch` segmentado "Continente / Açores" no cabeçalho (a partir de 640 px), no topo do menu móvel e na hero da página inicial em mobile |
| Identidade por região | Fotos próprias por região e cena (`lib/region-imagery.ts`), automóveis desde 08/10: no Continente a chave a abrir a viatura, uma rua de Lisboa com trânsito e o motorista ao volante; nos Açores um carro numa estrada entre pastagens e muros de pedra, a entrega da chave junto ao mar e uma viatura a circular à noite. Título da página inicial por região |
| Rent a Car sem passo intermédio | `/rent-a-car` passa a ser a página de categorias (Passageiros e Comerciais, com foto e "desde"); cada categoria abre os resultados já filtrados (`?categoria=`) |
| Hero nas páginas de produto | Rent a Car e TVDE com hero de foto e a pesquisa respetiva; os 5 passos do TVDE numa secção a seguir |
| Diferença entre serviços | `ServiceComparison` na página inicial: as mesmas cinco perguntas para os dois serviços |
| Referências | Aplicadas nos pontos acima |

**Segunda revisão (mesmo dia):**
- **Hero:** ao estilo da BV, com fotos a trocar.
- **Formulário à direita:** separadores grandes com cor, Rent a Car na cor da marca e TVDE em asfalto, e a diferença dita em cada um.
- **Página inicial:** saem os cartões "Rent a Car ou TVDE?".
- **Seletor de região:** cada região com a sua cor.
- **Forma por região:**
  - **Continente angular:** cantos de 2 a 8 px e linhas diagonais.
  - **Açores arredondado:** botões em pílula e linhas onduladas.

**Exceção à direção de 07/10:** a página TVDE deixa de abrir com o cabeçalho escuro e as linhas do logótipo; abre com a hero de foto, como as outras páginas de produto. As linhas do logótipo ficam no logótipo e no cabeçalho.
