# Prompt master: validação de design, UX/UI e posicionamento da pesquisa TVDE só com local

Prompt para o agente que vai validar, em design, UX/UI e posicionamento, a
mudança de 15/10/2026 no fluxo TVDE: a pesquisa pede só o local de
levantamento, cada cartão de viatura TVDE diz onde a viatura pode ser
levantada, e a data e a hora escolhem-se na página da viatura. Mexe só em
apresentação, texto de interface e layout. Não altera `src/services`,
`src/app/api` nem `src/domain`, e não inventa disponibilidade, locais nem
prazos. Copiar a partir de "Papel".

Origem: conversa de 15/10/2026 com o Thiago Sousa (marketing DaspRent) e o
João. A pesquisa TVDE não precisa de data e hora; o motorista escolhe a
unidade primeiro (para ver só as viaturas certas para a localização), vê as
viaturas e escolhe a data ao reservar. A própria viatura diz onde está
disponível.

Estado: **implementado (15/10/2026), por validar e por publicar.** Decisão em
`DECISIONS.md` (entrada de 2026-10-15); contrato em `docs/design-system.md`
(`TvdeSearchForm`, `PickupSelector`, `VehicleCard` TVDE). O relatório desta
validação vai para `docs/design/validacao-pesquisa-tvde.md`.

---

## Papel

És o designer de produto e developer front-end da DÉCADA OUSADA. A direção
visual, os fluxos e as regras de layout foram fechados pelos prompts master
anteriores (`PROMPT-MASTER-DESIGN.md`, `PROMPT-MASTER-UX-UI.md`,
`PROMPT-MASTER-POSICIONAMENTO-CORRETO.md`). Este trabalho confirma que a
mudança cumpre esses critérios, e corrige o que não cumprir:

1. **`TvdeSearchForm`** (`src/components/tvde/tvde-search-form.tsx`). Saíram
   "Data de início" e "Hora". Ficam o seletor "Local de levantamento" e o botão
   "Ver viaturas TVDE", que leva a `/tvde/viaturas?local=<id>`. Só é usado no
   cartão da hero (`HeroSearch`, `layout="stack"`), na página inicial (separador
   TVDE) e em `/tvde` (`only="tvde"`). A utility `grid-tvde-search` foi
   retirada.
2. **Listagem** (`src/app/[region]/tvde/viaturas/page.tsx`). Filtra pelo
   local; a faixa diz "Viaturas com levantamento em <local>." com `MapPin` e o
   link "Alterar"; o `PageHeader` explica que a data se escolhe na viatura. Uma
   viatura sem restrição de locais no WeGest recebe todos os locais TVDE da
   região.
3. **Cartão TVDE** (`src/components/vehicles/vehicle-card.tsx`, `TvdeCard`).
   Nova linha "Levantamento em <locais>" com `MapPin`, abaixo da linha
   categoria/caixa/lugares e acima do recibo (Sinal / Por semana).
4. **Página da viatura** (`src/app/[region]/tvde/viatura/[slug]/page.tsx`,
   `PickupSelector`). Sem mudança de código: o local da pesquisa chega
   pré-selecionado, a data vem por omissão a hoje + 2 dias e a disponibilidade
   consulta-se ao WeGest a cada alteração. `?inicio=` de links antigos ainda
   preenche a data.

O objetivo: que o motorista perceba, sem ler duas vezes, **onde** vai levantar
a viatura (na pesquisa, na lista, no cartão e na viatura) e **quando** escolhe
a data (só na viatura), e que nada fique vazio, desequilibrado, repetido ou
fora do sítio em qualquer largura e nas duas regiões.

## Leitura obrigatória

1. `AGENTS.md`, `BLUEPRINT.md`, `DECISIONS.md` (entrada de 2026-10-15 e a
   revisão de 2026-10-08 que criou o `TvdeSearchForm`).
2. `docs/design/direcao-de-design.md`, `docs/design/ux-ui.md`,
   `docs/design/posicionamento.md`: referência fechada; não se reabre aqui.
3. `docs/design-system.md`, `docs/accessibility.md`, `docs/responsive.md`,
   `docs/content-style.md`, `docs/anti-ai.md`.
4. Código: os quatro ficheiros acima, mais `src/components/shared/hero-search.tsx`
   (`TvdeSteps`, `SERVICE.tvde`), `src/components/vehicles/vehicle-results.tsx`,
   `src/components/tvde/pickup-selector.tsx`, `src/app/[region]/tvde/page.tsx`,
   `src/app/[region]/page.tsx` e `src/app/[region]/tvde/candidatura/page.tsx`
   (estado vazio "Escolha primeiro a viatura e o levantamento").

## Regras que se mantêm

- **A API é a fonte de verdade.** A lista não consulta disponibilidade (não há
  data), por isso nenhum texto pode dizer "disponível hoje", "disponível agora"
  nem usar selo de disponibilidade na lista. A disponibilidade só se afirma no
  `PickupSelector`, depois da resposta do WeGest.
- **O local vem primeiro.** Não reintroduzir data nem hora na pesquisa, e não
  propor retirar o local (decisão da equipa).
- **O sinal não é aprovação.** O texto "O sinal reserva a viatura. A aprovação
  depende da análise da candidatura." mantém-se onde está.
- Reutilizar antes de criar; tokens antes de valores soltos (nenhum `#hex`,
  `text-[..]`, `shadow-[..]`); nenhuma dependência nova.
- Ícones com função (`docs/anti-ai.md`): o `MapPin` marca "isto é um local".
  Mesmo ícone, mesmo tamanho e mesma relação com o texto em todas as
  instâncias do fluxo TVDE.
- PT-PT, zero travessões, sem "não é X, é Y", sem trincas de enfeite. Commits
  só quando o utilizador pedir.

---

## A. Design

1. **Peso do cartão da hero.** O painel TVDE ficou mais curto (só um campo). Na
   página inicial os dois separadores partilham a célula da grelha e o painel
   TVDE estica até à altura do Rent a Car, dando o espaço a mais ao bloco "Como
   funciona" (`flex-1`). Confirmar que esse bloco não fica com espaço morto
   visível no fundo nem com os passos desalinhados ao centro de uma caixa alta
   demais. Em `/tvde` (`only="tvde"`), confirmar que o cartão curto não parece
   inacabado ao lado do texto da hero.
2. **Hierarquia do cartão TVDE.** Ordem de leitura: nome, categoria e caixa,
   local de levantamento, recibo (Sinal / Por semana), condições, "Ver
   viatura". A linha do local não pode competir com o nome nem com os preços em
   Anton. Rever peso (`font-medium`), cor (`text-on-dark` contra
   `text-on-dark/75` da linha de cima) e espaçamento (`mt-2` dentro do bloco do
   título).
3. **Muitos locais.** No Continente há vários pontos TVDE. Com 3 ou mais nomes
   longos, a linha "Levantamento em ..." pode passar de duas linhas e
   desalinhar os recibos entre cartões da mesma fila. Decidir com intenção:
   lista completa, "Levantamento em X e mais N" ou o local da pesquisa em
   destaque. Documentar a escolha em `docs/design-system.md`.
4. **Faixa da listagem.** A faixa "Viaturas com levantamento em <local>."
   usava `CalendarRange`; agora usa `MapPin`. Confirmar que o ícone, o texto e
   o link "Alterar" se leem como uma única linha de contexto e não como três
   peças soltas.
5. **Repetição de texto.** O cabeçalho, a faixa, o cartão e o `ServiceIntro`
   ("Preço por semana e candidatura online, com análise antes do
   levantamento.") falam todos de levantamento. Cortar o que diz a mesma coisa
   duas vezes no mesmo ecrã.

## B. UX/UI

1. **Expectativa da pesquisa.** O botão diz "Ver viaturas TVDE". Ao chegar à
   lista, o motorista percebe que vê as viaturas daquele local e que a data vem
   depois? Ler o ecrã a 360 px acima da dobra: o contexto tem de estar visível
   sem scroll.
2. **"Alterar".** Hoje leva a `/tvde`, que mostra a pesquisa na hero. Avaliar se
   o destino devolve o motorista à escolha do local sem procurar (âncora para
   o cartão, ou o local pré-selecionado). Não criar um segundo formulário na
   listagem sem motivo registado.
3. **Lista sem `?local=`.** Vindo dos links "Ver viaturas TVDE" espalhados pelo
   site (`tvde-highlights`, `tvde-requirements`, `entrar`, `minha-conta`,
   página inicial), a lista mostra todas as viaturas da região sem faixa.
   Confirmar que cada cartão continua a dizer onde levantar e que isso basta
   para escolher.
4. **Estado vazio.** Local sem viaturas: "Sem viaturas TVDE em <local> de
   momento" com "Ver todas as viaturas". Confirmar texto e ação; nada de prazo
   inventado.
5. **Passagem para a viatura.** O link do cartão leva `?local=`. Na página da
   viatura, o local vem marcado, a data vem preenchida (hoje + 2) e a
   disponibilidade aparece sem ação extra. Verificar se a data por omissão está
   clara como escolha editável e não como data já reservada. Viatura aberta sem
   `?local=`: o primeiro ponto vem marcado; confirmar que isso não engana.
6. **Passos "Como funciona".** O passo 1 diz "Escolha a viatura e a data de
   início." e continua certo. Confirmar que nenhum outro texto do site (FAQ,
   `TvdeProcess`, `TvdeHighlights`, `docs/conteudo/`) ainda diz que a data se
   escolhe na pesquisa.

## C. Posicionamento correto

Em 360, 768, 1024 e 1440 px, nas duas regiões (`?regiao=continente` e
`?regiao=acores`), com o aviso de cookies fechado e aberto:

1. **Faixa da listagem a 360 px.** Hoje o `flex-wrap` deixa o `MapPin` sozinho
   numa linha e o texto por baixo. O ícone fica alinhado à primeira linha do
   texto, à esquerda, e "Alterar" não fica órfão numa linha própria sem
   relação visual.
2. **Cartão TVDE.** O `MapPin` alinha com a primeira linha do texto (o
   `mt-0.5` foi pensado para `text-body-small`); a segunda linha do local
   alinha com o texto, não com o ícone. Em grelha de 2 (`sm`) e de 3 (`xl`),
   os recibos e o botão "Ver viatura" ficam à mesma altura entre cartões da
   mesma fila.
3. **Cartão da hero.** O seletor e o botão ocupam a largura toda e ficam
   colados ao fundo do cartão, com o mesmo espaçamento do painel Rent a Car. A
   1024 px, onde a hero aperta, nada sai do cartão.
4. **Teclado.** Na hero: separador TVDE, seletor, botão, por esta ordem, com
   foco visível. Na listagem: "Alterar", filtros, ordenação e cada cartão
   (anel duplo do cartão TVDE). Alvos de toque de 44 px em mobile ("Alterar"
   usa `max-md:tap-target`).
5. **Sem scroll horizontal** em nenhuma largura, incluindo nomes longos como
   "Aeroporto de Ponta Delgada".

---

## Como testar

- `WEGEST_MODE=mock` (o `.env.local` por omissão): Açores com `LOC-PDL` e o
  aeroporto, Continente com vários pontos.
- Percurso completo: `/?regiao=acores` → separador TVDE → "Ver viaturas TVDE" →
  lista → um cartão → página da viatura → "Candidatar-me a esta viatura".
  Repetir a partir de `/tvde?regiao=continente`.
- Links antigos: `/tvde/viaturas?local=LOC-PDL&inicio=2026-10-20T10:00` não
  dá erro, e `/tvde/viatura/<slug>?local=LOC-PDL&inicio=2026-10-20T10:00`
  pré-preenche a data.
- `npm run check`, `npm run qa`, consola sem erros, teclado do princípio ao
  fim do percurso.

## Fase 1: diagnóstico

Entrega A, B e C em `docs/design/validacao-pesquisa-tvde.md`: ecrã, largura,
região, problema, regra violada, correção proposta, ficheiros. O que estiver
certo entra também, numa linha, para ficar provado que foi visto.

## Fase 2: correção

Um item de cada vez, no componente de origem. Depois de cada item, `npm run
check`, `npm run qa` e browser em 360 e 1440 px nas duas regiões. Uma mudança
no cartão TVDE não mexe no cartão Rent a Car.

## Fase 3: fecho

`docs/design-system.md` (contratos atualizados), `CHANGELOG.md` e versão em
`package.json` ao publicar, a partir do `main`.

## Antes de declarar concluído

```
[ ] Nenhum texto afirma disponibilidade na lista; só o PickupSelector o faz
[ ] O local aparece com o mesmo MapPin na hero, na faixa, no cartão e na viatura
[ ] Nenhuma referência a "data de início" na pesquisa em código, copy ou docs
[ ] Cartões da mesma fila com recibos e botões alinhados, com 1 e com 3+ locais
[ ] Hero da página inicial sem espaço morto no painel TVDE
[ ] npm run check e npm run qa passam; consola limpa
[ ] Testado em 360, 768, 1024 e 1440 px, Continente e Açores
[ ] Foco visível e alvos de 44 px em mobile
[ ] Nenhum valor arbitrário novo; design-system.md atualizado
[ ] Nenhuma alteração em src/services, src/app/api ou src/domain
```
