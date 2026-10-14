# Revisão: aviso de cookies, /privacidade, rodapé e /entrar

Relatório de `PROMPT-MASTER-REVISAO-COOKIES-E-ENTRAR.md`, de 14/10/2026:
fase 1 (diagnóstico, sem alterações ao código). Screenshots em
`docs/design/revisao-cookies-entrar-shots/`.

## Como foi medido

- Build de produção (`npm run start`, porta 3001) com
  `NEXT_PUBLIC_META_PIXEL_ID` definido e dados de demonstração.
- Script de medição em Chrome headless (DevTools Protocol, o mesmo método de
  `scripts/qa-layout.mjs`, fora do repositório): Continente e Açores, larguras
  375, 560, 768, 1024, 1280 e 1440, mais 375 x 667. Mediu o aviso na primeira
  visita (`localStorage` limpo), o aviso sobre a viatura Rent a Car, o checkout
  e a viatura TVDE, o foco com Tab, o diálogo, o rodapé, `/privacidade`,
  `/entrar` e `/entrar?tipo=motorista`, e a página sem JavaScript.
- Confirmação no browser a 768 px com barra de scroll.
- **Pixel:** durante toda a medição (nenhuma escolha de marketing feita) houve
  0 pedidos a `facebook.net` ou `facebook.com`.

## O que está bem (não mexer)

- **Recusar é tão fácil como aceitar.** "Aceitar tudo" e "Só necessários" têm o
  mesmo tamanho (166 x 36 px a 375; 188 x 36 a 1280), ambos cheios, lado a lado,
  na mesma linha. A cor de marca no "Aceitar" e o preto no "Só necessários"
  repetem o par já usado no hero ("Rent a Car desde..." / "TVDE desde...").
- **Alinhamento do aviso:** o texto começa no eixo esquerdo do `Container` em
  todas as larguras (18, 20, 23, 27, 31 e 73 px, iguais ao conteúdo da página).
  A partir de `lg`, texto e botões ficam na mesma linha.
- **Diálogo:** mesmo header, divisórias e botão de fecho (44 x 44) do popup de
  candidatura. Em mobile é uma folha presa ao fundo, sem cantos em baixo, e
  "Guardar preferências" fica visível sem scroll a 375 x 667. O foco entra no
  botão de fechar; ao guardar volta ao botão "Cookies" que o abriu. O raio dos
  cantos muda por região (6 px / 22 px), como decidido em `DECISIONS.md`. A
  caixa "Necessários" desativada lê-se como "sempre ativo".
- **Descrições das categorias** alinham com o texto da etiqueta (recuo de 30 px
  = caixa 18 px + intervalo 12 px), não com a caixa.
- **`/entrar`:** os dois cartões têm a mesma altura e o título começa à mesma
  altura em todas as larguras; o conjunto alinha com o formulário (mesmas
  margens esquerda e direita). O cartão selecionado cheio de marca repete o
  seletor "Rent a Car / TVDE" do formulário de pesquisa da página inicial, por
  isso é um padrão do site e não um botão novo. Vindo de "Candidatar-me"
  (`next=/tvde/candidatura`) a troca não aparece e o título é "Crie a sua conta
  para se candidatar", que é o certo.
- **Sem JavaScript** o aviso não aparece e nada de marketing carrega.

## A. Design

| Elemento | Coerente | Destoa | Proposta |
| --- | --- | --- | --- |
| Aviso de cookies | Fundo `panel`, borda `line`, sombra `overlay`, Archivo, botões do sistema | Em mobile o link "Política de privacidade e cookies" ocupa uma linha só para ele e o bloco fica alto (ver B1) | Link no fim da frase, sem linha própria |
| Peso dos botões | Iguais nas duas regiões | Nada | Manter |
| Diálogo | Igual ao popup de candidatura | Nada | Manter |
| `/privacidade` | Painel com borda e divisórias, como as perguntas frequentes; `Pending` em linha própria abaixo da etiqueta (fica legível) | Em 375 px a tabela corta as colunas "Para quê" e "Duração" (shot 08) | Ver C6 |
| `/entrar` | Padrão do seletor de pesquisa | Em "Motorista TVDE" há dois blocos cheios de marca a 128 px um do outro (cartão e "Ir para o painel do motorista") e o botão principal não indica que sai do site | Ícone de ligação externa no botão; manter o cartão |

## B. UX/UI

1. **O aviso ocupa um terço do ecrã do telemóvel.** 263 px de altura: 32 % a
   375 x 812 e 39 % a 375 x 667 (shots 02 e 03); 27 % a 560; 19 % a 768. O texto
   tem 4 linhas, o link uma linha própria, os botões duas linhas. Proposta de
   texto (a validar):
   > Usamos cookies necessários para o site funcionar e, se aceitar, cookies de
   > marketing da Meta para medir as nossas campanhas. [Saber mais]

   Com o link no fim da frase e "Gerir preferências" na mesma linha do link
   abaixo de `lg`, o objetivo é ficar abaixo de 200 px a 375.
2. **O aviso tapa a barra de ação do checkout.** No checkout em mobile, a barra
   fixa (`data-action-bar`, 679 a 812 px) fica inteira por baixo do aviso
   (começa em 549 px). O botão "Continuar" não se vê até a pessoa responder ao
   aviso (shot 01). Na viatura Rent a Car e na TVDE o botão principal está mais
   abaixo na página e não é tapado.
3. **Em desktop o aviso tapa o botão de pesquisa do hero** na primeira visita a
   1280 x 900 (shots 04 e 05): o formulário acaba por baixo da faixa de 113 px.
   Resolve-se com B1 (uma linha em desktop) e com C2 (a página pode ser
   deslizada até ao fim).
4. **Texto.** "Cookies" no rodapé abre o diálogo, mas lê-se como um link para
   uma página. Proposta: "Preferências de cookies" em desktop; em 375 px cabe
   numa segunda linha do rodapé (ver C5). "Conteúdo em validação" em
   `/privacidade` está claro. Nenhum travessão nem construção proibida.
5. **Mudar de ideias:** dois cliques a partir de qualquer página (rodapé, depois
   a caixa e "Guardar"). O diálogo abre com a escolha atual marcada. Cumpre.
6. **`/entrar` motorista:** o texto diz "O painel do motorista abre no WeGest",
   mas o botão não tem sinal de saída do site. Proposta: ícone `ExternalLink` no
   botão, sem abrir noutro separador (decisão D).
7. **Sem JavaScript o botão "Cookies" não faz nada.** Proposta: passa a ser um
   link para `/privacidade#cookies`, e com JavaScript o clique abre o diálogo
   (melhoria progressiva). A secção "Cookies" de `/privacidade` ganha
   `id="cookies"`.

## C. Posicionamento

1. **Alvos de toque do aviso abaixo de 44 px.** Os três botões têm 36 px de
   altura em todas as larguras (tamanho `sm`). Abaixo de 768 px violam a regra
   de 44 x 44 de `docs/accessibility.md`.
2. **Foco tapado pelo aviso (WCAG 2.4.11).** Com Tab pela página inicial e o
   aviso aberto: a 375 px, 30 dos 59 elementos focados ficam tapados (inteiros
   ou em parte), por exemplo o seletor Rent a Car/TVDE, os campos de data e
   hora e os botões "Ver viaturas"; a 1280 px, 19 de 63. A página não reserva
   espaço para a faixa fixa. Proposta: o aviso publica a sua altura numa
   variável CSS (`--consent-banner-h`) enquanto está aberto, usada em
   `scroll-padding-bottom` e no `padding-bottom` do `body`, como já se faz para
   `[data-action-bar]` em `globals.css`. A mesma variável sobe a barra de ação
   do checkout acima do aviso (resolve B2).
3. **Ordem de leitura.** Os botões do aviso são os elementos focáveis 66 a 68
   de 74: quem usa teclado ou leitor de ecrã passa pela página toda e pelo
   rodapé antes de os encontrar. Proposta: montar o `CookieConsent` logo a
   seguir ao link "Saltar para o conteúdo". A posição visual não muda (é fixa).
4. **Diálogo:** sem problemas (ver "O que está bem").
5. **Rodapé, linha de baixo.**
   - A 375 px nos Açores, "Portugal Continental" passa para uma segunda linha
     colada à primeira (`gap-x-4`, sem espaço vertical; os alvos de 44 px
     tocam-se) (shot 09). No Continente ("Açores" é mais curto) cabe numa linha.
     Proposta: `gap-y-1`.
   - **Pré-existente (0.15.2), mas no rodapé:** a 768 px há scroll horizontal
     de 42 px em todas as páginas. O email `motoristas.tvde@decadaousada.pt` na
     coluna "Contactos" (novo na 0.15.2) não quebra e sai da coluna (até
     810 px). Proposta: quebra permitida no email (`wrap-anywhere`) ou rodapé em
     2 colunas entre `md` e `lg`.
6. **`/privacidade` em 375 px:** cada tabela esconde 238 px (41 %) da largura,
   sem indicação de que há mais colunas; "Duração" fica fora do ecrã e "Para
   quê" cortada a meio (shot 08). Proposta: abaixo de `sm`, cada cookie passa a
   um bloco com pares etiqueta/valor (`grid-label-value`), e a tabela fica a
   partir de `sm`. O botão "Alterar preferências de cookies" alinha com o texto
   (mesmo eixo esquerdo) e tem 44 px. A 768 px e 1280 px a tabela cabe.
7. **`/entrar`:** alinhado (ver "O que está bem"). Em 375 px os cartões têm
   115 px de altura porque título e descrição quebram ("Motorista / TVDE",
   "Reservas e / faturas"); ficam iguais entre si, por isso não é defeito.

## Lista priorizada

| # | Item | Tipo | Componente | Resolve |
| --- | --- | --- | --- | --- |
| 1 | Reservar espaço para o aviso aberto (`--consent-banner-h`): `scroll-padding-bottom`, `padding-bottom` do `body` e barra de ação do checkout acima do aviso | estrutural | `cookie-consent.tsx`, `globals.css` | B2, C2 |
| 2 | Botões do aviso com 44 px abaixo de 768 px | rápido | `cookie-consent.tsx` | C1 |
| 3 | Aviso mais curto: texto novo, link no fim da frase, "Gerir preferências" na linha do link | rápido | `cookie-consent.tsx` | B1, B3 |
| 4 | Aviso logo a seguir ao "Saltar para o conteúdo" no DOM | rápido | `layout.tsx` | C3 |
| 5 | Scroll horizontal a 768 px por causa do email do rodapé (pré-existente) | rápido | `site-footer.tsx` | C5 |
| 6 | `/privacidade` em mobile: blocos etiqueta/valor em vez da tabela cortada | rápido | `privacidade/page.tsx` | C6 |
| 7 | "Cookies" do rodapé como link para `/privacidade#cookies` que abre o diálogo com JavaScript | rápido | `cookie-consent.tsx`, `site-footer.tsx`, `privacidade/page.tsx` | B7 |
| 8 | Texto do link do rodapé: "Preferências de cookies" | rápido | `site-footer.tsx` | B4 |
| 9 | `gap-y-1` na linha de baixo do rodapé | rápido | `site-footer.tsx` | C5 |
| 10 | Ícone de ligação externa em "Ir para o painel do motorista" | rápido | `entrar/page.tsx` | B6 |
| 11 | Juntar `/privacidade` e `/entrar?tipo=motorista` às rotas do `qa:layout` | rápido | `scripts/qa-layout.mjs` | medição contínua |

Os itens 1 a 4 só mudam apresentação e posição; nenhum mexe em
`src/lib/consent.ts` nem em `src/lib/meta-pixel.ts`. Depois de cada um, repetir
o teste do pixel (0 pedidos antes da escolha).

## D. Por confirmar

- Texto jurídico de `/privacidade`: vem do cliente.
- Aviso nos ambientes de demonstração (`*.vercel.app`) ou só no domínio final.
- "Ir para o painel do motorista" no mesmo separador (hoje) ou noutro.

## Fase 2: resultado (14/10/2026)

Lista aprovada e aplicada inteira (`CHANGELOG.md` 0.17.1, `DECISIONS.md`
"Cookie banner review"). Medido de novo com o mesmo script, no build de
produção, nas duas regiões:

| Medida | Antes | Depois |
| --- | --- | --- |
| Altura do aviso a 375 x 812 | 263 px (32 %) | 196 px (24 %) |
| Altura do aviso a 375 x 667 | 39 % | 29 % |
| Altura do aviso a 1280 / 1440 | 113 px | 96 / 74 px |
| Altura dos botões do aviso | 36 px | 44 px ("Gerir preferências" 44 px abaixo de 768) |
| Posição do aviso na ordem de foco | 66.º de 74 | 1.º (logo a seguir ao salto) |
| Barra do checkout em mobile | tapada pelo aviso | por cima do aviso (483 a 616 px, aviso a partir de 616) |
| Elementos focáveis tapados a 375 / 1280 | 30 de 59 / 19 de 63 | 0 / 0 (\*) |
| Scroll horizontal a 768 px | 42 px em todas as páginas | nenhum |
| Tabela de `/privacidade` a 375 | 238 px escondidos | blocos por cookie, sem corte |
| "Cookies" no rodapé sem JavaScript | botão sem efeito | link para `/privacidade#cookies` |
| Pedidos à Meta antes da escolha | 0 | 0 |

(\*) O script ainda conta 2 a 375 e 1 a 1280, mas são elementos que não
recebem foco: os botões do painel TVDE escondido do formulário de pesquisa
(`visibility: hidden`) e as cópias inertes do carrossel de testemunhos. Um
"Ler tudo" focável de verdade fica visível por cima da faixa.

`npm run qa:layout` (com `/privacidade` e `/entrar?tipo=motorista` nas
rotas): 64 páginas x 6 larguras (375 a 1440), 2 regiões, sem problemas. Nesta
corrida, contra `next start`, o login de demonstração falhou por falta de
`AUTH_SECRET` no `.env.local` (o servidor de produção exige-o): as áreas de
cliente e os passos da candidatura com sessão não foram medidos. Nenhuma
alteração mexe nessas páginas além da regra do `body` que só atua com o aviso
aberto.

Screenshots "depois": `14-depois-*` a `20-depois-*`.
