# Validação: pesquisa TVDE só com local

Relatório do `PROMPT-MASTER-VALIDACAO-PESQUISA-TVDE.md`, 15/10/2026. Testado
com `WEGEST_MODE=mock` em 360, 768, 1024 e 1440 px, Continente e Açores.

## Fase 1: diagnóstico

| # | Ecrã | Largura, região | Problema | Regra | Correção | Ficheiros |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Listagem, cartão TVDE | 1440, Açores | Com "Ponta Delgada, Aeroporto de Ponta Delgada" (2 linhas) ao lado de "Ponta Delgada" (1 linha), os recibos Sinal / Por semana da mesma fila ficavam a alturas diferentes | Posicionamento: elementos iguais alinhados na fila | Linha do local passou para cima de "Ver viatura", empurrada para o fundo (`mt-auto`). O recibo segue logo a seguir à categoria | `vehicles/vehicle-card.tsx` |
| 2 | Cartão TVDE | todas | Lista de locais com vírgulas ("Leiria, Lisboa, Porto") | `content-style.md`: português natural | `Intl.ListFormat("pt-PT")`: "Leiria, Lisboa e Porto" | `vehicles/vehicle-card.tsx` |
| 3 | `/tvde`, "Viaturas em destaque" | todas | Viaturas sem restrição de locais no WeGest apareciam sem linha de local; na listagem apareciam com todos os locais. O mesmo cartão tinha dois comportamentos | Reutilizar: o mesmo dado com o mesmo desenho | Helper `withPickupLocations` usado nas duas páginas | `lib/pickup-locations.ts`, `tvde/page.tsx`, `tvde/viaturas/page.tsx` |
| 4 | Listagem, faixa de contexto | 360, Açores | "Alterar" caía sozinho numa linha, longe do texto que altera | Posicionamento: uma linha de contexto, não peças soltas | Fila única sem `flex-wrap`: ícone, texto (`flex-1`), "Alterar" à direita | `tvde/viaturas/page.tsx` |
| 5 | Listagem, "Alterar" | 360 | Levava ao topo de `/tvde`; a pesquisa ficava abaixo da dobra | UX: voltar à escolha sem procurar | Destino `/tvde#pesquisa`, âncora no cartão da hero com `scroll-mt-24` | `tvde/viaturas/page.tsx`, `tvde/page.tsx` |
| 6 | Página inicial, separador TVDE | 1024 e 1440 | Sem data e hora, o painel encolheu e a caixa "Como funciona" (`flex-1`) esticava com espaço vazio em cima e em baixo | `anti-ai.md`: espaço sem função | Passos no tamanho natural; pesquisa encostada ao fundo (`mt-auto`), com o botão no mesmo sítio do Rent a Car | `shared/hero-search.tsx` |
| 7 | Pesquisa TVDE | todas | Sem campo de data, nada dizia onde se escolhe a data | UX: expectativa da pesquisa | Dica sob o seletor, ligada por `aria-describedby`: "A data de levantamento escolhe-se na viatura." | `tvde/tvde-search-form.tsx` |
| 8 | Listagem, cabeçalho | 360 | Descrição de 4 linhas, repetida pela faixa | `content-style.md`: não dizer duas vezes | "Preço por semana. A data de levantamento escolhe-se em cada viatura, onde a disponibilidade é confirmada." | `tvde/viaturas/page.tsx` |

### Visto e certo

- Nenhum texto da listagem afirma disponibilidade; só o `PickupSelector` o faz,
  depois da resposta do WeGest.
- "Escolha a viatura e a data de início." (passos da hero) continua certo. Não
  há mais referências à data na pesquisa em código, FAQ nem `docs/conteudo/`.
- Página da viatura: local da pesquisa pré-selecionado, data por omissão hoje
  \+ 2 num campo `date` editável, disponibilidade consultada sem ação extra.
- Estado vazio por local ("Sem viaturas TVDE em <local> de momento", "Ver todas
  as viaturas"): sem prazos inventados.
- `/tvde` (`only="tvde"`): o cartão curto ao lado do texto da hero não parece
  inacabado.
- Sem scroll horizontal em 360, 768 e 1440 px.

### Decisões tomadas aqui

- **Local junto ao botão em vez de debaixo do nome.** Debaixo do nome, o número
  de locais (1 nos Açores reais, até 3 no mock do Continente) mudava a altura
  do topo do cartão e desalinhava os preços. Junto a "Ver viatura", o local lê-se
  como "onde levanta esta viatura" antes da ação, e os recibos alinham. Sem
  divisória por cima: com alturas diferentes, a linha salientava o desnível.
- **Lista completa de locais**, sem "e mais N": hoje são no máximo 3 nomes
  curtos por viatura. A revisitar se o WeGest devolver mais pontos.

## Fase 2: correção

Os 8 itens estão corrigidos. Verificação depois das correções:

- Açores a 1440 px: recibos e botões da mesma fila à mesma altura com 1 e 2
  locais.
- 360 px: faixa numa só fila; "Alterar" leva ao cartão de pesquisa de `/tvde`.
- Página inicial a 1024 px: caixa dos passos sem vazio interno. Fica um vão de
  63 px entre os passos e a pesquisa, que se lê como separação entre informação
  e ação.
- `/tvde` no Continente: os 6 destaques mostram "Levantamento em ...".

- Teclado na página inicial: separador TVDE, seletor (borda e anel de foco do
  `control` partilhado, com a dica anunciada por `aria-describedby`), botão
  (contorno de foco); Enter abre `/tvde/viaturas?local=`.

## Depois da validação

Ao tirar as capturas para avaliação: o cartão do Toyota Yaris Cross (Açores)
dizia "Ponta Delgada e Aeroporto de Ponta Delgada", mas na página da viatura só
Ponta Delgada se podia escolher (o aeroporto não é local TVDE). O cartão usava
os locais da viatura sem os cruzar com os locais TVDE, ao contrário da página
da viatura. `withPickupLocations` passou a aplicar a mesma regra; conferido no
Continente (cartão "Leiria e Lisboa", viatura com Leiria e Lisboa).

Capturas a 390 px, Açores, em `docs/design/capturas/pesquisa-tvde/`.

Na avaliação das capturas, o Thiago (DASP) pediu que o botão da página da
viatura diga "Reservar esta viatura" em vez de "Candidatar-me a esta viatura",
porque o passo seguinte vai ser pagar e criar a reserva no WeGest pela API.
Texto trocado em `tvde/pickup-selector.tsx` e captura 4 refeita.

## Com a API real

15/10/2026, `WEGEST_MODE=http` (build local na porta 3011), só leitura, 390 px:

- Locais TVDE: "Açores" nos Açores; Leiria, Prior Velho e Vila Nova de Gaia
  no Continente. 14 viaturas nas duas regiões, sem scroll horizontal.
- Nenhuma viatura TVDE tem restrição de local no WeGest: todos os cartões
  mostram todos os locais da região e escolher o local não reduz a lista.
- Página da viatura: local pré-selecionado e disponibilidade confirmada
  ("Disponível para levantamento a 17/10/2026 às 10:00").
- Com `WEGEST_PEDIDOS_ONLINE` desligado, o botão "Reservar esta viatura" não
  aparece: fica só "Contactar a equipa". O aviso que o acompanhava ("As
  reservas online ainda não estão disponíveis") saiu das páginas da viatura TVDE
  e Rent a Car a pedido do Luiz; continua só como erro da API, se alguém
  submeter com os pedidos desligados.
- Só o Fiat Panda tem foto, e a foto mostra a matrícula; as outras 13 mostram
  a silhueta.
