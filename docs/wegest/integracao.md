# Ligar a API real do WeGest

O site já funciona de ponta a ponta com dados de demonstração. Para passar à API real, o trabalho fica concentrado em **3 ficheiros**; páginas, componentes e API interna não mudam.

| Ficheiro | O que muda |
|---|---|
| `src/services/wegest/types.ts` | Os tipos `Wg*` passam a refletir o `openapi.json` (campos em português: `modelo`, `preco_dia`, `com_iva`…) |
| `src/services/wegest/http-transport.ts` | Caminhos reais e corpo dos pedidos |
| `src/services/wegest/mappers.ts` | Conversão dos campos reais para o modelo interno |

## Passos

1. Criar uma chave **só de leitura** no WeGest (Integrações → Chaves de API) com `catalogo:read`, `disponibilidade:read` e `tvde:catalogo:read`.
2. Em `.env.local`: `WEGEST_API_KEY=wg_ra_…`
3. `node scripts/validate-wegest.mjs` → confirma a chave e o formato real das respostas (`docs/wegest/validacao.md`).
4. Ajustar os 3 ficheiros acima (mapa abaixo).
5. `WEGEST_MODE=http` e testar os fluxos.
6. Teste de escrita (cria **uma reserva real** e cancela-a): avisar a equipa e correr `node scripts/validate-wegest.mjs --write`.

## Mapa transport → endpoint real (API v1.0.0)

| Método do transport | Endpoint WeGest | Notas |
|---|---|---|
| `listLocations` | `GET /localizacoes` | Sem região na API → filtrar por cidade ou chave por região (ver gaps #7) |
| `listCategories` | `GET /categorias` | `tipo` passageiros/comercial vem nos modelos |
| `listVehicles` (RAC) | `GET /modelos` | **Modelo**, não viatura: "Clio ou similar" |
| `listVehicles` (TVDE) | `GET /tvde/modelos` | Preço `preco_semana`, IVA 6 % |
| `getVehicle` | `GET /modelos/{id}` · `GET /tvde/modelos/{id}` | Detalhe com `tarifa.km_incluidos`, `franquia`, `caucao` |
| `searchAvailability` (RAC) | `GET /disponibilidade?inicio&fim&entrega&recolha` | Já devolve `cotacao.aluguer` → dispensa uma cotação por modelo nos resultados |
| `searchAvailability` (TVDE) | `GET /tvde/disponibilidade?inicio` | Sem local nem data de fim |
| `listExtras` | `GET /extras` | `tipo_calculo`: `dia` → day, `fixo` → booking |
| `listCoverages` | `GET /coberturas` | `preco_dia.com_iva`, `franquia` |
| `quote` | `POST /cotacoes` | `subtotal.com_iva` = total a mostrar e a enviar em `total_esperado` |
| `createBooking` | `POST /reservas` | Cliente + carta no corpo; `referencia_externa` = chave de idempotência; 409 `PRECO_ALTERADO` traz a cotação nova em `erro.detalhes` |
| `getBooking` | `GET /reservas/{codigo}` | `codigo` inteiro |
| `cancelBooking` | `DELETE /reservas/{codigo}` | Só enquanto `pendente` |
| `previewCancellation` | (sem endpoint) | Não existe: mostrar a política fixa ou desativar |
| `createCustomer` / `updateCustomer` / `getCustomer` | (sem endpoint) | **Não existem.** O cliente é criado pelo `POST /reservas`. Guardar localmente o que for preciso para o portal (ver gaps #1) |
| `listCustomerBookings` | (sem endpoint) | Não existe: guardar `user → codigo` localmente e consultar cada reserva |
| `listCustomerInvoices` | (sem endpoint) | Não existe: ocultar "Faturas" |
| `getApplicationForm` · `createApplication` · `uploadApplicationDocument` · `submitApplication` · `getApplication` | (sem endpoint) | **TVDE fase seguinte do WeGest.** Até lá: manter a candidatura no site + email à equipa, ou esperar pela fase D2 |
| `ping` | `GET /health` | Confirma `tarifa_site` e `tarifa_site_tvde` |

## Regras da API a respeitar

- Datas **sempre com fuso**: já tratado por `toApiDateTime()` em `src/lib/dates.ts`.
- Dinheiro `{ sem_iva, com_iva, iva }` → mostrar `com_iva`; não recalcular IVA.
- Erros: decidir pelo `erro.codigo`, nunca mostrar `erro.mensagem` ao cliente (o `client.ts` já normaliza).
- Limite 120 pedidos/min por chave; catálogo em cache 5 min (já configurado com `cacheLife("minutes")`).
- `imagem_url` é temporária (24 h): nunca guardar o link.
