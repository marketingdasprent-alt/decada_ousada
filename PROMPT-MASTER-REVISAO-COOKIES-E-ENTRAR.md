# Prompt master: design, UX/UI e posicionamento das últimas alterações

Prompt para o agente que vai rever, em design, UX/UI e posicionamento, o que
entrou nas versões 0.16.0 e 0.17.0 da plataforma DÉCADA OUSADA: os dois logins
de `/entrar`, o aviso de cookies, as preferências de cookies, a página
`/privacidade` e os links novos do rodapé. Mexe só em apresentação, texto de
interface e layout destes elementos. Não altera a lógica do consentimento nem do
Meta Pixel (`src/lib/consent.ts`, `src/lib/meta-pixel.ts`), os eventos de
analytics, `src/services`, `src/app/api` nem `src/domain`. Copiar a partir de
"Papel".

Origem: pedido de 14/10/2026 para um prompt master de design, UX/UI e
posicionamento correto para as últimas alterações, no seguimento de
`PROMPT-MASTER-DESIGN.md`, `PROMPT-MASTER-UX-UI.md` e
`PROMPT-MASTER-POSICIONAMENTO-CORRETO.md` (já concluídos).

Estado: **fases 1, 2 e 3 feitas (14/10/2026).** Relatório e resultado em `docs/design/revisao-cookies-entrar.md`; alterações em `CHANGELOG.md` 0.17.1; contratos em `docs/design-system.md`.

---

## Papel

És o designer de produto e developer front-end da DÉCADA OUSADA. A direção
visual, os fluxos e as regras de layout já foram fechados pelos três prompts
master anteriores; este trabalho é aplicar esses mesmos critérios a elementos
novos, feitos depressa, que ainda não passaram por essa revisão:

1. **`/entrar` com dois logins** (`LoginTypeSwitch`): "Rent a Car" mostra o
   formulário da conta do site; "Motorista TVDE" leva ao painel do motorista no
   WeGest. A escolha é um link (`?tipo=motorista`) e funciona sem JavaScript.
2. **Aviso de cookies** (`CookieConsent`): faixa fixa no fundo do ecrã na
   primeira visita, com "Aceitar tudo", "Só necessários" e "Gerir preferências".
   Só existe quando `NEXT_PUBLIC_META_PIXEL_ID` está definido.
3. **Preferências de cookies**: `<dialog>` nativo, aberto pelo aviso, pelo botão
   "Cookies" do rodapé e pelo botão da página `/privacidade`.
4. **`/privacidade`**: tabela de cookies (necessários e marketing), secções com
   texto jurídico ainda `Pending`, direitos RGPD.
5. **Rodapé**: a linha de baixo passou a ter "Perguntas frequentes",
   "Privacidade", "Cookies" e a troca de região.

O objetivo: que estes elementos pareçam ter nascido com o resto do site, que o
aviso de cookies seja honesto e fácil de recusar sem atrapalhar a reserva, e que
nada fique tapado, desalinhado ou fora de ordem em qualquer largura.

## Leitura obrigatória

Por esta ordem:

1. `AGENTS.md`, `BLUEPRINT.md`, `DECISIONS.md`, em especial as entradas de
   14/10/2026 ("/entrar offers two logins" e "Meta Pixel ... behind a cookie
   consent banner").
2. `docs/design/direcao-de-design.md`, `docs/design/ux-ui.md`,
   `docs/design/posicionamento.md`: as conclusões dos prompts anteriores são a
   referência; não as reabres aqui.
3. `docs/design-system.md`, `docs/accessibility.md`, `docs/responsive.md`,
   `docs/content-style.md`, `docs/anti-ai.md`, `docs/lessons-learned.md`.
4. `docs/qa.md`, secção "Cookie consent" (ordem dos botões, comportamento do
   diálogo, foco).
5. Código: `src/components/shared/cookie-consent.tsx`,
   `src/app/[region]/privacidade/page.tsx`,
   `src/components/layout/site-footer.tsx`,
   `src/components/account/login-type-switch.tsx`,
   `src/app/[region]/entrar/page.tsx`, `src/components/account/auth-shell.tsx`,
   `src/components/shared/form.tsx` (`Checkbox`), `src/components/shared/ui.tsx`,
   `src/app/globals.css` (regra `body:has([data-action-bar])`),
   `src/components/booking/booking-wizard.tsx` (barra de ação fixa em mobile).

## Regras que se mantêm

- Tokens antes de valores soltos: nenhum `#hex`, `text-[..]`, `shadow-[..]`,
  `z-[..]`. Camadas só com `z-sticky`, `z-header`, `z-overlay`, `z-modal`,
  `z-toast`.
- `Container` decide a largura, `Section` o ritmo vertical. A faixa do aviso usa
  `layout-container` para alinhar com o resto da página.
- A região muda só a cor de marca. Continente e Açores com o mesmo layout.
- **Consentimento honesto** (RGPD, Lei n.º 41/2004, orientações do CEPD):
  recusar tem de ser tão fácil e tão visível como aceitar; nenhuma caixa de
  marketing vem marcada por omissão; nada de marketing carrega antes da escolha;
  o texto diz quem recebe os dados (Meta). Não se troca nada disto por uma taxa
  de aceitação maior.
- Nada de texto jurídico inventado: responsável, NIF, finalidades, prazos e
  contacto continuam `Pending` até o cliente os enviar.
- A troca de login em `/entrar` continua a ser links renderizados no servidor.
- PT-PT, zero travessões, sem "não é X, é Y".
- Nenhuma dependência nova. Commits só quando o utilizador pedir.

---

## A. Design (coerência com a direção aprovada)

1. **Aviso de cookies.** Lê como parte da marca ou como um widget colado? Compara
   com a faixa de demonstração, a barra de ação do checkout e o header: cor de
   fundo, borda, sombra, tipo de letra, peso dos botões.
2. **Peso dos botões.** Hoje: "Aceitar tudo" com a cor de marca, "Só
   necessários" em escuro, "Gerir preferências" como link sublinhado. Verifica se
   os dois primeiros têm o mesmo peso visual (tamanho, contraste, área) nas duas
   regiões; o verde dos Açores e o vermelho do Continente não podem fazer o
   "Aceitar" parecer a única saída.
3. **Diálogo de preferências.** Header, divisórias e botão final iguais ao popup
   de candidatura de `/motoristas` (`DriverApplyDialog`)? A caixa "Necessários"
   desativada lê-se como "sempre ativo" e não como erro ou campo bloqueado?
4. **`/privacidade`.** A tabela segue o estilo das listas de `/perguntas-frequentes`
   (painel com borda, divisórias)? O nome do cookie em `font-code` está
   legível ao lado do Archivo? As marcas `Pending` a meio de uma frase partem a
   leitura?
5. **`/entrar`.** O cartão selecionado vai cheio com a cor de marca. Confirma que
   não colide com o botão principal do formulário logo abaixo (duas superfícies
   cheias de marca seguidas) e que o estado selecionado não se confunde com um
   botão de ação.

**Entregável A:** para cada elemento, o que está coerente, o que destoa e a
correção proposta, com screenshot.

## B. UX/UI (`design:design-critique`, `design:ux-copy`)

1. **Primeira visita em mobile (375 px).** Quanto do ecrã o aviso ocupa? Na
   medição de 14/10 eram cerca de 300 px de 812. Propõe uma versão mais curta
   sem perder a informação obrigatória (cookies necessários, marketing da Meta,
   link para a política).
2. **Aviso e reserva.** Abre a página de uma viatura e o checkout em mobile com o
   aviso por responder: o aviso tapa a barra de ação fixa do checkout
   (`data-action-bar`, `z-sticky` por baixo de `z-overlay`)? Tapa o botão
   "Candidatar-me" no TVDE? Decide se o aviso empurra o conteúdo, se a barra de
   ação sobe, ou se o aviso fica por cima com o fundo da página livre.
3. **Texto.** Revê com `design:ux-copy`: o texto do aviso, as descrições das duas
   categorias, "Guardar preferências", "Cookies" no rodapé (é claro que abre as
   preferências e não uma página?), a nota "Conteúdo em validação" em
   `/privacidade`. Frases curtas, PT-PT, sem jargão ("pixel" só onde é preciso).
4. **Mudar de ideias.** Quem aceitou e quer recusar encontra o caminho em dois
   cliques a partir de qualquer página? O estado atual (aceite ou recusado) é
   visível no diálogo antes de guardar?
5. **`/entrar`.** Um motorista que chega pela primeira vez percebe que "Motorista
   TVDE" o leva para fora do site (WeGest)? Quem ainda não trabalha com a DÉCADA
   OUSADA encontra o link para se candidatar em `/motoristas`? Chegando de
   "Candidatar-me" (`next=/tvde/candidatura`), a página não mostra a troca e
   isso faz sentido?
6. **Estados.** Sem JavaScript: o aviso não aparece e nada de marketing carrega
   (correto), o link "Privacidade" funciona, o botão "Cookies" não faz nada.
   Decide se o botão se esconde sem JavaScript ou se passa a ser um link para
   `/privacidade#cookies`.

**Entregável B:** lista de problemas por elemento, com o passo exato para os
reproduzir, a largura e a correção proposta (texto novo incluído).

## C. Posicionamento correto

Nas larguras 375, 560, 768, 1024, 1280 e 1440, nas duas regiões
(`?regiao=continente` e `?regiao=acores`):

1. **Aviso de cookies.**
   - O texto começa no mesmo eixo esquerdo do `Container` do resto da página.
   - Em desktop (`lg`), texto e botões ficam na mesma linha, centrados na
     vertical, com os botões encostados à direita; abaixo de `lg` os botões
     ficam por baixo do texto, a largura total.
   - "Gerir preferências" ocupa a linha inteira por baixo dos dois botões (ordem
     de `docs/qa.md`).
   - Alvos de toque com pelo menos 44 x 44 px abaixo de 768 px; o botão `sm`
     (36 px de altura) cumpre?
2. **Foco não tapado (WCAG 2.4.11).** Com o aviso aberto, percorre a página com
   Tab: nenhum elemento focado fica escondido por baixo da faixa fixa. Se ficar,
   reserva espaço no fundo da página enquanto o aviso está aberto, como já se faz
   para `[data-action-bar]` em `globals.css`.
3. **Ordem de leitura.** O aviso está no fim do DOM (depois do rodapé): quem usa
   teclado ou leitor de ecrã só o encontra no fim de tudo. Decide se sobe no DOM
   (logo a seguir ao link "Saltar para o conteúdo") sem mudar a posição visual.
4. **Diálogo.** Centrado em desktop; em mobile, folha presa ao fundo, sem cantos
   arredondados em baixo, com o botão "Guardar preferências" visível sem scroll
   em 375 x 667. As descrições das categorias alinham com o texto da etiqueta,
   não com a caixa.
5. **Rodapé.** A linha de baixo agora tem quatro links e o copyright. Em 375 px
   e 560 px: quebra limpa, espaço vertical entre linhas quebradas (hoje só há
   `gap-x-4`), nenhum link colado ao seguinte.
6. **`/privacidade`.** Em mobile a tabela faz scroll horizontal (`min-w-xl`).
   Decide entre manter o scroll (com indicação visível de que há mais colunas) ou
   empilhar cada cookie como um cartão com pares etiqueta/valor
   (`grid-label-value`). O botão "Alterar preferências de cookies" alinha com o
   texto acima.
7. **`/entrar`.** Os dois cartões têm a mesma altura em todas as larguras, o
   título e a descrição começam à mesma altura, e o conjunto alinha com o
   formulário por baixo.

Usa `npm run qa:layout` para o que ele já mede (scroll horizontal, texto
cortado, alvos de toque) e acrescenta `/privacidade` e `/entrar?tipo=motorista`
às rotas do script. O aviso de cookies tem de ser medido com o
`localStorage` limpo (primeira visita) e outra vez depois de responder.

**Entregável C:** tabela rota / largura / região / problema / regra violada /
screenshot / correção / ficheiros.

---

## Como testar

- `NEXT_PUBLIC_META_PIXEL_ID` tem de estar em `.env.local`, senão o aviso e o
  botão "Cookies" não existem.
- Primeira visita: `localStorage.removeItem("do:consent")` e recarregar.
- O pixel não pode carregar em nenhum momento antes de "Aceitar tudo" ou de
  ativar marketing nas preferências: confirma em Rede que não há pedidos a
  `facebook.net` nem a `facebook.com` até lá. Qualquer alteração de apresentação
  que mude isto é regressão.
- Teclado: Tab até aos três botões do aviso, abrir as preferências, Esc fecha e o
  foco volta a quem abriu, Tab não sai do diálogo.

---

## Fase 1: diagnóstico (sem alterar código)

Entrega A, B e C em `docs/design/revisao-cookies-entrar.md`, com screenshots em
`docs/design/revisao-cookies-entrar-shots/`. Termina com a lista priorizada
(máximo 12 itens, marcados **rápido** ou **estrutural**, agrupados por
componente) e a pergunta: "Aprovas a lista?"

Pára aqui e espera resposta.

## Fase 2: correção (depois de aprovado)

- Um item aprovado de cada vez, na ordem aprovada, no componente de origem.
- Depois de cada item: `npm run check`, `npm run qa`, `npm run qa:layout`, e
  confirmação no browser em 375 e 1280 px, nas duas regiões, com teclado.
- Repete o teste do pixel da secção "Como testar" depois de qualquer alteração
  em `cookie-consent.tsx`.

## Fase 3: fecho

Atualiza `docs/design-system.md` (contrato de `CookieConsent`,
`CookieSettingsButton` e `LoginTypeSwitch`: variantes, estados, camadas),
`docs/qa.md` se o fluxo de consentimento mudar, `DECISIONS.md` para qualquer
token ou regra nova e `CHANGELOG.md`.

---

## D. Por confirmar com o utilizador ou com o cliente

- Texto jurídico de `/privacidade` (responsável, NIF, finalidades, prazos,
  contacto): vem do cliente.
- Se o aviso de cookies também deve aparecer nos ambientes de demonstração
  (`*.vercel.app`) ou só no domínio final.
- Se "Motorista TVDE" em `/entrar` deve abrir o WeGest no mesmo separador (hoje)
  ou noutro.

## Antes de declarar concluído

```
[ ] Fase 1 entregue e aprovada; só itens aprovados implementados
[ ] npm run check, npm run qa e npm run qa:layout passam
[ ] Testado em 375 a 1440 px, Continente e Açores, primeira visita e depois de responder
[ ] Recusar tão fácil e visível como aceitar; nada de marketing antes da escolha
[ ] Nenhum foco tapado pelo aviso; ordem de leitura coerente
[ ] Nenhum valor arbitrário novo; docs/design-system.md e CHANGELOG.md atualizados
[ ] Nenhuma alteração em src/lib/consent.ts, src/lib/meta-pixel.ts, src/services, src/app/api ou src/domain
```
