# Validação: cadastro de motorista

Relatório do `PROMPT-MASTER-VALIDACAO-CADASTRO-MOTORISTA.md`, 16/10/2026.
Testado com `WEGEST_MODE=mock` e a ficha real (`APPLICATION_FORM`, trocada
temporariamente no mock) em 360, 768, 1024 e 1440 px, Continente e Açores,
com uma conta nova em cada largura. Os ecrãs de Entrar e Criar conta de
motorista foram vistos com as variáveis `NEXT_PUBLIC_WEGEST_AUTH_*` de teste.

## Fase 1: diagnóstico

| # | Ecrã | Largura, região | Problema | Regra | Correção | Ficheiros |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Cadastro, erros de campo vazio | todas | Mensagens geradas pelo rótulo sem artigo ("Indique telemóvel.", "Indique NIF.") e sem sentido nos rótulos curtos ("Indique válido até.") | `content-style.md`: português natural; erro diz o que fazer | Mensagem escrita à mão por campo (`required_message`): "Indique o telemóvel.", "Indique até quando o documento é válido.", "Para enviar, autorize o tratamento dos dados." | `wegest/http-transport.ts`, `lib/dynamic-form.ts`, `domain/application`, `wegest/types.ts`, `wegest/mappers.ts` |
| 2 | Cadastro sem viatura, topo | 1024 e 1440 | A barra de passos (Conta, Cadastro, Enviado) ficava encostada à direita da página (acabava aos 1353 px) e a ficha em `max-w-3xl` à esquerda (acabava aos 841 px): duas colunas que não se tocam | Posicionamento: elementos do mesmo bloco alinhados | Sem resumo lateral, os passos e a ficha partilham a mesma coluna `max-w-3xl`, centrada (ponto 12) | `tvde/application-layout.tsx` |
| 3 | Partes do cadastro | 360 | Só o nome da parte atual aparecia, debaixo da sua barra, partido em duas linhas ("Identificação e / carta") | Posicionamento: quebra que parte o rótulo | Em mobile, uma linha só por cima das barras: "Parte 2 de 3: Identificação e carta". Em `sm` e acima, os três nomes como antes | `tvde/application-steps.tsx` |
| 4 | Mudança de parte | todas | O foco ia para uma `div` sem nome: o leitor de ecrã não dizia em que parte estava | `accessibility.md`: mudança de contexto anunciada | O foco vai para o título da parte (`h2`, visível em mobile, `sr-only` em `sm` e acima) | `tvde/application-steps.tsx` |
| 5 | Duas barras de progresso | todas | O `Stepper` (fluxo) e as barras das partes podiam ler-se como passos concorrentes | Design: um nível de cada vez | Com o ponto 3, a parte diz "Parte X de 3" em mobile e o leitor de ecrã ouve-o em todas as larguras; as barras das partes são finas e sem números, o `Stepper` tem círculos numerados. Ficam como dois níveis | `tvde/application-steps.tsx` |
| 6 | Botões de escolha | todas | Nas categorias a escolha tinha visto; no tipo de documento só cor de borda e fundo | `accessibility.md`: não depender só da cor | O visto aparece na escolha marcada dos dois | `tvde/dynamic-form.tsx` |
| 7 | Fundo da parte 1 | 360 | Sem "Voltar", o espaço reservado (`span`) ficava por baixo de "Continuar" e somava 12 px de vazio | Posicionamento: espaço sem função | O espaço reservado só existe em `sm` e acima, onde segura "Continuar" à direita | `tvde/application-steps.tsx` |
| 8 | Nomes das coisas | todas | Botão "Enviar cadastro", confirmação "Candidatura recebida", texto "Recebemos o seu cadastro." | UX: uma palavra por conceito | O formulário é o "cadastro"; o que se envia e se acompanha é a "candidatura" (como na API e na área TVDE). Botão "Enviar candidatura"; texto "Recebemos a sua candidatura." | `tvde/application-steps.tsx`, `candidatura/confirmacao/page.tsx` |
| 9 | Confirmação, botão do portal | 360 | "Carregar documentos no portal do motorista" partia em duas linhas com o ícone solto à direita | Posicionamento: rótulo de botão numa linha | "Abrir o portal do motorista"; o texto por cima já diz que os documentos se carregam lá | `candidatura/confirmacao/page.tsx` |
| 10 | Sair a meio | todas | Sem rascunho, fechar a página perdia tudo sem aviso | UX: o documento diz que o portal permite rascunho; aqui não há | Aviso do browser ao sair com dados escritos (`beforeunload`). Nada é guardado no browser | `tvde/application-steps.tsx` |
| 12 | Cadastro sem viatura, coluna da direita | 1024 e 1440 | Sem o resumo da viatura, a metade direita da página ficava vazia (visto pelo João a 1440 px) | `anti-ai.md`: espaço sem função; Design A2 | A ficha e a barra de passos ficam centradas na página (`mx-auto max-w-3xl`). Uma coluna com "Tenha à mão" foi experimentada e retirada a pedido do João | `tvde/application-layout.tsx` |
| 13 | Categorias da carta | todas | 13 botões (AM a DE) para uma regra que só pede a B; para TVDE só conta a B (visto pelo João) | UX: não pedir o que não serve | Uma caixa obrigatória "Tenho carta de condução de categoria B."; a API recebe `categorias: ["B"]`. As outras categorias deixam de se pedir; se o WeGest as usar, voltam como opcionais | `wegest/http-transport.ts` |
| 11 | Entrar, separador de motorista | 360 e 1440 | O subtítulo "Painel do motorista" falava só a quem já tem conta; o motorista novo não se via ali | UX: o caminho certo sem ler duas vezes | "Cadastro e painel". O Rent a Car não muda | `account/login-type-switch.tsx` |

### Visto e certo

- Sem scroll horizontal no cadastro (três partes) nem na confirmação em 360,
  768, 1024 e 1440 px, nas duas regiões.
- Botões de escolha com 44 px de altura no mínimo; anel de foco visível com
  o teclado (`has-[:focus-visible]`); setas mudam o tipo de documento.
- Ordem do teclado na parte 2: tipo de documento, número, validade, e assim
  por diante até "Voltar" e "Continuar".
- Em mobile, "Continuar" a toda a largura por cima de "Voltar"; em desktop,
  "Voltar" à esquerda e "Continuar" à direita, à mesma altura nas três partes.
- O IBAN formatado (`PT50 0002 0123 1234 5678 9015 4`) cabe no campo em todas
  as larguras. NIF e código postal no campo curto.
- Ao marcar "Ainda estou a tirar a formação TVDE", os dois campos da licença
  saem por baixo da caixa; o que está acima não se mexe.
- O resumo de erros ("Há 5 campos por corrigir.") aparece por cima dos botões
  e o foco vai para o primeiro campo com erro.
- Confirmação sem prazos nem promessas: diz só o que o documento do WeGest
  diz (a equipa pede os documentos; o portal recebe-os).
- O percurso com viatura (página da viatura, cadastro com resumo, documentos,
  sinal) continua igual.
- "Criar conta" no separador de motorista fica dentro do primeiro ecrã a 360
  e a 1440 px (topo aos 763 e 772 px numa janela de 800).

### Por confirmar fora deste ambiente

- **`npm run qa:layout`.** Neste ambiente não terminou: percorrer todas as
  rotas em 9 larguras e 2 regiões passou o limite de 25 minutos sem
  resultado. A rota `/tvde/candidatura` sem viatura foi juntada à lista do
  script; correr localmente.
- **Formato das datas.** O campo `date` é do browser. O `<html lang>` é
  `pt-PT`, mas o Chromium do teste mostrava `mm/dd/yyyy` porque segue a
  língua do sistema. Ver num telemóvel e num browser em português.
- **Confirmação de email.** Sem o Supabase do WeGest não se testa. Pelo
  código: `/registar?tipo=motorista` passa `next=/tvde/candidatura`, o
  formulário guarda-o (`rememberNext`) e o link do email volta à ficha
  (`takeNext`). A versão local do formulário de conta tem de manter estas
  duas chamadas.
- **Formulário de criar conta com os 5 campos.** Está na versão local do João,
  fora do git. O ecrã visto aqui é o do git (email e password).

## Pendentes (cliente ou WeGest)

- **Nome e telefone pedidos duas vezes.** Com o formulário de conta completo,
  pedem-se na conta e em "Sobre si". Pré-preencher a partir da conta precisa
  das chaves dos metadados confirmadas pelo WeGest (`nome`, `telefone` são
  uma proposta). Até lá, nada muda.
- **CAPTCHA.** O documento pede Turnstile ou equivalente na candidatura.
  Entraria no fim da parte "IBAN e envio", antes de "Enviar candidatura", com
  verificação em `/api/tvde/applications` (o padrão já existe em
  `/api/motoristas/lead`).
- **Documentos.** A API não recebe ficheiros. Hoje a confirmação manda para o
  portal do motorista. Se o WeGest criar um endpoint de upload, entra um
  passo de documentos depois do envio, como no percurso com viatura.
- **Entrada pelo resto do site.** Os botões de candidatura do site levam à
  pesquisa e às viaturas. Se a equipa quiser, "Candidatar-me" pode levar a
  `/entrar?tipo=motorista`. Não mudado: muda o funil de `/motoristas` e da
  página TVDE.

## Fase 2: correção

Os treze pontos da tabela foram corrigidos um a um (o 12 e o 13 depois da primeira
entrega, a pedido do João). Depois das correções:
`npm run check` e `npm run qa` passam, e a medição repetida em 360 e 1440 px
nas duas regiões confirma o alinhamento dos passos com a ficha, o foco no título da parte e a ausência de scroll horizontal.

## Fase 3: fecho

Contratos em `docs/design-system.md` (`DynamicWeGestForm`,
`RegistrationStep`, `PartProgress`, `ApplicationLayout` com `steps`,
`ApplicationTimeline` com `withVehicle`). Decisão em `DECISIONS.md` (entrada
de 2026-10-16). Alterações em `CHANGELOG.md` 0.20.1.
