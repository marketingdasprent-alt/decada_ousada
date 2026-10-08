# DÉCADA OUSADA: Rent a Car e TVDE

Plataforma de pesquisa, reserva e candidatura de viaturas, com dois produtos (**Rent a Car** ao dia e **TVDE** à semana) e duas regiões (**Continente** e **Açores**) num único código.

> O website é a experiência digital. O **WeGest** é o sistema operacional do negócio.

## Arrancar

```bash
npm install
cp .env.example .env.local   # WEGEST_MODE=mock por omissão
npm run dev
```

- Continente: http://localhost:3000
- Açores: http://acores.localhost:3000 ou http://localhost:3000/?regiao=acores (em dev fica em cookie; `?regiao=continente` para voltar)
- Conta de demonstração (só em modo mock): ver `src/services/auth/seed.ts`
- Backoffice técnico + simulador WeGest: `/admin` (com a conta de demonstração)

## Modo de dados

| `WEGEST_MODE` | Fonte |
|---|---|
| `mock` (omissão) | Dados de demonstração em memória (`src/services/wegest/mock`). Reiniciar o servidor repõe os dados. |
| `http` | API real `https://api.wegest.pt/v1` com `WEGEST_API_KEY`. Ver [docs/wegest/integracao.md](docs/wegest/integracao.md). |

## Arquitetura

```
src/
├── proxy.ts              host → região (acores.* → /azores, resto → /mainland)
├── app/[region]/         páginas (o segmento da região nunca aparece no URL)
├── app/api/              API interna: proxy/adaptador para o WeGest (doc §118)
├── domain/               modelo interno: Vehicle, VehicleOffer, Quote, Booking, TvdeApplication…
├── services/
│   ├── wegest/           ÚNICA porta para dados operacionais
│   │   ├── index.ts      funções usadas pelas páginas (com cache de catálogo)
│   │   ├── transport.ts  contrato de baixo nível
│   │   ├── mock/         implementação de demonstração
│   │   ├── http-transport.ts + client.ts   API real (timeout, retry limitado, logs sem segredos)
│   │   └── mappers.ts    formato WeGest → modelo interno
│   ├── payments/         PaymentGateway abstrato (fornecedor por decidir)
│   ├── auth/             login/sessão do site (≠ ficha do cliente no WeGest)
│   ├── store/            BD local: users, vínculos wegestCustomerId, pagamentos, reembolsos
│   ├── email/ notifications/   preparados, fornecedor por decidir
│   └── tvde.ts           pagamento × estado da candidatura, reembolso automático na recusa
└── components/           design system (VehicleCard, PriceDisplay, BookingSummary, DynamicWeGestForm…)
```

Regras seguidas (do documento do projeto):
- O frontend só conhece o modelo interno de `src/domain`.
- Preços, totais, cauções e disponibilidade vêm sempre da API; o frontend nunca recalcula.
- A disponibilidade volta a ser verificada no checkout e na criação da reserva.
- Pagamento concluído ≠ candidatura aprovada.
- Segredos só no servidor; documentos TVDE validados por assinatura binária e enviados sem URLs públicas.
- Nenhuma operação fica em loading infinito (timeouts + estados de erro).

## Qualidade (padrão Web Blueprint)

```bash
npm run check            # lint + tipos + build de produção
npm run qa               # auditoria estática do Blueprint (conteúdo, tokens, a11y, SEO)
npm run validate:wegest  # valida a API real contra o openapi.json (precisa de WEGEST_API_KEY)
```

Regras do projeto: [AGENTS.md](AGENTS.md). Exceções ao Blueprint: [DECISIONS.md](DECISIONS.md).

## Documentação

- [docs/briefing-cliente.md](docs/briefing-cliente.md): briefing original da plataforma (estava no README do repositório)
- [docs/wegest/integracao.md](docs/wegest/integracao.md): como ligar a API real (passo a passo)
- [docs/wegest/analise-gaps.md](docs/wegest/analise-gaps.md): o que a API cobre e o que falta
- `docs/wegest/openapi.json`: especificação oficial descarregada da API
- [docs/design-system.md](docs/design-system.md) e [docs/stack.md](docs/stack.md): tokens, componentes e stack
