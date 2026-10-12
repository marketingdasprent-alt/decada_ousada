# Prompt mestre: informação TVDE e Rent a Car

Prompt para pesquisar, verificar e aplicar no site a informação de que o
motorista TVDE e o cliente Rent a Car precisam para decidir. Responde ao pedido
da equipa (2026-10-09): "é preciso mais informação; pesquisar em sites de TVDE e
grupos e trazer informação útil".

Corre em três fases, cada uma com entrega própria e aprovação antes da seguinte.
Usa as regras de `AGENTS.md`, `docs/content-style.md` e a secção "Factos
confirmados" abaixo, que manda sobre qualquer fonte externa.

---

## Factos confirmados pela DÉCADA OUSADA

A única fonte para regras comerciais da empresa. Uma fonte externa nunca as
substitui; se a pesquisa contradisser um destes factos, regista a diferença e
pergunta à equipa.

| Facto | Valor | Fonte | Onde está no site |
|---|---|---|---|
| Sinal TVDE | 50 € por reserva, fixo para todas as viaturas | Equipa (Thiago Sousa), 2026-10-09 | `TVDE_RESERVATION_FEE` em `src/domain/pricing/index.ts` |
| Destino do sinal | Descontado na caução quando o motorista levanta a viatura | Equipa, 2026-10-09 | Resumo da candidatura ("Restante da caução"), passo de pagamento, FAQ |
| Efeito do sinal | Com o sinal pago, a reserva da viatura fica confirmada | Equipa, 2026-10-09 | Passo 4 do processo TVDE, FAQ |
| Aprovação | O sinal não é aprovação: a candidatura é analisada pela DÉCADA OUSADA | Briefing do cliente | Aviso obrigatório no pagamento |
| Preço semanal, caução, km incluídos | Por viatura, vindos do WeGest | API WeGest | Página de cada viatura |
| IVA TVDE | 6 % (Rent a Car 23 %) | API WeGest | Preços já com IVA |

Pendentes (não inventar; mostrar com `<Pending>` até a equipa responder).
Estado depois da fase 3 (2026-10-09); os números remetem para a secção 7 de
`docs/conteudo/pesquisa-tvde.md`:

| Pendente | Onde aparece no site como "a confirmar" |
|---|---|
| Requisitos próprios para alugar TVDE e se aceitam quem aguarda o certificado (1) | Página TVDE ("Requisitos"); 2 perguntas frequentes |
| A quem alugam: motorista, operador ou ambos (2) | Ainda não está no site (muda o texto da página TVDE) |
| Devolução da caução: prazo e descontos (3) | Pergunta frequente |
| Sinal se o motorista desistir (4) | Pergunta frequente |
| Franquia do seguro TVDE (5) | Pergunta frequente |
| Aviso prévio e saída antecipada (6) | Pergunta frequente |
| Km por mês ou por semana (7) | Ainda não está no site (o rótulo vem do WeGest: por mês) |
| Quem paga energia e portagens (8) | Pergunta frequente |
| Prazo de análise (9) | Pergunta frequente |
| Conformidade da frota com a Lei n.º 59/2026 (10) | Ainda não está no site |
| Regras TVDE nos Açores (11) | Página TVDE e perguntas frequentes (site dos Açores) |
| Rent a Car: documentos, idade mínima, caução, Espanha (12 a 14) | 4 perguntas frequentes |
| Contactos (telefone, email, morada) | Rodapé e Contactos |
| Texto da Lei n.º 59/2026 confirmado no diploma | As respostas sobre a lei nova ficaram fora do site até lá |

---

## Fase 1: pesquisa

**Objetivo:** juntar o que um motorista TVDE (e um cliente Rent a Car) precisa de
saber antes de alugar, com a fonte de cada informação.

**Fontes, por esta ordem de confiança:**

1. Oficiais: IMT (licenciamento TVDE, certificado de motorista, operadores),
   Lei n.º 45/2018 e alterações, Portal das Finanças e Segurança Social
   (atividade e enquadramento fiscal), Autoridade da Mobilidade e dos Transportes.
2. Plataformas: páginas públicas de requisitos de motorista da Uber, Bolt e
   Free Now em Portugal.
3. Concorrentes que alugam viaturas TVDE em Portugal: o que mostram (preço
   semanal, caução, km, seguro, manutenção, requisitos, processo), sem copiar
   texto.
4. Comunidade: grupos e fóruns públicos de motoristas TVDE (Facebook, Reddit,
   fóruns, comentários públicos), só para perceber dúvidas, medos e objeções
   frequentes.

**Regras da pesquisa:**

- Cada informação leva fonte (link e data de consulta). Sem fonte, não entra.
- Lei e regras oficiais: confirmar a versão em vigor; assinalar se a fonte tem
  mais de 12 meses.
- Comunidade: registar padrões ("muitos perguntam se a caução é devolvida"), nunca
  nomes, fotografias, números ou mensagens identificáveis. Não entrar em grupos
  privados nem contornar regras de acesso.
- Concorrentes: registar práticas e valores públicos para contexto; não os usar
  como preço ou regra da DÉCADA OUSADA.

**Entrega:** `docs/conteudo/pesquisa-tvde.md` com:

1. Requisitos legais para conduzir em TVDE (certificado, carta, registo, seguro
   da viatura, idade), cada um com fonte.
2. O processo típico de começar (certificação, inscrição numa plataforma, viatura
   própria ou alugada, operador TVDE).
3. Custos que o motorista compara: preço semanal, caução, sinal, km incluídos e
   adicionais, seguro, manutenção, combustível ou carregamento, comissões das
   plataformas.
4. As 15 a 20 dúvidas e objeções mais frequentes na comunidade, agrupadas.
5. O que os concorrentes mostram e o que falta nos sites deles.
6. Para o Rent a Car: documentos habituais no levantamento, idade mínima, carta,
   caução e franquia, só como contexto para perguntas à equipa.
7. Lista de perguntas à DÉCADA OUSADA: tudo o que a pesquisa mostra que o cliente
   quer saber e que só a empresa pode responder.

---

## Fase 2: síntese

**Objetivo:** transformar a pesquisa em conteúdo pronto a usar, separando o que é
facto geral (lei, plataformas) do que é regra da empresa.

**Entrega:** `docs/conteudo/mapa-informacao.md` com:

1. Mensagens por fase da decisão do motorista: "posso conduzir em TVDE?",
   "quanto custa e o que está incluído?", "como funciona a candidatura?", "o que
   acontece ao meu dinheiro?" (sinal de 50 €, caução, devolução).
2. Perguntas frequentes reescritas para o site (pt-PT, curtas, uma ideia por
   resposta), cada uma marcada como:
   - **Geral:** vem de fonte oficial; pode ir para o site com a fonte guardada.
   - **Empresa (confirmada):** está em "Factos confirmados".
   - **Empresa (pendente):** precisa de resposta da equipa; vai com `<Pending>`.
3. Glossário curto: TVDE, operador TVDE, certificado de motorista TVDE, caução,
   sinal, franquia, km incluídos.
4. Lacunas: informação que o site precisa e que ninguém confirmou.

---

## Fase 3: aplicação no site

**Objetivo:** pôr a informação aprovada nas páginas certas, sem inventar.

**Onde:**

- Página TVDE: secção "Requisitos para se candidatar" (gerais com fonte;
  próprios da empresa só depois de confirmados) e o processo com o sinal de 50 €.
- Página de cada viatura TVDE: caução, sinal de 50 € descontado na caução, km
  incluídos, o que o preço semanal inclui.
- Perguntas frequentes: grupos TVDE e Rent a Car com as respostas aprovadas.
- Página inicial: secção TVDE (já existe; só ajustar texto se a pesquisa mostrar
  uma dúvida principal que não esteja respondida).

**Regras de aplicação:**

- Regras comerciais só de "Factos confirmados". O sinal usa sempre a constante
  `TVDE_RESERVATION_FEE`; nunca escrever "50 €" à mão no código.
- Preços, cauções e km vêm do WeGest; o texto explica-os, não os repete.
- Informação legal leva a data de consulta no documento de pesquisa e é revista
  antes do lançamento.
- Sem promessas que a empresa não fez ("aprovação em 24 h", "sem caução").
- Texto em pt-PT, segundo `docs/content-style.md`; `npm run qa` sem falhas.
- Cada alteração regista o que mudou no `CHANGELOG.md`.

**Entrega:** alterações no site, com `npm run check`, `npm run qa` e
`npm run qa:layout` limpos, e a lista de pendentes atualizada nesta página.
