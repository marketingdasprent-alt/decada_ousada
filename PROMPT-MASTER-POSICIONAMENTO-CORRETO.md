# Prompt master: posicionamento correto dos elementos

Prompt para o agente que vai garantir que cada elemento da plataforma DÉCADA
OUSADA está no sítio certo: alinhamento, grelhas, ritmo vertical, quebras de
linha, ordem de leitura e comportamento em cada largura. Mexe só em layout e
apresentação. Não altera conteúdo, fluxos, tokens de cor nem lógica. Copiar a
partir de "Papel".

Origem: pedido de 07/10/2026 para criar os prompts master de design, UX/UI e
posicionamento correto. Equivalente ao `qa:layout` do projeto BV Seguros.

Estado: **fases 1, 2 e 3 feitas (08/10/2026).** Relatório e resultado em
`docs/design/posicionamento.md`; script em `scripts/qa-layout.mjs`;
alterações em `CHANGELOG.md` 0.5.0.

---

## Papel

És o developer front-end responsável pela precisão de layout. O site usa
`Container` (largura) e `Section` (ritmo vertical) do Blueprint, grelhas
Tailwind e utilidades nomeadas (`grid-main-aside`, `grid-label-value`, ...).
Foi migrado de classes soltas para tokens numa só passagem: é aí que costumam
ficar desalinhamentos, margens duplicadas e quebras feias.

O teu trabalho é medir, não opinar: cada problema tem de ser reproduzível numa
largura concreta, com um screenshot e uma regra que o explica.

## Leitura obrigatória

1. `AGENTS.md`, `BLUEPRINT.md` (secção "Layout rules"), `DECISIONS.md` (overrides
   de `Container`/`Section` e da escala de espaçamento).
2. `docs/design-system.md`, `docs/stack.md` (utilidades de layout),
   `docs/responsive.md`, `docs/content-style.md` secção "Line composition".
3. `docs/lessons-learned.md`.
4. Referência: `../BVseguros/scripts/qa-layout.mjs` (verificação de layout em
   Chrome headless, sem dependências).
5. Código: `src/components/shared/ui.tsx` (`Container`, `Section`),
   `src/app/globals.css` (`.layout-*`), `src/styles/tailwind.css`,
   `src/components/**`, `src/app/[region]/**`.

## Regras que se mantêm

- `Container` é o único sítio onde se decide a largura da página; `Section` o
  único sítio onde se decide o ritmo vertical entre blocos. Margens soltas entre
  secções (`mt-20` numa página) são defeito.
- Sobreposições intencionais (o formulário de pesquisa a subir sobre o hero com
  margem negativa) são composição, não defeito: ficam, mas documentadas.
- Nenhum valor arbitrário novo. Se falta uma largura ou coluna, cria-se token
  `--layout-*` + utilidade nomeada, com entrada em `DECISIONS.md`.
- Não mudar texto para "caber": se uma quebra de linha parte um elo
  gramatical, resolve-se com layout ou com `text-nowrap` num grupo de palavras.
- PT-PT, zero travessões. Commits só quando o utilizador pedir.

---

## A. Verificação automática (`npm run qa:layout`)

Cria `scripts/qa-layout.mjs` a partir do script do BV Seguros, adaptado:

- URL base `http://localhost:3000`; corre nas duas regiões
  (`?regiao=continente` e `?regiao=acores` na primeira visita, fica em cookie).
- Larguras: 375, 560, 768, 880, 1024, 1200, 1280, 1440, 1920.
- Rotas: as páginas fixas, uma página de viatura Rent a Car e uma TVDE por
  região (ler os slugs de `src/services/wegest/mock/data.ts`), uma página de
  cidade, os resultados com datas, o checkout, os 4 passos da candidatura, as
  áreas de cliente (com sessão da conta de demonstração) e a 404.
- Verificações por página e largura:
  1. sem scroll horizontal da página;
  2. nenhum elemento sai do `Container` (exceto faixas de fundo de `Section`);
  3. cards lado a lado na mesma linha têm a mesma altura e o conteúdo começa à
     mesma altura (título, preço e botão alinhados entre cards);
  4. em grelhas que quebram para várias linhas, a última linha não fica com um
     card órfão desalinhado;
  5. colunas `grid-main-aside`: a coluna lateral fica abaixo do conteúdo em
     mobile e "sticky" só quando cabe na altura do ecrã;
  6. nenhum texto cortado (`scrollWidth > clientWidth` em elementos com texto);
  7. alvos interativos com pelo menos 44 x 44 px em larguras abaixo de 768;
  8. elementos fixos (header, drawer de filtros, faixa de demonstração) não
     tapam conteúdo nem o foco do teclado.
- `--shots=<pasta no scratchpad>` guarda um screenshot por página e largura.
- Sem dependências novas; regista o script e a decisão em `DECISIONS.md`.

**Entregável A:** o script, `npm run qa:layout` em `package.json`, e a primeira
corrida com a lista de falhas.

## B. Inspeção manual (o que o script não vê)

Percorre as mesmas rotas no browser, nas larguras do ponto A, e verifica:

- **Eixo de alinhamento:** o texto do `PageHeader`, a pesquisa, as grelhas e o
  rodapé começam todos no mesmo eixo esquerdo do `Container`.
- **Ritmo vertical:** a distância entre secções vem só de `Section`; não há
  espaços duplicados (padding da `Section` + margem do filho) nem secções
  coladas.
- **Hierarquia por posição:** em cada card de viatura, a ordem é imagem →
  categoria → nome → especificações → preço → ação, igual em Rent a Car e TVDE;
  o preço está sempre no mesmo sítio.
- **Ação principal:** o botão principal de cada passo está sempre no mesmo canto
  (direita em desktop, largura total no fundo em mobile) e é o último elemento
  da ordem de tabulação do passo.
- **Resumos laterais:** o `BookingSummary` e o `TvdeSummary` ficam visíveis
  enquanto o utilizador decide (desktop) e acessíveis sem scroll longo (mobile).
- **Quebras de linha:** títulos em Anton (`.display`) e preços não partem elos
  gramaticais nem separam o valor da unidade ("39 €" | "/dia").
- **Formulários:** etiquetas, campos, ajudas e erros alinhados; campos curtos
  (código postal, CVV, hora) não esticam a toda a largura; grupos relacionados
  (data + hora, levantamento + devolução) ficam juntos em todas as larguras.
- **Estados:** skeletons ocupam o mesmo espaço do conteúdo final (sem salto de
  layout ao carregar); estados vazios e de erro centrados no espaço do
  conteúdo, não da página.
- **Região:** Continente e Açores têm exatamente o mesmo layout.

**Entregável B:** tabela rota / largura / problema / regra violada / screenshot /
correção proposta / ficheiros.

## C. Ordem de leitura e foco

Para cada página, compara a ordem visual com a ordem do DOM e a ordem de
tabulação. Em mobile, onde as colunas empilham, a ordem tem de continuar a fazer
sentido (por exemplo, o resumo do checkout não pode aparecer antes do passo que
o utilizador está a preencher se isso o obrigar a passar por ele com o teclado).

**Entregável C:** lista de divergências visual/DOM/foco com a correção.

---

## Fase 1: medição (sem alterar páginas)

Só o script do ponto A pode ser criado nesta fase. Entrega A, B e C em
`docs/design/posicionamento.md`, com screenshots referenciados. Termina com a lista
priorizada (máximo 20 itens, agrupados por componente para corrigir na origem e
não página a página) e a pergunta: "Aprovas a lista?"

Pára aqui e espera resposta.

## Fase 2: correção (depois de aprovado)

- Corrige no componente partilhado sempre que o problema se repete; só corrige
  numa página quando é exclusivo dela.
- Um item de cada vez. Depois de cada item: `npm run check`, `npm run qa`,
  `npm run qa:layout` sem regressões, e confirmação visual nas larguras afetadas.

## Fase 3: fecho

`npm run qa:layout` passa em todas as rotas, larguras e regiões. Atualiza
`docs/design-system.md` (regras de layout dos componentes),
`docs/responsive.md` se uma regra nova surgiu, e `CHANGELOG.md`.

---

## D. Por confirmar com o utilizador

- Se o script de layout entra no `npm run check` (mais lento, precisa do servidor
  a correr) ou fica como comando separado.
- Larguras mínimas suportadas (320 px?).

## Antes de declarar concluído

```
[ ] scripts/qa-layout.mjs criado, sem dependências novas, registado em DECISIONS.md
[ ] npm run qa:layout passa: todas as rotas, 9 larguras, 2 regiões
[ ] npm run check e npm run qa passam
[ ] Ritmo vertical só via Section; largura só via Container
[ ] Nenhum valor arbitrário novo
[ ] Ordem visual, DOM e foco coerentes em mobile e desktop
```
