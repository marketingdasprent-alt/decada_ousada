# Validação da API WeGest

- Data: 2026-10-12T13:48:33.132Z
- Base: `https://api.wegest.pt/v1`
- Modo: só leitura
- Organização: `11111111-1111-1111-1111-111111111111`
- Permissões da chave: `catalogo:read`, `disponibilidade:read`, `reservas:read`, `reservas:write`, `tvde:catalogo:read`, `tvde:candidaturas:read`, `tvde:candidaturas:write`
- tarifa_site: **true** · tarifa_site_tvde: **true**
- Resultado: **19/19** verificações OK

| | Endpoint | Status | Tempo | Itens | Erro | Divergências |
|---|---|---|---|---|---|---|
| ✅ | `GET health` | 200 | 1242 ms |  |  |  |
| ✅ | `GET localizacoes` | 200 | 1531 ms | 4 |  |  |
| ✅ | `GET categorias` | 200 | 920 ms | 0 |  |  |
| ✅ | `GET modelos` | 200 | 1154 ms | 0 |  |  |
| ✅ | `GET modelos?tipo=passageiros` | 200 | 793 ms | 0 |  |  |
| ✅ | `GET modelos?tipo=comercial` | 200 | 1144 ms | 0 |  |  |
| ✅ | `GET modelos/{id} inexistente → 404` | 404 | 1465 ms |  | NAO_ENCONTRADO |  |
| ✅ | `GET extras` | 200 | 783 ms | 2 |  |  |
| ✅ | `GET coberturas` | 200 | 778 ms | 0 |  |  |
| ✅ | `GET disponibilidade (+7d, 3 dias)` | 200 | 828 ms | 0 |  |  |
| ✅ | `GET disponibilidade sem fuso → 400` | 400 | 1297 ms |  | PARAMETRO_INVALIDO |  |
| ✅ | `GET disponibilidade no passado → 400` | 400 | 822 ms |  | PERIODO_INVALIDO |  |
| ✅ | `GET disponibilidade 31 dias → 400` | 400 | 834 ms |  | PERIODO_EXCEDE_MAXIMO |  |
| ✅ | `GET disponibilidade entrega≠recolha` | 200 | 1100 ms | 0 |  |  |
| ✅ | `GET reservas/{codigo} inexistente → 404` | 404 | 1131 ms |  | NAO_ENCONTRADO |  |
| ✅ | `GET tvde/modelos` | 200 | 1936 ms | 30 |  |  |
| ✅ | `GET tvde/modelos/{id}` | 200 | 789 ms |  |  |  |
| ✅ | `GET tvde/disponibilidade (+7d)` | 200 | 2021 ms | 16 |  |  |
| ✅ | `GET tvde/disponibilidade +200d → 400` | 400 | 1112 ms |  | PERIODO_INVALIDO |  |

## Contagens

- Localizações: 4: Açores, Leiria, Prior Velho, Vila Nova de Gaia
- Categorias: 0: 
- Modelos RAC: 0 (com foto: 0)
- Extras: 2 · Coberturas: 0
- Modelos TVDE: 30
