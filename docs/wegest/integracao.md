# Ligar a API real do WeGest

Estado em 2026-10-12: o site já fala com a API real (v1.0.0,
`docs/wegest/openapi.json`, atualizado nesse dia). Com `WEGEST_MODE=http` o
catálogo, a disponibilidade e os preços vêm do WeGest. As reservas e as
candidaturas online estão implementadas, mas ficam desligadas até haver
pagamentos reais, base de dados e CAPTCHA (`WEGEST_PEDIDOS_ONLINE`).

| Ficheiro | Papel |
|---|---|
| `src/services/wegest/api-types.ts` | Formatos da API real (campos em português) |
| `src/services/wegest/http-transport.ts` | Caminhos reais e conversão para os DTOs internos |
| `src/services/wegest/client.ts` | `X-API-Key`, timeout, retry, cache do catálogo, erros por `erro.codigo` |

## Variáveis (Vercel → Settings → Environment Variables)

| Variável | Valor |
|---|---|
| `WEGEST_MODE` | `http` (API real) ou `mock` (demonstração) |
| `WEGEST_API_URL` | `https://api.wegest.pt/v1` |
| `WEGEST_API_KEY` | chave `wg_ra_…` (segredo; nunca `NEXT_PUBLIC_`) |
| `WEGEST_PEDIDOS_ONLINE` | `off` até os requisitos abaixo estarem prontos; depois `on` |

## Testar

- Leitura (não cria nada): `node --env-file=.env.local scripts/wegest-teste.mjs`
- Site local contra a API real: `WEGEST_MODE=http npx next build`, depois a
  configuração `web-build-api-real` de `.claude/launch.json` (porta 3011).
- Escrita: cria uma **reserva real**. Só com aviso à equipa, que a cancela no
  WeGest (ou `DELETE /reservas/{codigo}` enquanto está pendente).

## Mapa transport → endpoint real

| Método do transport | Endpoint WeGest | Notas |
|---|---|---|
| `listLocations` | `GET /localizacoes` | A API não tem região: os Açores reconhecem-se pelo nome, cidade ou morada |
| `listCategories` | `GET /categorias` (+ categorias dos modelos TVDE) | Comercial quando algum modelo da categoria é `tipo: comercial` |
| `listVehicles` (RAC) | `GET /modelos` + `GET /modelos/{id}` | Um pedido de detalhe por modelo (km, franquia, caução) |
| `listVehicles` (TVDE) | `GET /tvde/modelos` | O mesmo modelo em RAC e TVDE fica uma viatura com duas ofertas |
| `searchAvailability` (RAC) | `GET /disponibilidade` | Já traz o preço do período: dispensa uma cotação por modelo |
| `searchAvailability` (TVDE) | `GET /tvde/disponibilidade?inicio` | Sem local nem fim |
| `listExtras` / `listCoverages` | `GET /extras` / `GET /coberturas` | |
| `quote` | `POST /cotacoes` | A API não dá id à cotação |
| `createBooking` | `POST /reservas` | Cliente e carta no corpo; `total_esperado` protege o preço; `referencia_externa` = chave de idempotência |
| `getBooking` / `cancelBooking` | `GET` / `DELETE /reservas/{codigo}` | Cancelar só enquanto pendente |
| `createApplication` | `POST /tvde/candidaturas` | Todos os dados num pedido; sem documentos nem pagamento |
| `getApplication` | `GET /tvde/candidaturas/{id}` | Só estado e datas |
| `getApplicationForm` | (local) | Ficha com os campos que a API pede |
| clientes, listas por cliente, faturas, pré-visualização de cancelamento, documentos TVDE | (sem endpoint) | Ver `analise-gaps.md` |

## Antes de ligar `WEGEST_PEDIDOS_ONLINE=on`

Estado a 16/10/2026: pontos 2 e 3 resolvidos no código; o 1 fica para a
integração da base de dados com o WeGest.

1. **Base de dados persistente** (`DATABASE_URL`). Hoje contas, pagamentos, fichas
   de cliente e a lista de reservas de cada cliente vivem em memória: no Vercel
   perdem-se entre pedidos. Até lá, a confirmação da candidatura lê o estado ao
   WeGest, mas "As minhas reservas" e a área TVDE podem não mostrar o pedido.
2. **Pagamentos:** decisão de 16/10/2026, sem cobrança online por enquanto. Sem um
   `PAYMENT_PROVIDER` real, os pedidos seguem sem pagamento (`onlinePaymentsEnabled`).
3. **CAPTCHA** no formulário TVDE (exigido pela API: 50 candidaturas por dia por chave):
   Turnstile no fim do cadastro, ativo com `TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY`.
4. **Fluxo TVDE ajustado à API:** a candidatura vai inteira num só pedido; os
   documentos não vão pela API (a equipa pede-os depois); decidir se o sinal de 50 €
   continua a ser pago online.
5. Um teste de escrita combinado com a equipa.

## Regras da API a respeitar

- Datas **sempre com fuso**: já tratado por `toApiDateTime()` em `src/lib/dates.ts`.
- Dinheiro `{ sem_iva, com_iva, iva }` → mostrar `com_iva`; não recalcular IVA.
- Erros: decidir pelo `erro.codigo`, nunca mostrar `erro.mensagem` ao cliente
  (`client.ts` traduz os códigos para mensagens em português).
- Limite 120 pedidos/min por chave: o catálogo fica 5 min em cache no servidor; em 429
  espera-se o `Retry-After`.
- `imagem_url` é temporária (24 h): nunca guardar o link.
