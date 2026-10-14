# Prompt master: design, UX/UI e posicionamento dos pontos de levantamento e da morada

Prompt para o agente que vai rever, em design, UX/UI e posicionamento, o que
entrou na versão 0.18.2 e a seguir: a secção "Pontos de levantamento" da página
inicial (lista com ícone de localização em vez de cartões), o rodapé sem morada
e `/contactos` sem o cartão "Sede". Mexe só em apresentação, texto de interface e
layout. Não altera `src/services`, `src/app/api` nem `src/domain`, e não inventa
moradas, horários nem coordenadas. Copiar a partir de "Papel".

Origem: pedido de 14/10/2026 do Thiago Sousa (marketing DaspRent): mostrar só os
pontos que a API devolve e tirar "Morada a confirmar" do site. Depois do deploy,
a secção com os dados reais ficou com cartões vazios; o utilizador pediu um
layout novo, a seta trocada por um ícone de ponto de levantamento e esta
revisão em todas as instâncias.

Estado: **fases 1, 2 e 3 feitas (14/10/2026), por publicar.** Relatório e
resultado em `docs/design/revisao-pontos-morada.md`; contrato em
`docs/design-system.md` (`PickupPoints`). A entrada do `CHANGELOG.md` e a versão
(0.18.3) entram ao publicar, a partir do `main`.

---

## Papel

És o designer de produto e developer front-end da DÉCADA OUSADA. A direção
visual, os fluxos e as regras de layout foram fechados pelos prompts master
anteriores (`PROMPT-MASTER-DESIGN.md`, `PROMPT-MASTER-UX-UI.md`,
`PROMPT-MASTER-POSICIONAMENTO-CORRETO.md`). Este trabalho aplica esses critérios
a uma mudança feita com pressa:

1. **Pontos de levantamento na página inicial.** Os cartões em grelha de 4
   foram desenhados para nome, morada e horário (dados do mock). A API real do
   WeGest devolve hoje só o nome (`morada`, `horario`, `latitude`, `longitude`
   vêm a `null`), por isso os cartões ficavam vazios e o primeiro esticava para
   fechar a linha. Passou a ser uma lista: título à esquerda, pontos à direita,
   ícone `MapPin` na cor de marca, nome em display. Morada e horário aparecem
   sozinhos quando o WeGest os tiver.
2. **Rodapé.** Saiu a linha da morada ("Morada a confirmar"). Ficam telefone,
   email, Instagram e Facebook.
3. **`/contactos`.** Saiu o cartão "Sede"; Telefone e Email em duas colunas.

O objetivo: que os pontos de levantamento tenham **o mesmo desenho em todas as
páginas onde aparecem**, que fiquem bem com os dados que a API devolve hoje (só
o nome) e com os dados completos, e que nada fique desalinhado, vazio ou fora de
ordem em qualquer largura.

## Leitura obrigatória

1. `AGENTS.md`, `BLUEPRINT.md`, `DECISIONS.md`.
2. `docs/design/direcao-de-design.md`, `docs/design/ux-ui.md`,
   `docs/design/posicionamento.md`: referência fechada; não se reabre aqui.
3. `docs/design-system.md`, `docs/accessibility.md`, `docs/responsive.md`,
   `docs/content-style.md`, `docs/anti-ai.md`.
4. Código: `src/app/[region]/page.tsx` (secção dos pontos),
   `src/app/[region]/rent-a-car/page.tsx` ("Os nossos balcões"),
   `src/app/[region]/contactos/page.tsx` ("Balcões" e cartões de contacto),
   `src/app/[region]/rent-a-car/[cidade]/page.tsx` (página de cada ponto),
   `src/components/layout/site-footer.tsx`, `src/components/shared/pending.tsx`
   (`ContactValue`), `src/services/wegest/http-transport.ts` (`toLocation`),
   `src/domain/location`.

## Regras que se mantêm

- **A API é a fonte de verdade.** Só aparecem os pontos que `listLocations`
  devolve. Sem pontos, a secção não aparece (nem título solto). Morada,
  horário e mapa só quando a API os trouxer.
- **Reutilizar antes de criar.** O mesmo dado (lista de pontos) não pode ter
  três desenhos diferentes. Se houver mais de uma instância, um componente
  partilhado decide o desenho e as páginas decidem só o título.
- Tokens antes de valores soltos: nenhum `#hex`, `text-[..]`, `shadow-[..]`.
- A região muda só a cor de marca (ícone vermelho no Continente, verde nos
  Açores). Mesmo layout nas duas.
- Ícones com função, nunca decorativos (`docs/anti-ai.md`): o `MapPin` marca
  "isto é um local". Nada de ícone dentro de quadrado, nada de seta e ícone ao
  mesmo tempo.
- PT-PT, zero travessões, sem "não é X, é Y". Nenhuma dependência nova.
  Commits só quando o utilizador pedir.

---

## A. Design

1. **Coerência entre instâncias.** Página inicial, `/rent-a-car` e
   `/contactos` mostram os mesmos pontos com o mesmo desenho? Comparar ícone,
   tipo de letra do nome, divisórias, espaçamento.
2. **Dados reais (só nome).** Com 3 pontos no Continente e 1 nos Açores, a
   secção tem peso suficiente, sem caixas vazias nem espaço morto?
3. **Dados completos (mock).** Com morada, horário e "Apenas levantamento", a
   hierarquia lê-se: nome, morada, horário, aviso.
4. **Ícone.** Alinhado com a primeira linha do nome em display, mesma cor de
   marca nas duas regiões, sem competir com o nome.

## B. UX/UI

1. **Para que serve o clique.** Cada ponto leva a `/rent-a-car/<ponto>` (frota
   e pesquisa com o ponto já escolhido). A frase da secção diz isso?
2. **Estados.** Sem pontos: secção escondida. Ponto que só permite levantamento:
   "Apenas levantamento" visível. Ponto com coordenadas em `/contactos`: "Ver no
   mapa" como link próprio, fora do link principal (nada de link dentro de link).
3. **Contactos sem morada.** O rodapé e `/contactos` não deixam linha vazia,
   coluna órfã nem ícone sem texto.

## C. Posicionamento correto

Em 360, 768, 1024 e 1440 px, nas duas regiões (`?regiao=continente` e
`?regiao=acores`):

1. Abaixo de `lg`, título por cima da lista; a partir de `lg`, título em 5
   colunas e lista em 7, ambos alinhados ao topo e ao eixo do `Container`.
2. "Ver no mapa" e "Apenas levantamento" alinhados com o texto do nome, não com
   o ícone.
3. Nomes longos ("Aeroporto de Ponta Delgada") partem linha dentro da coluna,
   sem scroll horizontal.
4. Alvos de toque de 44 px em mobile; foco visível por teclado em cada ponto e
   em "Ver no mapa".
5. Rodapé: a coluna "Contactos" alinha com as outras e não deixa espaço onde
   estava a morada. `/contactos`: os dois cartões com a mesma altura.

---

## Como testar

- Dados completos: `WEGEST_MODE=mock` (o `.env.local` por omissão).
- Dados reais: produção (`www.decadaousada.pt`, `acores.decadaousada.pt`) ou
  simular no browser, depois de a página hidratar, retirando morada e horário
  das linhas. Mexer no DOM antes de o React hidratar gera um erro de hydration
  falso.
- `npm run check`, `npm run qa`, consola sem erros, teclado (Tab até cada ponto).

## Fase 1: diagnóstico

Entrega A, B e C em `docs/design/revisao-pontos-morada.md`: instância, largura,
região, problema, regra violada, correção, ficheiros.

## Fase 2: correção

Um item de cada vez, no componente de origem. Depois de cada item, `npm run
check`, `npm run qa` e browser em 360 e 1440 px nas duas regiões.

## Fase 3: fecho

`docs/design-system.md` (contrato do componente), `CHANGELOG.md`, versão em
`package.json`.

## Antes de declarar concluído

```
[ ] As três listas de pontos usam o mesmo componente
[ ] Sem pontos, nenhuma secção aparece; nada inventado
[ ] npm run check e npm run qa passam; consola limpa
[ ] Testado em 360 a 1440 px, Continente e Açores, dados só com nome e completos
[ ] Foco visível e alvos de 44 px em mobile
[ ] Nenhum valor arbitrário novo; design-system.md e CHANGELOG.md atualizados
[ ] Nenhuma alteração em src/services, src/app/api ou src/domain
```
