# Revisão: pontos de levantamento e morada

Resultado de `PROMPT-MASTER-REVISAO-PONTOS-E-MORADA.md` (14/10/2026). Fases 1, 2
e 3 feitas no mesmo dia, por pedido do utilizador ("faça uma correção ... valide
todas as instâncias").

## Ponto de partida

- A API do WeGest devolve hoje os pontos só com o nome: `morada`, `horario`,
  `latitude` e `longitude` vêm a `null` (confirmado em produção a 14/10:
  Continente com Leiria, Prior Velho e Vila Nova de Gaia; Açores com "Açores").
- Os cartões em grelha de 4 colunas foram desenhados com os dados do mock (nome,
  morada, horário). Com os dados reais ficavam caixas só com o nome e, com 3
  pontos, o primeiro esticava para duas colunas.
- A página inicial já tinha passado a lista (versão 0.18.2 mais o ícone
  `MapPin`). `/rent-a-car` e `/contactos` continuavam com os cartões.

## Fase 1: diagnóstico

| # | Instância | Largura / região | Problema | Regra | Correção | Ficheiros |
|---|---|---|---|---|---|---|
| 1 | `/rent-a-car`, "Os nossos balcões" | todas, as duas | Cartões de 4 colunas: vazios com os dados reais, primeiro esticado com 3 pontos; prefixo "Rent a Car" repetido em cada cartão | Reutilizar antes de criar; mesmo dado, mesmo desenho | Componente partilhado `PickupPoints` | `rent-a-car/page.tsx` |
| 2 | `/contactos`, "Balcões" | todas, as duas | Outro desenho de cartão (borda no `li`, ícones `MapPin` e `Clock` por linha); o ponto não leva à sua página; título solto se a API não devolver pontos | Idem; estado vazio honesto | `PickupPoints` com `showMap` | `contactos/page.tsx` |
| 3 | Página inicial | todas, as duas | Desenho certo, mas escrito na página; não reutilizável | Reutilizar antes de criar | Passa a usar `PickupPoints` | `[region]/page.tsx` |
| 4 | "Ver no mapa" (`/contactos`) | 360 a 1440 | Alinhado com a borda do cartão, não com o texto | Eixo do texto | Alinhado com o nome (`ml-10`: ícone de 24 px + espaço de 16 px), link próprio fora do link do ponto, nome do ponto para leitores de ecrã | `pickup-points.tsx` |
| 5 | Rodapé | 360 a 1440, as duas | Sem problemas: a coluna "Contactos" (telefone, email, Instagram, Facebook) tem a mesma altura que a coluna TVDE, sem linha vazia | | Nenhuma | |
| 6 | `/contactos`, Telefone e Email | 360 a 1440, as duas | Sem problemas: duas colunas iguais a partir de `md`, empilhadas abaixo | | Nenhuma | |
| 7 | `/rent-a-car/<ponto>` | | Sem problemas: morada e horário no cabeçalho só quando existem | | Nenhuma | |

## Fase 2: correção

- `src/components/shared/pickup-points.tsx` (novo): `PickupPoints`.
- Página inicial, `/rent-a-car` e `/contactos` usam-no; saíram os cartões, o
  `fillSpanClasses` destas três páginas e os ícones que deixaram de ser usados.
- Os títulos de cada página ficaram ("Pontos de levantamento", "Pontos de
  levantamento nos Açores", "Os nossos balcões", "Balcões").

## Validação

`npm run check` e `npm run qa` limpos; consola sem erros. Browser com dados do
mock (morada, horário, coordenadas, "Apenas levantamento" na Horta) e com os
dados reais simulados (só o nome):

| Largura | Composição | Medido |
|---|---|---|
| 360 | Título por cima da lista, no eixo do `Container` (17 px) | Sem scroll horizontal; nomes longos partem linha; "Ver no mapa" com 44 px e alinhado com o nome (0 px de diferença) |
| 768 | Título por cima da lista | Sem scroll horizontal |
| 1024 | Título (5 colunas, 370 px) ao lado da lista (7 colunas, 537 px), alinhados ao topo | Sem scroll horizontal |
| 1440 | Idem, título no eixo do `Container` (73 px), lista a partir de 666 px | Ícone 2 px abaixo do topo do nome; "Ver no mapa" na coluna do nome |

Teclado: Tab chega a cada ponto e a cada "Ver no mapa", com contorno de foco
visível (2 px). Testado nas três páginas, Continente e Açores.

## Depois do deploy (0.18.3)

Verificação em produção (www e acores, 3 páginas, 360 e 1440 px): pontos da
API, ícone na cor de cada região, sem scroll horizontal, sem "Morada a
confirmar". Um defeito que o mock escondia: só com o nome, o link de cada ponto
tinha 26 px de altura em mobile (abaixo dos 44 px). O espaço vertical da linha
passou para dentro do link (66 px só com o nome, a linha inteira clicável);
com "Ver no mapa", o link do ponto fecha com 8 px e o do mapa leva os 20 px de
baixo.

## Fora deste trabalho

- `fillSpanClasses` (`src/lib/grid.ts`) deixou de ter uso; `fillSpans` continua
  a ser usado por `CategoryGrid`.
- `ContactValue` ainda aceita `kind="address"`, mas já ninguém o usa. A morada da
  sede (`REGION_CONFIG.contact.address`) fica `null` até o cliente decidir
  mostrá-la.
- Morada, horário e coordenadas de cada ponto têm de ser preenchidos no WeGest;
  o site mostra-os sozinho quando a API os devolver.
