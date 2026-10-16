# Prompt master: validação de design, UX/UI e posicionamento do cadastro de motorista

Prompt para o agente que vai validar, em design, UX/UI e posicionamento, as
mudanças de 16/10/2026 no cadastro de motorista TVDE: o fluxo começa no
"Entrar" do cabeçalho e não depende da viatura, a ficha segue as regras do
documento do WeGest e ficou dividida em três partes curtas. Mexe só em
apresentação, texto de interface e layout. Não altera `src/services`,
`src/app/api` nem `src/domain` sem aprovação explícita, e não inventa prazos,
contactos nem passos do processo. Copiar a partir de "Papel".

Origem: conversa de 16/10/2026 com o João, a partir do documento "Cadastro de
motorista TVDE no WeGest" (16/10/2026). O fluxo certo é Entrar > Criar conta
> formulário; a criação do cadastro não tem nada a ver com a escolha da
viatura. O formulário tinha de ser mais intuitivo e menos cansativo.

Estado: **fases 1, 2 e 3 feitas (16/10/2026), por publicar.** Relatório em
`docs/design/validacao-cadastro-motorista.md`; decisão em `DECISIONS.md`
(entrada de 2026-10-16); contratos em `docs/design-system.md`; alterações em
`CHANGELOG.md` 0.20.1. Ficam pendentes as decisões do cliente e do WeGest
(secção "Pendentes" do relatório).

---

## Papel

És o designer de produto e developer front-end da DÉCADA OUSADA. A direção
visual, os fluxos e as regras de layout foram fechados pelos prompts master
anteriores (`PROMPT-MASTER-DESIGN.md`, `PROMPT-MASTER-UX-UI.md`,
`PROMPT-MASTER-POSICIONAMENTO-CORRETO.md`). Este trabalho confirma que as
mudanças cumprem esses critérios, e corrige o que não cumprir:

1. **Entrada no fluxo.** "Entrar" no cabeçalho > `/entrar` > separador
   "Motorista TVDE" (`LoginTypeSwitch`) > `DriverLoginForm` > "Criar conta" >
   `/registar?tipo=motorista`. Sem `?next=`, a conta de motorista nova segue
   para `/tvde/candidatura` (`src/app/[region]/registar/page.tsx`). A página
   da conta de motorista (`/entrar?tipo=motorista` com sessão) abre com
   "Preencher o cadastro de motorista" e, abaixo, "Ver viaturas TVDE".
2. **Formulário de criar conta.** O passo 1 do documento (nome completo,
   email, telefone internacional, password e confirmação, aceite dos termos e
   da política de privacidade) existe numa versão local do João que **ainda
   não está no git**. A versão no git pede só email e password. Antes de
   validar este ecrã, juntar essa versão.
3. **Cadastro sem viatura** (`src/app/[region]/tvde/candidatura/page.tsx`,
   `SignupOnly`). Sem `viatura`, `inicio` e `local`, a página mostra só a
   ficha, com a barra de passos Conta, Cadastro, Enviado (`SIGNUP_STEPS` em
   `application-layout.tsx`), sem resumo lateral e com largura `max-w-3xl`.
   Com os três parâmetros, o percurso antigo (viatura > cadastro > documentos
   > sinal) continua igual.
4. **Ficha em três partes** (`RegistrationStep` em
   `src/components/tvde/application-steps.tsx`, `DynamicWeGestForm` em
   `src/components/tvde/dynamic-form.tsx`, campos em `APPLICATION_FORM` de
   `src/services/wegest/http-transport.ts`):
   - **Sobre si:** nome, email (fixo no da conta de motorista), telemóvel,
     NIF, morada, código postal, localidade.
   - **Identificação e carta:** tipo de documento em botões, número e
     validade; número e validade da carta; categorias em botões com a B já
     marcada; caixa "Ainda estou a tirar a formação TVDE e não tenho
     licença." que esconde o número e a validade da licença.
   - **IBAN e envio:** IBAN, observações (opcional) e consentimento.
   - Barra própria das partes (`PartProgress`), "Continuar" e "Voltar", e
     "Enviar cadastro" no fim (sem viatura) ou "Guardar e continuar" (com
     viatura).
   - Validação do documento (`src/lib/dynamic-form.ts`): telefone com
     indicativo, NIF com dígito de controlo, IBAN com módulo 97, validades
     depois de hoje, categorias com a B, licença obrigatória salvo em
     formação. Código postal e IBAN formatam-se ao escrever. Um campo
     preenchido mostra o erro ao sair dele; um vazio só ao carregar em
     "Continuar".
5. **Confirmação sem viatura** (`src/app/[region]/tvde/candidatura/confirmacao/page.tsx`).
   Sem linhas de viatura, levantamento nem pagamento; linha do tempo
   Cadastro, Análise, Aprovação (`ApplicationTimeline` com `withVehicle`);
   texto "A equipa pede-lhe depois os documentos, e também os pode carregar
   no portal do motorista." e o botão "Carregar documentos no portal do
   motorista".

O objetivo: um motorista novo chega do "Entrar" ao "Candidatura recebida" sem
procurar o caminho, sem escrever o mesmo dado duas vezes, sem saber o que é
uma "viatura" neste passo, e sem que nada fique vazio, desequilibrado ou fora
do sítio em qualquer largura e nas duas regiões.

## Leitura obrigatória

1. `AGENTS.md`, `BLUEPRINT.md`, `DECISIONS.md`.
2. O documento "Cadastro de motorista TVDE no WeGest" (16/10/2026): campos,
   regras e respostas da API, o que a API não cobre (os 9 ficheiros, o
   rascunho) e as duas decisões em aberto (CAPTCHA e documentos).
3. `docs/design/direcao-de-design.md`, `docs/design/ux-ui.md`,
   `docs/design/posicionamento.md`: referência fechada; não se reabre aqui.
4. `docs/design-system.md`, `docs/accessibility.md`, `docs/responsive.md`,
   `docs/content-style.md`, `docs/anti-ai.md`.
5. Código: os ficheiros acima, mais `src/components/account/driver-auth-forms.tsx`,
   `src/components/account/login-type-switch.tsx`,
   `src/app/[region]/entrar/page.tsx`, `src/components/shared/form.tsx`
   (`Field`, `Checkbox`, `ErrorSummary`) e `src/components/shared/stepper.tsx`.

## Regras que se mantêm

- **O WeGest é a fonte de verdade.** As regras de validação são as do
  documento; não se afrouxam nem se juntam regras novas sem fonte.
- **O cadastro não depende da viatura.** Não reintroduzir a viatura, a data
  nem o local como passo obrigatório antes do cadastro.
- **Nada inventado.** Os documentos não vão pela API. O texto da confirmação
  diz só o que o documento diz (a equipa pede-os, o portal recebe-os). Nada de
  prazos de resposta, nem de "aprovado".
- **O pagamento não é aprovação**, no percurso com viatura.
- **Dados sensíveis.** NIF, IBAN e números de documento nunca vão para
  `localStorage` nem para analytics. Um rascunho, se for proposto, guarda-se
  no servidor ou não se guarda.
- O email da ficha é sempre o da conta de motorista (campo fixo).
- Reutilizar antes de criar; tokens antes de valores soltos (nenhum `#hex`,
  `text-[..]`, `shadow-[..]`); nenhuma dependência nova.
- PT-PT, zero travessões, sem "não é X, é Y", sem trincas de enfeite. Commits
  só quando o utilizador pedir.

---

## A. Design

1. **Duas barras de progresso.** Em cima, o `Stepper` (Conta, Cadastro,
   Enviado); por baixo do título, a `PartProgress` (Sobre si, Identificação e
   carta, IBAN e envio). Confirmar que se leem como dois níveis (fluxo e
   partes do cadastro) e não como dois passos concorrentes. Se não, decidir
   com intenção: juntar, mudar o peso de uma delas, ou dar à `PartProgress` o
   rótulo "Parte 1 de 3".
2. **Página sem resumo lateral.** Sem viatura, a coluna da direita fica vazia
   a 1280 px e o `Stepper` continua alinhado à direita da largura toda,
   enquanto a ficha fica em `max-w-3xl` à esquerda. Avaliar se a página lê
   como incompleta. Opções a pesar: centrar a coluna, alinhar o `Stepper` à
   coluna da ficha, ou usar o espaço para o que o motorista precisa de ter à
   mão (sem repetir o que a ficha já diz).
3. **Botões de escolha.** O tipo de documento (5 opções) e as categorias (13)
   usam o mesmo botão (`chip`). Confirmar a hierarquia: a escolha marcada
   distingue-se sem depender só da cor (o visto aparece nas categorias, não
   no tipo de documento; decidir se deve ser igual). "Bilhete de identidade"
   sozinho na segunda linha a 1280 px: aceitar ou reordenar com motivo.
4. **"(opcional)".** Só as Observações o têm hoje. Confirmar peso e cor
   (`text-copy-muted`, `font-normal`) e que não compete com o asterisco dos
   obrigatórios.
5. **Confirmação.** Três passos na linha do tempo e dois botões (principal
   "Acompanhar candidatura", secundário para o portal com `ExternalLink`).
   Confirmar que o bloco escuro do topo, a linha do tempo e a lista curta
   (Candidatura, Estado) não deixam a página vazia em desktop.

## B. UX/UI

1. **Encontrar o caminho.** Do "Entrar" do cabeçalho, `/entrar` abre no
   separador Rent a Car. Um motorista novo encontra "Motorista TVDE" e depois
   "Criar conta" sem ler duas vezes? Medir em 360 px acima da dobra. Avaliar
   (sem mexer no Rent a Car) se o separador de motorista precisa de mais
   evidência, ou se os links "Candidatar-me" do site devem levar diretamente
   a `/entrar?tipo=motorista`.
2. **Dados repetidos.** Com o formulário de conta completo (ponto 2 do
   Papel), o nome e o telefone pedem-se ao criar a conta e outra vez em
   "Sobre si". Propor o pré-preenchimento a partir da conta. As chaves dos
   metadados (`nome`, `telefone`) têm de ser confirmadas com o WeGest antes
   de qualquer código; até lá, regista-se como pendente.
3. **Confirmação de email.** Se o WeGest exigir confirmar o email, o
   percurso passa por "Enviámos um email" > link > `/entrar?confirmado=1` >
   ficha (`rememberNext`/`takeNext`). Verificar que o motorista volta à
   ficha, e que o ecrã de espera diz o que fazer a seguir.
4. **Três partes.** "Continuar" valida só a parte atual; "Voltar" guarda o
   que foi escrito; um erro do servidor numa parte anterior leva a essa
   parte. Confirmar que o foco e o scroll vão para o topo da ficha ao mudar
   de parte e que o leitor de ecrã anuncia a parte.
5. **Erros.** Um campo preenchido mostra o erro ao sair; um vazio só no fim
   da parte. Rever cada mensagem contra `docs/content-style.md` e o padrão
   "o que está mal e como corrigir" (NIF, IBAN, telefone, validades,
   categorias). O 409 continua genérico (o documento pede para não revelar
   quem já se candidatou).
6. **Nomes das coisas.** O botão diz "Enviar cadastro", a confirmação diz
   "Candidatura recebida", o título diz "Cadastro de motorista". Escolher uma
   palavra por conceito e aplicar no fluxo todo (botão, título da
   confirmação, área TVDE, emails).
7. **Datas.** Os campos de validade usam o `input type="date"` do browser.
   Confirmar que aparecem no formato português (`lang="pt-PT"`) e que a
   validade por omissão não sugere uma data inventada.
8. **Sair a meio.** Não há rascunho (o portal do WeGest tem). Avaliar um
   aviso ao sair com dados escritos, sem guardar NIF nem IBAN no browser.
9. **Decisões em aberto.** CAPTCHA (Turnstile) e documentos (portal ou
   endpoint novo) são do cliente. Mostrar onde cada opção entraria no fluxo,
   sem a implementar.

## C. Posicionamento correto

Em 360, 768, 1024 e 1440 px, nas duas regiões (`?regiao=continente` e
`?regiao=acores`), com o aviso de cookies fechado e aberto:

1. **`PartProgress` em mobile.** Só o nome da parte atual aparece, por baixo
   da sua barra. Confirmar que o nome da parte 2 e 3 não fica desalinhado nem
   cortado ("Identificação e carta" a 360 px parte em duas linhas).
2. **Botões do fundo.** Em mobile, "Continuar" a toda a largura por cima de
   "Voltar" (`flex-col-reverse`); em desktop, "Voltar" à esquerda e
   "Continuar" à direita. Na primeira parte não há "Voltar": o botão
   principal não pode saltar de lado entre partes.
3. **Botões de escolha a 360 px.** As 13 categorias quebram em 3 linhas;
   cada botão com alvo de 44 px e espaço igual entre linhas e colunas. O tipo
   de documento sem botões cortados.
4. **Caixa da formação TVDE.** Ao marcar, os campos da licença desaparecem.
   O resto da parte não pode saltar de forma que o botão fuja de baixo do
   dedo; o texto da caixa a 360 px alinha à primeira linha com a caixa.
5. **Campos curtos.** NIF e código postal usam `max-w-field-short`; o IBAN
   formatado (`PT50 0002 0123 1234 5678 9015 4`) cabe sem cortar em todas as
   larguras.
6. **Topo da ficha.** Ao mudar de parte, o topo fica visível por baixo do
   cabeçalho fixo (`scroll-mt-24`); nada fica escondido atrás dele.
7. **Teclado.** Ordem: cada campo, os botões de escolha (setas no tipo de
   documento, espaço nas categorias), a caixa, "Voltar", "Continuar". Foco
   visível em todos, incluindo os botões de escolha (`has-[:focus-visible]`).
8. **Sem scroll horizontal** em nenhuma largura.

---

## Como testar

- `WEGEST_MODE=mock`. Em mock, a ficha vem de `MOCK_APPLICATION_FORM`
  (`src/services/wegest/mock/data.ts`), que não tem as três partes. Para ver
  a ficha real, fazer `getApplicationForm` do mock devolver temporariamente
  a de `httpTransport` (com `documents: []`) e desfazer no fim. Não commitar
  essa troca.
- Ecrãs de Entrar e Criar conta de motorista: arrancar com
  `NEXT_PUBLIC_WEGEST_AUTH_URL`, `NEXT_PUBLIC_WEGEST_AUTH_KEY` e
  `NEXT_PUBLIC_WEGEST_ORG_ID` preenchidos (valores de teste servem para ver
  os ecrãs; não para criar contas).
- Cadastro de ponta a ponta em mock: `/registar?tipo=motorista` com uma conta
  nova do site > `/tvde/candidatura` vazia > três partes > "Enviar cadastro" >
  confirmação. Repetir com a conta de demonstração
  (`demo@decadaousada.pt` / `demo1234`) para ver o pré-preenchimento.
- Percurso com viatura: página da viatura > "Reservar esta viatura" >
  cadastro com resumo lateral > documentos > sinal. Tem de continuar igual.
- Valores do documento para testar: NIF `258714638`, IBAN
  `PT50000201231234567890154`, telefone `+351 912 345 678`.
- `npm run check`, `npm run qa`, `npm run qa:layout`, consola sem erros,
  teclado do princípio ao fim.

## Fase 1: diagnóstico

Entrega A, B e C em `docs/design/validacao-cadastro-motorista.md`: ecrã,
largura, região, problema, regra violada, correção proposta, ficheiros. O que
estiver certo entra também, numa linha, para ficar provado que foi visto. As
decisões que dependem do cliente ou do WeGest (chaves dos metadados, CAPTCHA,
documentos) ficam numa secção própria, como pendentes.

## Fase 2: correção

Um item de cada vez, no componente de origem. Depois de cada item, `npm run
check`, `npm run qa` e browser em 360 e 1440 px nas duas regiões. Uma mudança
na ficha de motorista não mexe no checkout Rent a Car, e uma mudança no
percurso sem viatura não parte o percurso com viatura.

## Fase 3: fecho

`docs/design-system.md` (contratos de `RegistrationStep`, `DynamicWeGestForm`
com os tipos `chips` e `format`, `PartProgress`, `ApplicationLayout` com
`steps`, `ApplicationTimeline` com `withVehicle`), `DECISIONS.md` (o cadastro
sem viatura e as três partes), `CHANGELOG.md` e versão em `package.json` ao
publicar, a partir do `main`.

## Antes de declarar concluído

```
[ ] Do "Entrar" do cabeçalho à confirmação sem escolher viatura
[ ] O percurso com viatura continua igual (documentos e sinal)
[ ] Formulário de criar conta com os 5 campos do documento, no git
[ ] Nome e telefone não se pedem duas vezes, ou fica registado porquê
[ ] Uma palavra por conceito (cadastro ou candidatura) no fluxo todo
[ ] Regras do documento todas ativas: telefone, NIF, IBAN, validades, B, licença
[ ] Nenhum NIF, IBAN ou número de documento no browser nem em analytics
[ ] Confirmação sem prazos nem promessas que o documento não faz
[ ] npm run check, npm run qa e npm run qa:layout passam; consola limpa
[ ] Testado em 360, 768, 1024 e 1440 px, Continente e Açores
[ ] Foco visível e alvos de 44 px em mobile, incluindo os botões de escolha
[ ] Nenhum valor arbitrário novo; design-system.md e DECISIONS.md atualizados
```
