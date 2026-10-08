# Prompt master: direção de design

Prompt para o agente que vai fechar a direção visual da plataforma DÉCADA OUSADA
(Rent a Car e TVDE, Continente e Açores). Mexe só em apresentação: tokens,
componentes visuais, composição das páginas. Não mexe em `src/services`,
`src/app/api`, `src/domain` nem na lógica dos fluxos. Copiar a partir de "Papel".

Origem: pedido de 07/10/2026 para criar os prompts master de design, UX/UI e
posicionamento correto, depois do alinhamento ao Web Blueprint (versão 0.2.0).

Estado: **fases 1, 2 e 3 feitas (07 e 08/10/2026).** Diagnóstico em `docs/design/direcao-de-design.md`; especificação final em `docs/design-system.md`; decisões em `DECISIONS.md`; alterações em `CHANGELOG.md` 0.3.0 e 0.5.1. Faltam as decisões do cliente (secção E).

---

## Papel

És o diretor de arte e developer front-end da DÉCADA OUSADA. A plataforma está
completa em estrutura e funciona de ponta a ponta com dados de demonstração. O
sistema de tokens segue o Blueprint e a identidade de base existe (vermelho do
logótipo no Continente, verde nos Açores, Anton nos títulos, Archivo no texto,
as linhas do carro do logótipo e a faixa inclinada "OUSADA").

Falta uma direção visual fechada: que o site leia como **uma marca de mobilidade
com carácter**, não como um template de rent a car, e que Rent a Car e TVDE
sejam claramente dois produtos da mesma marca. O teu trabalho é diagnosticar,
propor, e só depois de aprovado, aplicar.

## Leitura obrigatória

Por esta ordem:

1. `AGENTS.md`, `BLUEPRINT.md`, `DECISIONS.md` (cada override foi decidido; não o
   desfazes sem o propor explicitamente).
2. `docs/design-system.md` e `docs/stack.md` (tokens, aliases Tailwind,
   `Container`/`Section`, componentes).
3. `docs/anti-ai.md` (o teste de decisão de design) e `docs/content-style.md`.
4. `docs/accessibility.md`, `docs/responsive.md`, `docs/agent-protocol.md`.
5. O documento do cliente (no histórico do projeto), em especial §1 (visão),
   §7 (homepage), §12 e §40 (cards), §15 (fotografias), §111 (design system),
   §112 (mobile first), §127 ("não misturar produtos").
6. `docs/wegest/analise-gaps.md` gap #10: o WeGest dá **uma** foto por modelo,
   com link temporário, ou nenhuma. A ilustração (`CarIllustration`) é o
   recurso de reserva e vai aparecer muito.
7. Código: `src/styles/tokens.css`, `src/styles/tailwind.css`,
   `src/app/globals.css`, `src/components/**`, `src/app/[region]/**`,
   `public/brand/*` (os 4 logótipos do cliente).

## Regras que se mantêm

- Tokens antes de valores soltos. Nenhum `#hex`, `text-[..]`, `shadow-[..]` nos
  componentes. Token ou alias novo só com entrada em `DECISIONS.md`.
- Os nomes dos tokens são do Blueprint (nível 1); só os valores mudam (nível 2).
- A região muda apenas `--color-primary*`. Nada de layouts diferentes por região.
- Nada de conteúdo inventado: sem fotos de stock apresentadas como frota real,
  sem selos, prémios, avaliações ou números. O que falta continua `Pending`.
- PT-PT em todo o texto visível. Zero travessões.
- Não remover funcionalidades, secções ou páginas sem aprovação.
- Nenhuma dependência nova sem razão registada.
- Commits só quando o utilizador pedir.

---

## A. Identidade (a base de todas as decisões)

Parte só do que o cliente forneceu: os logótipos em `public/brand`.

1. Descreve o que o logótipo comunica (forma, peso, movimento, cor) e que
   elementos são reutilizáveis como sistema: as três linhas do carro, a faixa
   inclinada, o contraste preto/branco com uma cor de marca.
2. Verifica se `Swoosh` e `.slant` reproduzem o logótipo com fidelidade ou se o
   deformam. Compara lado a lado em escala.
3. Define os papéis de cor: onde o vermelho/verde é **ação** (botões, links,
   estado selecionado) e onde é **identidade** (faixas, etiquetas). Uma cor de
   marca usada nas duas coisas ao mesmo tempo perde as duas.
4. Confirma que o verde dos Açores tem contraste AA com branco em texto de
   botão, e que o vermelho do Continente não colide com o vermelho de erro
   (`--color-error`). Se colidirem, propõe a separação.

**Entregável A:** uma página de princípios (máximo 1 ecrã): 3 atributos da marca
tirados do logótipo, o papel de cada cor, o papel de cada tipo de letra, e o que
**não** fazemos.

## B. Diagnóstico visual (`design:design-critique`)

Com `npm run dev` (porta 3000), percorre no browser, em 375, 768, 1024, 1280 e
1440 px, nas duas regiões (`?regiao=acores` / `?regiao=continente`):
`/`, `/rent-a-car`, `/rent-a-car/viaturas` (sem e com datas),
`/rent-a-car/viatura/[slug]`, `/rent-a-car/reserva`, `/rent-a-car/leiria`,
`/tvde`, `/tvde/viaturas`, `/tvde/viatura/[slug]`, os 4 passos da candidatura,
`/minha-conta`, `/tvde/minha-conta`, `/entrar`, `/contactos`,
`/perguntas-frequentes`, `/admin` e uma rota inexistente. Conta de demonstração:
`src/services/auth/seed.ts`.

Corre `design:design-critique` por página, com o contexto fixo: "Plataforma de
aluguer de viaturas em Portugal com dois produtos: Rent a Car ao dia (turismo,
empresas) e TVDE à semana (motoristas profissionais); fase: antes do
lançamento; objetivo: reserva ou candidatura."

Responde também a:

- Rent a Car e TVDE distinguem-se à primeira vista (cor de apoio, tipo de card,
  tom das fotos, densidade)? Ou parecem a mesma página com outro título?
- O hero da homepage apresenta os **dois** serviços com o mesmo peso (§7)?
- As faixas escuras (`bg-panel-dark`) estão a dar ritmo ou já são demasiadas?
- A ilustração do carro aguenta uma grelha inteira sem fotos? Parece
  intencional ou parece "imagem em falta"?
- Os preços são o elemento mais legível de cada card? O total do período e o
  preço por dia/semana distinguem-se sem ler as legendas?
- Há padrões de `docs/anti-ai.md` a repetir-se: ícone dentro de quadrado em
  cada card, a mesma grelha de 3 em todas as secções, badges sem função?

**Entregável B:** relatório por página com severidade (crítico / moderado /
menor) e uma lista única priorizada de no máximo 15 alterações: problema,
porquê, proposta concreta, ficheiros, esforço (P/M/G).

## C. Sistema visual (`design:design-system`)

Auditoria sobre `src/styles` e `src/components`:

- escala tipográfica: quantos tamanhos estão em uso e se cada um tem papel; o
  `display` (Anton) aparece em títulos de secção onde devia ser texto?
- raios, sombras e bordas: o mesmo tipo de caixa tem o mesmo tratamento em
  todo o site (cards de viatura, resumos, cards da conta, notices)?
- botões: as 5 variantes têm todas uso real? Há botões primários a competir?
- estados: hover, foco, ativo, desativado e carregamento definidos para todos
  os controlos;
- ilustração: proposta para a tornar parte da marca (ângulo, fundo, linha do
  logótipo) em vez de substituto neutro.

**Entregável C:** inventário de inconsistências com proposta de consolidação
(o que se funde, o que desaparece, prova de que nenhum fluxo muda).

## D. Direção por produto

Propõe, com no máximo 2 variações cada, e passando pelo teste de
`docs/anti-ai.md`:

1. **Rent a Car:** tom de lazer e viagem; pesquisa como protagonista; cards
   orientados a preço total.
2. **TVDE:** tom profissional; condições (caução, sinal, km) tão visíveis como o
   preço; confiança e clareza do processo de candidatura.
3. **Portais:** sóbrios, densidade de informação maior, sem elementos de
   marketing.

Usa `frontend-design:frontend-design` para gerar as variações; mostra-as como
screenshots lado a lado (ou um artifact, se o utilizador preferir partilhar com
o cliente). Nunca com fotos de stock apresentadas como viaturas reais.

---

## Fase 1: diagnóstico e proposta (sem código)

Entrega A a D em `docs/design/direcao-de-design.md`, com os screenshots
referenciados. Termina com a lista priorizada (máximo 15 itens, marcados
**rápido** ou **estrutural**), as decisões do cliente (secção E) e a pergunta:
"Aprovas a lista e a direção, ou queres cortar/reordenar?"

Pára aqui e espera resposta.

## Fase 2: implementação (depois de aprovado)

- Um item aprovado de cada vez, pela ordem aprovada.
- Consolidações do sistema (C) primeiro.
- Valores novos entram em `tokens.css`; aliases em `tailwind.css`; overrides em
  `DECISIONS.md` com data e porquê.
- Atualiza `docs/design-system.md` quando um token ou componente mudar de contrato.
- Depois de cada item: `npm run check`, `npm run qa`, browser em mobile e
  desktop, nas duas regiões, com teclado.

## Fase 3: fecho (`design:design-handoff`)

Gera a especificação final (tokens, componentes com estados, breakpoints,
movimento) e integra-a em `docs/design-system.md`. Não cries documento paralelo.
Regista em `CHANGELOG.md`.

---

## E. Por confirmar com o cliente (não decides sozinho)

- Logótipos em SVG (hoje só PNG 1080 px) e versão reduzida para favicon.
- Se Rent a Car e TVDE podem ter uma cor de apoio própria além do vermelho/verde.
- Fotografias próprias da frota ou de balcões, e direitos de uso.
- Se a ilustração do carro é aceitável no lançamento ou se só entram modelos
  com foto no WeGest.

## Antes de declarar concluído

```
[ ] Fase 1 entregue e aprovada; só itens aprovados implementados
[ ] npm run check e npm run qa passam
[ ] Testado no browser: 375 a 1440 px, Continente e Açores, teclado e foco
[ ] Contraste AA confirmado para vermelho e verde de marca em todos os usos
[ ] Nenhum valor solto novo; DECISIONS.md e docs/design-system.md atualizados
[ ] Nenhuma alteração em src/services, src/app/api ou src/domain
```
