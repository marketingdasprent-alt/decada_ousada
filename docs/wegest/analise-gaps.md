# API WeGest v1.0.0 × documento do projeto: análise de gaps

Fonte: `docs/wegest/openapi.json` (descarregado de https://api.wegest.pt/v1/openapi.json, 2026-10-07).

## O que a API cobre ✅

| Necessidade do projeto | Endpoint WeGest |
|---|---|
| Localizações | `GET /localizacoes` |
| Categorias (com "desde X €/dia") | `GET /categorias` |
| Frota RAC (por **modelo**, "ou similar") | `GET /modelos?tipo=passageiros\|comercial&categoria=` |
| Detalhe com km incluídos, franquia, caução | `GET /modelos/{id}` |
| Extras | `GET /extras` (`tipo_calculo`: fixo \| dia, `quantidade_maxima`) |
| Coberturas / seguros (**não estava no documento**) | `GET /coberturas` |
| Disponibilidade + preço do período | `GET /disponibilidade` (máx. 30 dias, entrega ≠ recolha permitido) |
| Cotação com extras + cobertura | `POST /cotacoes` |
| Criar reserva (cliente + carta vão no corpo) | `POST /reservas` (idempotente por `referencia_externa`, protege preço com `total_esperado`) |
| Consultar / cancelar reserva | `GET` / `DELETE /reservas/{codigo}` (cancelar só se **pendente**) |
| Catálogo TVDE €/semana, caução, franquia, km | `GET /tvde/modelos`, `GET /tvde/modelos/{id}` |
| Disponibilidade TVDE (sem data de fim) | `GET /tvde/disponibilidade?inicio=` (máx. +180 dias) |
| Health / estado da integração | `GET /health` |

## O que a API **não** cobre ❌ (e impacto)

| # | Gap | Impacto no site | Proposta |
|---|---|---|---|
| 1 | Não há endpoints de **cliente** (criar/consultar/atualizar). O cliente é criado dentro do `POST /reservas` e "um cliente que já existe nunca é alterado". Não é devolvido `wegestCustomerId`. | Portal "Dados pessoais" e "atualizar perfil via WeGest" (doc §19–23, §33) não são possíveis. | Perfil editável só para reservas futuras (pré-preenchimento). Alterações de dados → pedido à equipa. |
| 2 | Não há **listagem de reservas por cliente**. | Histórico do portal (doc §34). | Guardar localmente `user → codigo/referencia_externa`; estado sempre consultado em `GET /reservas/{codigo}`. |
| 3 | Reserva entra **pendente**; a equipa confirma no WeGest. Sem webhooks. | Não se pode mostrar "Reserva confirmada" (doc §92). | Ecrã "Pedido de reserva recebido, aguarda confirmação". Estado atualizado por polling ao abrir o portal. |
| 4 | Sem **pagamentos** na API. | Quando cobrar? Antes da confirmação da equipa → risco de reembolso. | **Decisão do cliente:** (a) cobrar no checkout e reembolsar se recusada; (b) pré-autorização e captura na confirmação; (c) sem pagamento online na v1. |
| 5 | Cancelamento só enquanto **pendente**; sem pré-visualização de taxas. | Doc §37 (valor a devolver, taxa). | Botão cancelar só em pendentes; depois, "contacte-nos". |
| 6 | Sem **faturas** nem **documentos**. | Doc §38, menus "Faturas"/"Documentos". | Ocultar secções na v1. |
| 7 | Sem conceito de **região**; uma chave = uma organização. | Continente × Açores (doc §4–6). | **Pergunta:** os Açores são outra organização WeGest (outra chave)? Se sim, uma chave por região: já suportado pela arquitetura. Se não, filtrar por localização. |
| 8 | **TVDE só tem catálogo e disponibilidade** (fase D1). A doc diz: "As candidaturas chegam na fase seguinte." Não há candidato, ficha dinâmica, documentos, estados, sinal, aprovação. | Fluxo TVDE (doc §49–71) não pode ir ao WeGest. | v1: candidatura recolhida pelo site (storage privado) + email à equipa; migra para o WeGest quando a fase seguinte sair. **Prazo da fase seguinte?** |
| 9 | TVDE sem **local de levantamento** na disponibilidade; sem **sinal** (só caução). | Doc §45, §47–48. | Local escolhido no site e enviado na candidatura; sinal = regra comercial a confirmar. |
| 10 | Uma **foto por modelo**, link temporário (24 h). | Galeria (doc §15). | Mostrar 1 foto; não guardar o link (cache ≤ 5 min). Ilustração quando `imagem_url = null`. |
| 11 | **Sem sandbox**: testes na organização real; `POST /reservas` cria reservas verdadeiras. | Testes de escrita. | Chave só-leitura para dev; testes de reserva só com aviso à equipa e cancelamento imediato (script `--write`). |

## Diferenças de dados a considerar

- **Dinheiro** sempre `{ sem_iva, com_iva, iva }` → mostrar `com_iva`, nunca recalcular.
- **IVA TVDE = 6 %** (≠ 23 % RAC).
- **TVDE `km_incluidos` é por mês** (o documento fala em 1.500 km/semana).
- RAC `km_incluidos` é **por dia**.
- Datas **sempre com fuso** (`+01:00`/`Z`); sem fuso → 400.
- Erros: decidir pelo `erro.codigo`; **não mostrar** `erro.mensagem` ao cliente.
- `PRECO_ALTERADO` (409) traz a cotação nova em `erro.detalhes` → mostrar e pedir confirmação.
- Limite: 120 pedidos/min por chave; catálogo pode ficar em cache 5 min no servidor.
