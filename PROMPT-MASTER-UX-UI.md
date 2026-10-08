# Prompt master: UX/UI dos fluxos

Prompt para o agente que vai fazer a passagem de UX/UI aos fluxos da plataforma
DÉCADA OUSADA: pesquisa e reserva Rent a Car, candidatura TVDE e áreas de
cliente. Mexe em componentes, páginas e texto de interface. Não altera regras de
negócio nem a integração (`src/services/wegest`, `src/app/api`) sem aprovação
explícita. Copiar a partir de "Papel".

Origem: pedido de 07/10/2026 para criar os prompts master de design, UX/UI e
posicionamento correto.

Estado: **fases 1, 2 e 3 feitas (07 e 08/10/2026).** Lições em `docs/lessons-learned.md`. Alterações em `CHANGELOG.md` 0.4.0 e decisão em `DECISIONS.md`. Relatório em `docs/design/ux-ui.md`. Se `PROMPT-MASTER-DESIGN.md` já tiver sido aprovado,
segue a direção dele; se não, não tomas decisões de identidade visual aqui.

---

## Papel

És o designer de produto e developer front-end da DÉCADA OUSADA. Os fluxos
existem e funcionam: pesquisa, resultados com filtros, checkout em 3 passos,
confirmação, candidatura TVDE em 4 passos, portais, backoffice técnico. Foram
construídos depressa e contra dados de demonstração.

O teu trabalho é garantir que cada fluxo é **o caminho mais curto e mais claro**
até à reserva ou à candidatura, em mobile primeiro, sem esconder condições e
sem prometer o que o sistema ainda não confirmou.

## Leitura obrigatória

1. `AGENTS.md`, `BLUEPRINT.md`, `DECISIONS.md`.
2. `docs/design-system.md`, `docs/accessibility.md`, `docs/responsive.md`,
   `docs/content-style.md`, `docs/anti-ai.md`.
3. O documento do cliente: §8 a §38 (Rent a Car), §39 a §71 (TVDE), §92 e §93
   (falhas e estados), §106 a §108 (analytics e funis), §112 e §113 (mobile e
   acessibilidade), §127 (produtos separados).
4. `docs/wegest/analise-gaps.md` e `docs/wegest/integracao.md`: o que a API real
   permite muda o que a UI pode prometer (reserva entra **pendente**, cancelar só
   enquanto pendente, sem histórico por cliente, TVDE só com catálogo).
5. Código: `src/components/booking/booking-wizard.tsx`,
   `src/components/rentacar/search-form.tsx`, `src/components/vehicles/*`,
   `src/components/tvde/*`, `src/components/account/*`,
   `src/components/shared/states.tsx`, `src/app/[region]/**`.

## Regras que se mantêm

- O frontend nunca recalcula preços, totais, cauções ou disponibilidade; mostra
  o que a API devolve.
- Nunca mostrar "Reserva confirmada" sem confirmação do sistema de gestão.
- Pagamento concluído não é candidatura aprovada; os dois estados aparecem
  separados.
- Nenhum ecrã fica em loading sem fim: há sempre estado vazio, erro ou timeout,
  com saída ("Tentar novamente", "Contactar-nos").
- Rent a Car e TVDE: UX, funil e checkout diferentes (§127). Não unificar.
- Nada de prazos, garantias ou políticas inventadas. O que falta é `Pending`.
- PT-PT, zero travessões, sem "não é X, é Y".
- Commits só quando o utilizador pedir.

---

## A. Funis (o mapa de tudo)

Desenha os dois funis tal como estão hoje, passo a passo, com o número de
cliques e campos em cada passo, em mobile:

- **Rent a Car:** homepage → pesquisa → resultados → viatura → extras e
  proteção → dados → pagamento → confirmação → área de cliente.
- **TVDE:** homepage → viaturas → viatura → levantamento (local, data, hora) →
  entrar/criar conta → cadastro → documentos → sinal → confirmação → área TVDE.

Para cada passo: o que o utilizador precisa de saber para avançar, o que pode
fazê-lo desistir, e o evento de analytics do §106 que o mede (hoje nenhum está
implementado: lista onde cada um seria disparado).

**Entregável A:** os dois funis num diagrama simples, com os pontos de atrito
marcados.

## B. Diagnóstico por fluxo (`design:design-critique`)

Com `npm run dev` (porta 3000), percorre cada fluxo **até ao fim** em 375 px e em
1280 px, nas duas regiões, como cliente novo e como cliente com conta (conta de
demonstração em `src/services/auth/seed.ts`). Usa `/admin` para levar a
candidatura e a reserva a todos os estados (em análise, documentos pedidos,
aprovada, recusada com reembolso, reserva confirmada) e revê o ecrã de cada um.

Responde a:

- A pesquisa Rent a Car está acima da dobra em mobile na homepage e em
  `/rent-a-car`? As datas por omissão fazem sentido?
- Nos resultados, o utilizador percebe sem esforço a diferença entre preço por
  dia e total do período? E porque uma viatura aparece "Indisponível"?
- O checkout pede conta antes de pagar: é claro porquê, e há saída para quem já
  tem conta sem perder o que escolheu?
- O resumo da reserva acompanha o utilizador em mobile (hoje só aparece no passo
  1 em mobile)?
- No TVDE, o utilizador sabe **antes** de começar quanto vai pagar agora, quanto
  paga no levantamento e que documentos vai precisar?
- O aviso "o pagamento não representa aprovação" é lido ou é saltado? Está no
  sítio certo do fluxo?
- Os estados pendentes (reserva a aguardar confirmação, candidatura em análise)
  dizem o que acontece a seguir e quando o utilizador vai ser contactado, sem
  inventar prazos?
- Os erros de validação aparecem junto ao campo, são anunciados, e o foco vai
  para o primeiro erro?
- O portal mostra primeiro o que o utilizador veio procurar (próxima reserva,
  estado da candidatura)?

**Entregável B:** relatório por fluxo com severidade e uma lista priorizada de no
máximo 15 alterações: problema, porquê, proposta, ficheiros, esforço (P/M/G).

## C. Estados e casos limite

Inventário de todos os estados de cada ecrã: carregamento (skeleton), vazio,
erro, timeout, sucesso, sem sessão, sessão expirada a meio do checkout, preço
alterado (`PRECO_ALTERADO`), viatura indisponível no último passo, pagamento
recusado (cartão de teste em `src/components/payment/payment-form.tsx`), upload
de ficheiro inválido, candidatura recusada com reembolso.

**Entregável C:** tabela ecrã / estado / existe? / o que mostra / proposta.

## D. Acessibilidade (`design:accessibility-review`)

WCAG 2.1 AA sobre os fluxos, com atenção a: ordem de tabulação nos wizards,
foco ao mudar de passo, `aria-live` na recotação do resumo e na verificação de
disponibilidade TVDE, alvos de toque de 44 x 44 px (botões +/- dos extras,
chips de filtros, datas), drawer de filtros em mobile (foco preso, Esc fecha),
mensagens de erro compreensíveis sem cor.

**Entregável D:** tabela critério / onde / estado / correção.

## E. Texto de interface (`design:ux-copy`)

Revê CTAs, rótulos, ajudas, erros, estados vazios e de sucesso, títulos de passos.

- Um nome por conceito: "reserva" vs "pedido de reserva"; "candidatura";
  "sinal" vs "caução" vs "pagamento agora" (o §45 distingue sinal de caução:
  confirma que a UI também distingue); "levantamento" e "devolução".
- Unidades sempre explícitas: "/dia", "/semana", "km/semana" ou "km/mês" (a API
  real devolve km TVDE **por mês**: ver `analise-gaps.md`, diferenças de dados).
- Erros dizem o que aconteceu e como resolver, sem culpar a pessoa.

**Entregável E:** tabela atual / proposta / porquê, por fluxo, e um glossário de
termos fixos.

---

## Fase 1: diagnóstico (sem código)

Entrega A a E em `docs/design/ux-ui.md`. Termina com a lista priorizada
(máximo 15, marcados **rápido** ou **estrutural**), as decisões do cliente
(secção F) e a pergunta: "Aprovas a lista, ou queres cortar/reordenar?"

Pára aqui e espera resposta.

## Fase 2: implementação (depois de aprovado)

- Um item aprovado de cada vez, pela ordem aprovada.
- Alterações de fluxo que toquem `src/app/api` ou `src/services` precisam de
  aprovação própria, item a item.
- Eventos de analytics só com o fornecedor decidido; até lá, um helper `track()`
  sem envio, com os nomes exatos do §106.
- Depois de cada item: `npm run check`, `npm run qa`, e o fluxo completo no
  browser em mobile e desktop, com teclado.

## Fase 3: fecho

Atualiza `docs/design-system.md` (componentes e estados que mudaram) e
`CHANGELOG.md`. Regista em `docs/lessons-learned.md` o que os testes de fluxo
ensinaram.

---

## F. Por confirmar com o cliente (não decides sozinho)

- Pagamento no checkout Rent a Car quando a reserva entra pendente: cobrar e
  reembolsar se recusada, pré-autorização, ou sem pagamento online na v1.
- Candidatura TVDE enquanto o WeGest não tem a fase de candidaturas.
- Se a conta é obrigatória para reservar Rent a Car ou se aceita reserva como
  convidado.
- Textos de política: cancelamento, combustível, documentos no levantamento,
  requisitos TVDE (idade, anos de carta, certificado).

## Antes de declarar concluído

```
[ ] Fase 1 entregue e aprovada; só itens aprovados implementados
[ ] npm run check e npm run qa passam
[ ] Os dois funis percorridos até ao fim em 375 e 1280 px, nas duas regiões
[ ] Todos os estados da tabela C verificados no browser (via /admin)
[ ] Teclado e leitor de ecrã: foco ao mudar de passo, erros anunciados
[ ] Nenhuma promessa, prazo ou política inventada
[ ] Regras de negócio intactas (preço, disponibilidade, pagamento ≠ aprovação)
```
