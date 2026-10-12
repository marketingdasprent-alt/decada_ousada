# Mapa de informação TVDE e Rent a Car (fase 2)

Entrega da fase 2 de `docs/conteudo/prompt-mestre-informacao.md`. Transforma a
pesquisa (`docs/conteudo/pesquisa-tvde.md`) em conteúdo pronto para o site,
separando o que é facto geral do que é regra da DÉCADA OUSADA. Preparado a
2026-10-09. Aplicado no site na fase 3 (mesmo dia): perguntas frequentes e
glossário em `/perguntas-frequentes`, requisitos na página TVDE
(`TvdeRequirements`). As respostas "Geral (confirmar no diploma)" ficaram fora do
site até o texto da Lei n.º 59/2026 ser confirmado.

**Etiquetas usadas em cada resposta:**

- **Geral:** vem de fonte oficial (IMT, diploma). Vai para o site com a fonte
  guardada e revista antes do lançamento.
- **Geral (confirmar no diploma):** vem da imprensa sobre a Lei n.º 59/2026. Só
  vai para o site depois de confirmada no texto publicado.
- **Empresa (confirmada):** está em "Factos confirmados" do prompt mestre ou no
  briefing do cliente.
- **Empresa (pendente):** só a DÉCADA OUSADA pode responder. No site, `<Pending>`
  até haver resposta. O número entre parênteses remete para as perguntas da
  secção 7 da pesquisa.

Regras para o texto final: pt-PT, frases curtas, uma ideia por resposta, sem
promessas que a empresa não fez, e os valores comerciais sempre vindos do sistema
(o sinal pela constante `TVDE_RESERVATION_FEE`, preços e cauções pelo WeGest).

---

## 1. Mensagens por fase da decisão do motorista

A ordem segue as perguntas que o motorista faz, da primeira à última. Cada
mensagem diz onde vive no site.

### "Posso conduzir em TVDE?"

- **Mensagem:** para conduzir em TVDE precisa do certificado de motorista TVDE,
  emitido pelo IMT. A DÉCADA OUSADA aluga a viatura; o certificado é seu.
- **Prova:** requisitos do IMT em lista curta (carta há mais de 3 anos, curso e
  avaliação, registo criminal), com ligação para a página do IMT.
- **Onde:** página TVDE, secção "Requisitos"; perguntas frequentes.
- **Pendente:** se a DÉCADA OUSADA aceita quem ainda aguarda o certificado (1).

### "Quanto custa e o que está incluído?"

- **Mensagem:** cada viatura mostra o preço por semana, a caução e os km
  incluídos antes de se candidatar. Sem surpresas no levantamento.
- **Prova:** os valores vêm do sistema de gestão, por viatura; a lista do que o
  preço inclui está na página de cada viatura.
- **Onde:** página de cada viatura TVDE; cartões da listagem.
- **Pendente:** o que o preço semanal inclui e o que fica por conta do motorista
  (8); franquia do seguro (5).

### "Como funciona a candidatura?"

- **Mensagem:** escolhe a viatura, preenche o cadastro, envia os documentos e
  paga o sinal. A equipa analisa a candidatura antes do levantamento.
- **Prova:** os cinco passos numerados (já no site, `TvdeProcess`) e o estado da
  candidatura na área de cliente.
- **Onde:** página inicial (secção TVDE), página TVDE, área de cliente.
- **Pendente:** prazo habitual de análise (9).

### "O que acontece ao meu dinheiro?"

É a pergunta que mais pesa: as queixas do setor concentram-se na caução e nos
descontos. Responder aqui com clareza é o que mais gera confiança.

- **Mensagem:** paga 50 € de sinal para confirmar a reserva da viatura. Esse
  valor é descontado na caução quando a levanta. Se a candidatura não for
  aprovada, o valor pago é devolvido.
- **Prova:** o resumo da candidatura mostra o sinal, a caução e o restante a
  pagar no levantamento.
- **Onde:** passo de pagamento, resumo lateral, perguntas frequentes, página TVDE.
- **Pendente:** como e quando a caução é devolvida no fim do aluguer, e o que
  pode ser descontado (3); o que acontece ao sinal se o motorista desistir (4).

### "E se eu quiser parar?"

- **Mensagem:** o contrato diz com quanto tempo de aviso pode devolver a viatura.
- **Onde:** página de cada viatura (condições), perguntas frequentes.
- **Pendente:** duração mínima e aviso prévio (6). Hoje o sistema mostra um
  período mínimo por viatura; a regra de saída antecipada falta.

---

## 2. Perguntas frequentes para o site

Texto pronto a usar. A coluna "Etiqueta" diz se pode ir já para o site.

### TVDE: começar

| Pergunta | Resposta | Etiqueta |
|---|---|---|
| Preciso de certificado para conduzir em TVDE? | Sim. Precisa do certificado de motorista TVDE, emitido pelo IMT. A DÉCADA OUSADA aluga a viatura; o certificado é pedido por si ao IMT. | Geral |
| Como obtenho o certificado de motorista TVDE? | Faz o curso de formação inicial numa entidade reconhecida pelo IMT e a avaliação final, pede o registo criminal com a finalidade indicada pelo IMT e submete o pedido no IMT Online. Tem de ter carta de condução de categoria B há mais de 3 anos. | Geral |
| Quanto tempo é válido o certificado? | 5 anos. Renova-se com um curso de formação contínua de 8 horas, antes de caducar. | Geral |
| Posso alugar enquanto aguardo o certificado? | Resposta da DÉCADA OUSADA. | Empresa (pendente, 1) |
| Quais são os requisitos para me candidatar? | Resposta da DÉCADA OUSADA (idade mínima, anos de carta, certificado emitido). | Empresa (pendente, 1) |
| Que documentos tenho de enviar? | Os documentos pedidos aparecem na página de cada viatura, antes de se candidatar, e no passo "Documentos". | Empresa (confirmada: vêm do sistema) |

### TVDE: valores

| Pergunta | Resposta | Etiqueta |
|---|---|---|
| Quanto pago para reservar uma viatura TVDE? | 50 € de sinal. Confirmam a reserva da viatura e são descontados na caução quando a levanta. A candidatura continua sujeita a análise. | Empresa (confirmada; já no site) |
| O pagamento do sinal garante a aprovação? | Não. O sinal confirma a reserva da viatura, mas a candidatura é analisada pela DÉCADA OUSADA. Se não for aprovada, o valor pago é devolvido. | Empresa (confirmada; já no site) |
| Quanto é a caução? | Depende da viatura e aparece na página de cada uma, antes de se candidatar. O sinal de 50 € já pago é descontado na caução. | Empresa (confirmada: valor vem do sistema) |
| Quando me devolvem a caução? | Resposta da DÉCADA OUSADA (prazo e o que pode ser descontado). | Empresa (pendente, 3) |
| E se eu desistir depois de pagar o sinal? | Resposta da DÉCADA OUSADA. | Empresa (pendente, 4) |
| O que está incluído no preço semanal? | Cada viatura mostra o que inclui na sua página (seguro, manutenção, assistência), antes de se candidatar. | Empresa (confirmada: lista vem do sistema; já no site) |
| Qual é a franquia do seguro? | Resposta da DÉCADA OUSADA. | Empresa (pendente, 5) |
| Existe limite de quilómetros? | Sim. Cada viatura indica os km incluídos e o custo de cada km adicional. | Empresa (confirmada; já no site) |

### TVDE: contrato e viatura

| Pergunta | Resposta | Etiqueta |
|---|---|---|
| Qual é o período mínimo de aluguer? | Cada viatura indica o período mínimo na sua página. | Empresa (confirmada: vem do sistema) |
| Posso devolver a viatura antes do fim? | Resposta da DÉCADA OUSADA (aviso prévio e custos). | Empresa (pendente, 6) |
| Quanto tempo demora a análise da candidatura? | Resposta da DÉCADA OUSADA. Pode acompanhar o estado na sua área de cliente. | Empresa (pendente, 9) |
| As viaturas cumprem as regras para TVDE? | Resposta da DÉCADA OUSADA (idade da viatura e dístico do IMT, segundo a Lei n.º 59/2026). | Empresa (pendente, 10) |
| Quem paga combustível, carregamentos e portagens? | Resposta da DÉCADA OUSADA. | Empresa (pendente, 8) |

### TVDE: lei (apoio, para a página TVDE ou um guia)

| Pergunta | Resposta | Etiqueta |
|---|---|---|
| O que mudou na lei TVDE em 2026? | A Lei n.º 59/2026 está em vigor desde 1 de setembro de 2026. Entre outras mudanças, a formação inicial passa a ter no mínimo 50 horas com exame final, e o curso verifica o domínio funcional da língua portuguesa. | Geral (confirmar no diploma) |
| Até que idade pode ter uma viatura TVDE? | 10 anos desde a primeira matrícula, ou 12 anos se for exclusivamente elétrica. | Geral (confirmar no diploma) |
| As regras são iguais nos Açores? | Os Açores têm regime regional próprio (Decreto Legislativo Regional n.º 10/2022/A). | Geral; detalhe pendente (11) |

### Rent a Car

| Pergunta | Resposta | Etiqueta |
|---|---|---|
| A reserva fica logo confirmada? | (Já no site.) O pedido entra no sistema de gestão e é confirmado pela equipa. | Empresa (confirmada; já no site) |
| Que documentos tenho de apresentar no levantamento? | Resposta da DÉCADA OUSADA. | Empresa (pendente, 12) |
| Qual é a idade mínima para alugar? | Resposta da DÉCADA OUSADA. | Empresa (pendente, 12) |
| Como funciona a caução? | Resposta da DÉCADA OUSADA (valor por categoria, cartão aceite, quando é libertada). | Empresa (pendente, 13) |
| Posso levar a viatura para Espanha? | Resposta da DÉCADA OUSADA. | Empresa (pendente, 14) |

---

## 3. Glossário

Definições curtas para o site (perguntas frequentes ou dicas junto dos termos).

| Termo | Definição |
|---|---|
| TVDE | Transporte remunerado de passageiros em viaturas pedidas por aplicação (Uber, Bolt e outras). |
| Certificado de motorista TVDE | Documento do IMT que habilita a conduzir em TVDE. Válido por 5 anos. |
| Operador TVDE | Empresa licenciada pelo IMT para prestar o serviço TVDE através das plataformas. |
| Sinal | Valor pago para confirmar a reserva da viatura TVDE. Na DÉCADA OUSADA são 50 €, descontados na caução no levantamento. |
| Caução | Valor de garantia pago no levantamento e devolvido no fim do aluguer, nas condições do contrato. |
| Franquia | Valor máximo a cargo do condutor em caso de dano coberto pelo seguro. |
| Km incluídos | Quilómetros que o preço já cobre. Acima disso, cada km tem um custo indicado na viatura. |
| Período mínimo | Tempo mínimo de aluguer indicado em cada viatura. |

---

## 4. Lacunas

Informação que o site precisa e que ninguém confirmou ainda. Cada uma bloqueia
uma parte da fase 3.

| Lacuna | Bloqueia | Quem responde |
|---|---|---|
| Requisitos próprios da DÉCADA OUSADA para alugar TVDE (1) | Secção "Requisitos" da página TVDE; 2 perguntas frequentes | Equipa |
| A quem alugam: motorista, operador ou ambos (2) | Texto da página TVDE e o tom do contrato | Equipa |
| Devolução da caução: prazo e descontos (3) | A pergunta mais importante para a confiança | Equipa |
| Sinal se o motorista desistir (4) | Pergunta frequente e aviso no pagamento | Equipa |
| Franquia do seguro (5) | Página de cada viatura | Equipa (ou WeGest, se o sistema a devolver) |
| Aviso prévio e saída antecipada (6) | Condições da viatura; pergunta frequente | Equipa |
| Km por mês ou por semana (7) | Rótulo dos km na viatura. O WeGest devolve por mês; o briefing fala em 1.500 km por semana | Equipa e WeGest |
| O que o preço inclui e quem paga energia e portagens (8) | Página de cada viatura | Equipa |
| Prazo de análise (9) | Pergunta frequente; confirmação da candidatura | Equipa |
| Conformidade da frota com a Lei n.º 59/2026 (10) | Pergunta frequente sobre regras da viatura | Equipa |
| Regras TVDE nos Açores (11) | Site dos Açores (requisitos) | Equipa e confirmação do diploma regional |
| Rent a Car: documentos, idade, caução, Espanha (12 a 14) | 4 perguntas frequentes Rent a Car | Equipa |
| Texto da Lei n.º 59/2026 | Respostas "Geral (confirmar no diploma)" | Pesquisa: ler o diploma publicado |

**Pronto para a fase 3 sem esperar pela equipa:** as perguntas frequentes com
etiqueta "Geral" (certificado, validade) e "Empresa (confirmada)", e o glossário.
Tudo o resto entra com `<Pending>` ou espera pela resposta.
