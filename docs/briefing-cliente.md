# DÉCADA OUSADA — Plataforma Rent a Car & TVDE

Plataforma digital da **DÉCADA OUSADA** para pesquisa, reserva, contratação e gestão de viaturas destinadas a dois modelos de negócio distintos:

- **Rent a Car**
- **TVDE**

A plataforma deverá funcionar como uma camada digital integrada com o sistema de gestão de frota da empresa, permitindo consultar viaturas, disponibilidade, preços, localizações, condições, clientes, candidatos, reservas e processos de contratação.

O sistema externo de gestão, inicialmente identificado como **WeGest**, deverá ser considerado a principal fonte de dados operacionais.

O WeGest será responsável não apenas pela frota, mas também pelo **backoffice operacional dos clientes Rent a Car e dos motoristas/candidatos TVDE**.

---

# 1. Visão do produto

A DÉCADA OUSADA não deverá possuir apenas um website de aluguer de automóveis.

O objetivo é desenvolver uma **plataforma digital de mobilidade**, preparada para diferentes formas de comercialização da mesma frota.

```text
                         FROTA
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
         RENT A CAR                    TVDE
              │                         │
           €/dia                    €/semana
              │                         │
      Reserva tradicional       Candidatura + reserva
```

No futuro poderão ser adicionados novos produtos:

```text
Rent a Car
TVDE
Renting
Long Term Rental
Corporate
Subscrição
```

A arquitetura não deverá limitar a plataforma aos produtos atuais.

---

# 2. Produtos

## 2.1. Rent a Car

Aluguer tradicional de viaturas.

Principais características:

- cobrança por dia;
- pesquisa baseada em datas;
- levantamento e devolução;
- categorias de passageiros;
- categorias comerciais;
- extras e adicionais;
- pagamento de reserva;
- cadastro de cliente;
- conta de cliente;
- histórico de reservas;
- portal de cliente;
- dados operacionais geridos pelo WeGest.

---

## 2.2. TVDE

Aluguer de viaturas destinado a motoristas profissionais.

Principais características:

- cobrança por semana;
- fotografia das viaturas;
- caução;
- possibilidade de sinal;
- limite de quilómetros;
- condições específicas;
- escolha de data de levantamento;
- escolha de hora;
- escolha de local;
- candidatura do motorista;
- documentação obrigatória;
- validação da candidatura;
- reserva condicionada à aprovação;
- pagamento de sinal ou caução;
- possibilidade de rejeição e reembolso;
- dados do motorista geridos pelo WeGest;
- backoffice operacional realizado no WeGest.

---

# 3. Princípio arquitetural fundamental

Deverá existir uma separação entre:

```text
VIATURA
```

e:

```text
PRODUTO / OFERTA COMERCIAL
```

Uma viatura não deverá necessariamente ser classificada exclusivamente como Rent a Car ou TVDE.

Exemplo:

```text
Toyota Corolla Hybrid
```

poderá possuir:

```text
Oferta Rent a Car
49 €/dia
```

e simultaneamente:

```text
Oferta TVDE
275 €/semana
```

Modelo conceptual:

```text
VEHICLE
   │
   ├── RENT A CAR OFFER
   │      ├── preço diário
   │      ├── disponibilidade
   │      └── condições
   │
   └── TVDE OFFER
          ├── preço semanal
          ├── caução
          ├── limite km
          └── condições
```

Isto permite que a frota seja comercializada de várias formas sem duplicar viaturas.

---

# 4. Estrutura regional

A DÉCADA OUSADA possui operações com características geográficas distintas.

Estrutura proposta:

```text
https://www.decadaousada.pt
```

para Portugal Continental.

E:

```text
https://acores.decadaousada.pt
```

para os Açores.

---

# 5. Arquitetura dos domínios

Apesar de existirem duas experiências regionais, deverão partilhar a maior quantidade possível de infraestrutura.

```text
                  DÉCADA OUSADA
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
decadaousada.pt             acores.decadaousada.pt
   Continente                      Açores
          │                           │
          └─────────────┬─────────────┘
                        │
                        ▼
                 BACKEND COMUM
                        │
                        ▼
                     WEGEST
```

A região deverá influenciar:

- frota disponível;
- localizações;
- preços;
- condições;
- pontos de levantamento;
- disponibilidade;
- páginas SEO;
- contactos;
- campanhas;
- regras comerciais quando necessário.

---

# 6. Estratégia regional

A região deverá existir como conceito de primeira classe na aplicação.

```typescript
type Region =
  | "mainland"
  | "azores";
```

Cada viatura, oferta, cliente, reserva ou localização poderá estar associada a uma região.

---

# 7. Homepage

A homepage deverá apresentar claramente os dois serviços.

```text
Encontre a viatura certa para si.

┌──────────────────────────────┐
│          RENT A CAR          │
│                              │
│ Aluguer de viaturas          │
│ para turismo, empresas       │
│ e utilização profissional.   │
│                              │
│       [ PESQUISAR ]          │
└──────────────────────────────┘


┌──────────────────────────────┐
│             TVDE             │
│                              │
│ Viaturas preparadas para     │
│ motoristas profissionais.    │
│                              │
│ Desde XXX €/semana           │
│                              │
│      [ VER VIATURAS ]        │
└──────────────────────────────┘
```

---

# 8. RENT A CAR

## 8.1. Objetivo

Permitir que um cliente pesquise uma viatura disponível para um determinado período, selecione extras, efetue a reserva e posteriormente acompanhe essa reserva através da sua conta.

---

# 9. Pesquisa Rent a Car

Campos principais:

```text
Local de levantamento
Data de levantamento
Hora de levantamento

Local de devolução
Data de devolução
Hora de devolução
```

Poderá existir:

```text
☑ Devolver no mesmo local
```

---

# 10. Fluxo de pesquisa Rent a Car

```text
HOME
  ↓
Rent a Car
  ↓
Local
  ↓
Datas
  ↓
Horas
  ↓
Pesquisar
  ↓
Backend
  ↓
WeGest
  ↓
Disponibilidade
  ↓
Resultados
```

---

# 11. Categorias Rent a Car

Existirão inicialmente duas grandes famílias.

## Passageiros

Exemplos possíveis:

- Económico;
- Compacto;
- Médio;
- Familiar;
- SUV;
- Premium;
- Automático;
- 7 lugares.

## Comerciais

Exemplos possíveis:

- Comercial pequeno;
- Comercial médio;
- Comercial grande;
- Carrinha;
- Furgão.

As categorias reais deverão ser obtidas através da API sempre que possível.

---

# 12. Listagem Rent a Car

Exemplo de card:

```text
┌─────────────────────────────┐
│       [FOTO VIATURA]        │
│                             │
│ Peugeot 208                 │
│ Económico                   │
│                             │
│ Manual • Gasolina           │
│ 5 lugares • 5 portas        │
│                             │
│ Desde                       │
│ 39 €/dia                    │
│                             │
│ Total período: 117 €        │
│                             │
│ [ VER DETALHES ]            │
└─────────────────────────────┘
```

---

# 13. Filtros Rent a Car

Possíveis filtros:

- Passageiros;
- Comerciais;
- Preço;
- Marca;
- Categoria;
- Caixa manual;
- Caixa automática;
- Gasolina;
- Diesel;
- Híbrido;
- Elétrico;
- Número de lugares;
- Número de portas;
- Localização;
- Características.

A aplicação só deverá disponibilizar filtros para dados realmente existentes.

---

# 14. Página da viatura Rent a Car

Informações possíveis:

- fotografias;
- marca;
- modelo;
- categoria;
- descrição;
- combustível;
- transmissão;
- lugares;
- portas;
- bagageira;
- características;
- localização;
- disponibilidade;
- preço diário;
- preço total;
- caução;
- franquia;
- política de combustível;
- quilometragem;
- política de cancelamento;
- condições.

---

# 15. Fotografias

As viaturas deverão possuir galeria de imagens.

```text
[FOTO PRINCIPAL]

[FOTO 2] [FOTO 3] [FOTO 4] [FOTO 5]
```

Caso as imagens sejam disponibilizadas pelo WeGest, poderão ser utilizadas as URLs fornecidas.

A arquitetura deverá permitir posteriormente:

- proxy de imagens;
- CDN;
- otimização;
- thumbnails;
- WebP;
- AVIF.

---

# 16. Extras e adicionais Rent a Car

Durante a reserva, o cliente poderá selecionar extras.

Exemplos:

```text
Cadeira de bebé
Cadeira de criança
Condutor adicional
GPS
Wi-Fi
Proteção adicional
Seguro adicional
Franquia reduzida
Quilometragem adicional
Entrega fora de horário
```

A lista definitiva dependerá dos extras disponibilizados pelo sistema de gestão.

---

# 17. UI dos extras

```text
Personalize a sua reserva

┌──────────────────────────────────┐
│ Cadeira de bebé                  │
│ + 6 €/dia                        │
│                            [ + ] │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ Condutor adicional               │
│ + 8 €/dia                        │
│                            [ + ] │
└──────────────────────────────────┘
```

Resumo:

```text
Peugeot 208                  117 €
Cadeira de bebé               18 €
Condutor adicional            24 €

──────────────────────────────────
Subtotal                     159 €
Impostos                      XX €
Total                        XXX €
```

Os valores deverão ser obtidos ou validados através da API.

---

# 18. Checkout Rent a Car

Etapas sugeridas:

```text
1. Viatura
2. Extras
3. Dados do cliente
4. Pagamento
5. Confirmação
```

Fluxo:

```text
Viatura → Extras → Dados → Pagamento → Confirmação
```

---

# 19. Cadastro do cliente Rent a Car

O cliente realizará o cadastro no website da DÉCADA OUSADA.

Contudo, os dados operacionais do cliente deverão ser enviados através da API para o WeGest.

Fluxo:

```text
CLIENTE
   ↓
Website DÉCADA OUSADA
   ↓
Formulário
   ↓
Backend
   ↓
WeGest API
   ↓
Cliente criado / atualizado
   ↓
WeGest
```

O WeGest será responsável pelo backoffice operacional do cliente.

---

# 20. Dados do cliente Rent a Car

Possíveis campos:

- nome completo;
- data de nascimento;
- NIF;
- email;
- telefone;
- morada;
- código postal;
- localidade;
- país;
- número da carta;
- país emissor;
- data de validade;
- outros campos exigidos pelo WeGest.

Os campos definitivos deverão respeitar a estrutura e regras da API.

---

# 21. WeGest como source of truth do cliente

O WeGest deverá ser considerado a fonte oficial dos dados do cliente Rent a Car.

Evitar:

```text
WEGEST
Cliente A

+

DATABASE LOCAL
Cliente A
```

com duas fichas independentes e potencialmente divergentes.

Preferir:

```text
WEGEST
   ↓
Cliente
   ↓
Website apresenta os dados
```

---

# 22. Identificador do cliente

Após a criação do cliente no WeGest, deverá ser guardado o identificador externo devolvido pela API.

Exemplo:

```typescript
interface UserIntegration {
  userId: string;
  wegestCustomerId: string;
}
```

O vínculo deverá ser:

```text
Conta do website
       ↓
wegestCustomerId
       ↓
Cliente no WeGest
```

---

# 23. Autenticação vs cliente

A autenticação e a ficha operacional do cliente são conceitos diferentes.

## Autenticação

Responsável por:

- login;
- password;
- recuperação de password;
- sessão;
- segurança da conta.

## WeGest

Responsável por:

- dados pessoais;
- dados fiscais;
- carta de condução;
- reservas;
- histórico;
- documentos operacionais;
- dados de aluguer;
- backoffice do cliente.

---

# 24. Pagamento Rent a Car

A reserva deverá prever pagamento online.

A plataforma de pagamentos ainda não está definida.

A UI e todo o fluxo deverão ser preparados desde já.

```text
Pagamento

○ Cartão de crédito/débito
○ Método adicional futuro

Número do cartão
[________________]

Validade
[____]

CVV
[___]

[ PAGAR E RESERVAR ]
```

---

# 25. Payment Provider

A implementação deverá utilizar abstração.

```typescript
interface PaymentGateway {
  createPayment(): Promise<Payment>;
  getPayment(): Promise<Payment>;
  refundPayment(): Promise<Refund>;
}
```

Possíveis fornecedores futuros:

```text
Stripe
Mollie
Ifthenpay
Eupago
Viva
Outro
```

---

# 26. Estados de pagamento

```typescript
type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";
```

---

# 27. Reserva Rent a Car

Fluxo:

```text
Pesquisa
   ↓
Resultados
   ↓
Viatura
   ↓
Extras
   ↓
Cliente
   ↓
Validação
   ↓
Pagamento
   ↓
Nova validação de disponibilidade
   ↓
WeGest
   ↓
Reserva criada
   ↓
Confirmação
```

---

# 28. Confirmação Rent a Car

```text
Reserva confirmada

Reserva:
DO-28471

Peugeot 208

Levantamento
12/10/2026 — 10:00

Devolução
15/10/2026 — 18:00

Total
159 €

[ VER MINHA RESERVA ]
```

---

# 29. Conta de cliente Rent a Car

O utilizador deverá poder criar uma conta no website.

Método inicial:

```text
Email + password
```

Futuramente:

```text
Google
Apple
```

---

# 30. Portal de cliente Rent a Car

Rota sugerida:

```text
/minha-conta
```

Dashboard:

```text
Olá, João.

Próxima reserva
────────────────────────────

Peugeot 208

12 Out → 15 Out

Reserva #DO-28471

[ VER RESERVA ]
```

---

# 31. Fonte dos dados do portal Rent a Car

Os dados apresentados no portal deverão, sempre que possível, vir do WeGest.

Exemplo:

```text
Portal
   ↓
Backend
   ↓
WeGest API
   ↓
Dados do cliente
```

O website deverá refletir os dados existentes no sistema de gestão.

---

# 32. Área do cliente

Menu sugerido:

```text
Visão Geral
As minhas reservas
Dados pessoais
Documentos
Faturas
Preferências
Segurança
Terminar sessão
```

A disponibilidade de cada secção dependerá da API.

---

# 33. Atualização de dados Rent a Car

Quando o utilizador alterar informação no site:

```text
Cliente altera dados
       ↓
Website
       ↓
Backend
       ↓
WeGest API
       ↓
Atualização confirmada
       ↓
UI atualizada
```

O frontend não deverá assumir sucesso antes da confirmação do WeGest.

---

# 34. Histórico de reservas

Página:

```text
/minha-conta/reservas
```

Separação:

```text
Próximas
Anteriores
Canceladas
```

Os dados deverão preferencialmente ser obtidos do WeGest.

---

# 35. Detalhe da reserva

O cliente poderá consultar:

- número da reserva;
- viatura;
- datas;
- horas;
- localizações;
- extras;
- condutores;
- preço;
- pagamentos;
- estado;
- documentos;
- condições;
- contactos de suporte.

---

# 36. Alteração de reserva

Caso a API permita:

```text
ALTERAR RESERVA
```

Possíveis alterações:

- data;
- hora;
- local;
- extras;
- condutor.

A alteração deverá ser enviada ao WeGest.

---

# 37. Cancelamento

Caso permitido:

```text
CANCELAR RESERVA
```

Antes do cancelamento:

```text
Política aplicável

Valor pago:
150 €

Valor a devolver:
120 €

Taxa:
30 €
```

Os valores deverão respeitar as regras do sistema de gestão.

---

# 38. Faturas

Caso a informação esteja disponível:

```text
Faturas e documentos

FT 2026/1234
159 €

[ DESCARREGAR ]
```

Os dados deverão ser consultados no WeGest quando existentes.

---

# 39. TVDE

## 39.1. Objetivo

Permitir que um motorista encontre uma viatura disponível para trabalhar em TVDE, consulte as condições, selecione levantamento, faça o cadastro, envie documentação, efetue o pagamento solicitado e submeta uma candidatura.

O pagamento **não significa aprovação automática**.

---

# 40. Listagem TVDE

Os cards deverão possuir fotografias.

```text
┌──────────────────────────────┐
│       [FOTO VIATURA]         │
│                              │
│ Toyota Corolla Hybrid        │
│                              │
│ Automático                   │
│ Híbrido                      │
│ 5 lugares                    │
│                              │
│ 275 €/semana                 │
│                              │
│ Caução: 750 €                │
│ Limite: 1.500 km/semana      │
│                              │
│ Disponível                   │
│                              │
│ [ VER VIATURA ]              │
└──────────────────────────────┘
```

---

# 41. Filtros TVDE

Exemplos:

- preço semanal;
- marca;
- modelo;
- híbrido;
- elétrico;
- automático;
- lugares;
- localização;
- disponibilidade;
- limite de quilómetros;
- categoria.

---

# 42. Página da viatura TVDE

A página deverá destacar:

- galeria de fotografias;
- marca;
- modelo;
- preço semanal;
- combustível;
- transmissão;
- lugares;
- autonomia;
- características;
- localização;
- caução;
- sinal necessário;
- limite de quilometragem;
- custo de km adicional;
- período mínimo;
- seguro;
- manutenção;
- assistência;
- viatura de substituição, quando aplicável;
- condições;
- documentação necessária.

---

# 43. Preço TVDE

```text
Toyota Corolla Hybrid

275 €/semana
```

Nunca representar internamente como diária multiplicada por sete.

```typescript
unit = "week"
```

---

# 44. Caução TVDE

```text
Caução:
750 €
```

Modelo:

```typescript
depositAmount
```

---

# 45. Sinal TVDE

Dependendo das regras comerciais:

```text
Caução completa
```

ou:

```text
Sinal da reserva
```

Exemplo:

```text
Caução total:
750 €

Pagamento necessário agora:
250 €

Restante:
500 €
```

---

# 46. Aviso obrigatório TVDE

Antes do pagamento deverá existir aviso semelhante a:

> O pagamento do sinal ou caução não representa aprovação automática da candidatura. A candidatura será analisada pela DÉCADA OUSADA. Caso não seja aprovada, o valor pago será devolvido de acordo com o procedimento aplicável.

O utilizador deverá aceitar esta condição.

---

# 47. Levantamento TVDE

O motorista deverá selecionar:

```text
Data de levantamento
Hora de levantamento
Local de levantamento
```

Os locais deverão vir da API.

Exemplo:

```text
Onde pretende levantar a viatura?

○ Leiria
○ Lisboa
○ Faro
```

---

# 48. Disponibilidade TVDE

Ao selecionar:

```text
Viatura
+
Data
+
Hora
+
Local
```

deverá ser realizada nova consulta de disponibilidade.

---

# 49. Fluxo TVDE

```text
Viaturas
   ↓
Selecionar viatura
   ↓
Consultar condições
   ↓
Escolher data
   ↓
Escolher hora
   ↓
Escolher local
   ↓
Pré-validação de disponibilidade
   ↓
Cadastro do motorista
   ↓
Ficha WeGest
   ↓
Upload de documentos
   ↓
Pagamento de sinal/caução
   ↓
Candidatura enviada ao WeGest
   ↓
Análise operacional no WeGest
   ↓
     ┌─────────────────────┐
     │                     │
     ▼                     ▼
 APROVADA              RECUSADA
     │                     │
     ▼                     ▼
Contrato              Reembolso
     │
     ▼
Levantamento
```

---

# 50. Cadastro TVDE

O motorista fará o cadastro através do site da DÉCADA OUSADA.

Os dados deverão ser enviados através da API para o WeGest.

Fluxo:

```text
MOTORISTA
   ↓
Website DÉCADA
   ↓
Cadastro
   ↓
Backend
   ↓
WeGest API
   ↓
Candidato criado / atualizado
```

O WeGest será responsável pela gestão operacional do candidato.

---

# 51. Ficha de cadastro TVDE

A ficha deverá vir da API.

A aplicação não deverá assumir que os campos serão fixos.

Idealmente a API fornecerá:

```text
Campo
Label
Tipo
Obrigatório
Validação
Opções
Documentos necessários
```

---

# 52. Formulário dinâmico TVDE

Exemplo:

```json
{
  "field": "driver_license",
  "label": "Carta de condução",
  "type": "file",
  "required": true
}
```

Outro:

```json
{
  "field": "birth_date",
  "label": "Data de nascimento",
  "type": "date",
  "required": true
}
```

---

# 53. Dados possíveis do candidato

Exemplos:

- nome completo;
- data de nascimento;
- NIF;
- NISS;
- email;
- telefone;
- morada;
- código postal;
- localidade;
- país;
- número da carta;
- validade;
- certificado TVDE;
- plataforma onde trabalha.

A API determinará os campos definitivos.

---

# 54. WeGest como source of truth TVDE

O WeGest deverá ser considerado a fonte principal dos dados de:

- candidato;
- motorista;
- documentos;
- ficha;
- estado da candidatura;
- contratos;
- dados operacionais;
- histórico;
- reservas ou atribuições.

O website não deverá criar um backoffice paralelo.

---

# 55. Documentos TVDE

Poderão ser solicitados:

- documento de identificação;
- carta de condução;
- certificado TVDE;
- comprovativo de morada;
- comprovativo bancário;
- documentos fiscais;
- outros documentos.

Formatos:

```text
PDF
JPG
JPEG
PNG
```

---

# 56. Upload de documentos

Fluxo preferencial:

```text
Motorista
   ↓
Website
   ↓
Backend
   ↓
WeGest API
   ↓
Documento associado ao candidato
```

Caso a API não suporte upload direto:

```text
Motorista
   ↓
Private Storage
   ↓
Integração / referência
   ↓
WeGest
```

---

# 57. Segurança dos documentos

Nunca deverão:

- ficar públicos;
- ser indexados;
- possuir URLs públicas permanentes;
- aparecer em logs;
- ficar acessíveis sem autenticação.

---

# 58. Estados da candidatura TVDE

O estado principal deverá vir do WeGest.

Normalização possível:

```typescript
type ApplicationStatus =
  | "draft"
  | "payment_pending"
  | "submitted"
  | "under_review"
  | "additional_documents_required"
  | "approved"
  | "rejected"
  | "cancelled";
```

---

# 59. Estado em análise

```text
Candidatura recebida

Estamos a analisar os seus dados e documentação.

Viatura:
Toyota Corolla Hybrid

Levantamento pretendido:
15/10/2026 — 10:00

Local:
Leiria

Estado:
EM ANÁLISE
```

---

# 60. Pedido de documentos adicionais

Caso o WeGest indique falta de documentação:

```text
Precisamos de mais informação.

Documento solicitado:
Comprovativo de morada atualizado.

[ ENVIAR DOCUMENTO ]
```

---

# 61. Aprovação TVDE

A aprovação deverá ocorrer no processo operacional do WeGest.

```text
Candidatura aprovada

Toyota Corolla Hybrid

Levantamento:
15/10/2026
10:00

Leiria

[ VER CONTRATO ]
```

---

# 62. Recusa TVDE

```text
Candidatura não aprovada

A sua candidatura não foi aprovada.

O processo de devolução do valor pago foi iniciado.

Valor:
250 €

Estado do reembolso:
Em processamento
```

---

# 63. Reembolso TVDE

Fluxo:

```text
WEGEST
Application = REJECTED
       ↓
Backend
       ↓
Verifica pagamento
       ↓
Payment Provider
       ↓
Refund
       ↓
Website
```

---

# 64. Estados do reembolso

```typescript
type RefundStatus =
  | "not_required"
  | "pending"
  | "processing"
  | "completed"
  | "failed";
```

---

# 65. Pagamento TVDE

A plataforma de pagamentos ainda será definida.

A UI deverá ser implementada desde o início.

```text
Resumo

Toyota Corolla Hybrid

275 €/semana

Caução:
750 €

Pagamento agora:
250 €

──────────────────────────

[ CONTINUAR PARA PAGAMENTO ]
```

---

# 66. Separação entre pagamento e aprovação

É fundamental:

```text
payment = success
```

não significar:

```text
application = approved
```

Pode existir:

```text
PAYMENT STATUS
paid
```

e:

```text
WEGEST APPLICATION STATUS
under_review
```

simultaneamente.

---

# 67. Reserva temporária TVDE

Durante o processo poderá ser necessário um hold.

```text
Viatura
   ↓
Data / hora / local
   ↓
Temporary Hold
   ↓
Candidatura
```

Deverá ser confirmado com a API:

- se existe hold;
- duração;
- se bloqueia a viatura;
- quando a viatura fica indisponível;
- comportamento após recusa.

---

# 68. Portal TVDE

Rota:

```text
/tvde/minha-conta
```

Dashboard:

```text
Olá, João.

Candidatura atual

Toyota Corolla Hybrid

Estado:
EM ANÁLISE

[ VER CANDIDATURA ]
```

---

# 69. Fonte de dados do portal TVDE

Os dados apresentados deverão vir do WeGest.

Fluxo:

```text
Portal
   ↓
Backend
   ↓
WeGest API
   ↓
Dados atuais
```

---

# 70. Área TVDE

Possíveis secções:

```text
Dashboard
Candidaturas
Documentos
Pagamentos
Reembolsos
Contratos
Perfil
Suporte
```

---

# 71. Atualização de perfil TVDE

Quando o motorista alterar dados:

```text
Portal
   ↓
Backend
   ↓
WeGest
   ↓
Atualização confirmada
   ↓
UI atualizada
```

---

# 72. Modelo de preços

```typescript
type PricingUnit =
  | "day"
  | "week";
```

---

# 73. Pricing

```typescript
interface VehiclePricing {
  unit: "day" | "week";

  amount: number;

  currency: "EUR";

  total?: number;

  deposit?: number;

  reservationAmount?: number;
}
```

---

# 74. Rent a Car Pricing

```json
{
  "unit": "day",
  "amount": 39,
  "total": 117,
  "currency": "EUR"
}
```

---

# 75. TVDE Pricing

```json
{
  "unit": "week",
  "amount": 275,
  "deposit": 750,
  "reservationAmount": 250,
  "currency": "EUR"
}
```

---

# 76. Regra de preços

O frontend não deverá criar regras comerciais paralelas.

Se a API devolver:

```text
Total = 487 €
```

o frontend deverá apresentar:

```text
487 €
```

Não recalcular como fonte oficial.

Aplica-se a:

- épocas;
- promoções;
- descontos;
- extras;
- impostos;
- taxas;
- cauções;
- sinal;
- preço semanal;
- quilometragem;
- tarifas especiais.

---

# 77. Fonte dos dados

O WeGest será a principal fonte operacional.

## Frota

- ID;
- marca;
- modelo;
- matrícula;
- categoria;
- imagens;
- combustível;
- transmissão;
- lugares;
- portas;
- características;
- preço;
- disponibilidade;
- localização;
- tarifas;
- extras;
- caução;
- quilometragem;
- condições.

## Clientes Rent a Car

- cadastro;
- perfil;
- dados fiscais;
- carta;
- reservas;
- histórico;
- documentos;
- faturas;
- informações operacionais.

## TVDE

- cadastro;
- ficha;
- dados pessoais;
- documentos;
- candidatura;
- estado;
- contratos;
- atribuições;
- histórico.

---

# 78. Arquitetura geral

```text
                         UTILIZADOR
                             │
                             ▼
                  WEBSITE DÉCADA OUSADA
                             │
                 ┌───────────┼───────────┐
                 │           │           │
                 ▼           ▼           ▼
              RENT A CAR    TVDE       PORTAIS
                 │           │           │
                 └───────────┼───────────┘
                             │
                             ▼
                    BACKEND DÉCADA
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
           WEGEST       PAYMENT PROVIDER   AUTH
              │
    ┌─────────┼───────────────────────┐
    │         │                       │
    ▼         ▼                       ▼
  Frota    Clientes             Motoristas TVDE
    │         │                       │
    │         ▼                       ▼
    │      Reservas              Candidaturas
    │                                 │
    ▼                                 ▼
Disponibilidade                   Documentos
Preços                            Estados
Locais                            Backoffice
```

---

# 79. Separação de responsabilidades

## WeGest

Responsável por:

- frota;
- clientes Rent a Car;
- candidatos TVDE;
- motoristas TVDE;
- reservas;
- histórico operacional;
- ficha de cadastro;
- documentos, quando suportados;
- disponibilidade;
- preços;
- extras;
- cauções;
- localizações;
- estados;
- backoffice operacional.

## Website DÉCADA OUSADA

Responsável por:

- UI;
- UX;
- autenticação;
- portal;
- pesquisa;
- checkout;
- candidatura;
- apresentação;
- SEO;
- conteúdos;
- marketing;
- analytics;
- integração;
- normalização;
- tratamento de erros.

## Payment Provider

Responsável por:

- pagamentos;
- autorizações;
- preauthorizations;
- reembolsos;
- webhooks financeiros.

---

# 80. Backend obrigatório

O frontend não deverá comunicar diretamente com o WeGest quando existirem:

- API Keys;
- tokens;
- passwords;
- secrets;
- dados privados;
- lógica crítica.

Fluxo:

```text
FRONTEND
    ↓
API DÉCADA
    ↓
WEGEST SERVICE
    ↓
WEGEST API
```

---

# 81. Camada WeGest

```text
/services/wegest

├── client
├── auth
├── vehicles
├── offers
├── categories
├── locations
├── availability
├── pricing
├── extras
├── customers
├── bookings
├── tvde
├── applications
├── documents
├── contracts
├── mappers
└── types
```

---

# 82. Normalização

API externa:

```text
vehicle_name
fuel_type
transmission_type
weekly_rate
```

Modelo interno:

```text
name
fuel
transmission
weeklyPrice
```

O frontend deverá depender apenas do modelo interno.

---

# 83. Modelo Vehicle

```typescript
interface Vehicle {
  id: string;

  brand: string;
  model: string;

  images: VehicleImage[];

  fuel?: string;
  transmission?: string;

  seats?: number;
  doors?: number;

  features?: string[];

  region?: Region;

  locations?: Location[];

  offers: VehicleOffer[];
}
```

---

# 84. Vehicle Offer

```typescript
interface VehicleOffer {
  id: string;

  vehicleId: string;

  type:
    | "rentacar"
    | "tvde";

  pricing: VehiclePricing;

  availability?: Availability;

  deposit?: number;

  mileageLimit?: number;

  terms?: string[];
}
```

---

# 85. Modelo de utilizador local

O website deverá guardar apenas os dados técnicos necessários à autenticação e integração.

```typescript
interface LocalUser {
  id: string;
  authProviderId: string;
  email: string;
  createdAt: Date;
}
```

---

# 86. Ligação com WeGest

```typescript
interface UserIntegration {
  userId: string;

  wegestCustomerId: string;

  customerType:
    | "rentacar"
    | "tvde";

  region?: Region;

  lastSyncAt?: Date;
}
```

---

# 87. Base de dados local

Não deverá duplicar integralmente clientes ou candidatos.

Possíveis tabelas locais:

```text
users
user_integrations
sessions
preferences
marketing_consents

payment_transactions
refunds

favorites

content_pages
analytics_events
integration_logs
notifications
```

Evitar como fonte principal:

```text
customer_profiles
tvde_applications
tvde_documents
```

quando os mesmos dados já forem geridos pelo WeGest.

---

# 88. Localizações

```typescript
interface Location {
  id: string;

  name: string;

  region: Region;

  address?: string;

  latitude?: number;
  longitude?: number;

  pickupAvailable: boolean;
  returnAvailable: boolean;
}
```

As localizações deverão preferencialmente vir da API.

---

# 89. Disponibilidade

Nunca assumir que a viatura continua disponível no checkout.

```text
Pesquisa
   ↓
API
   ↓
Disponível
   ↓
Cliente seleciona
   ↓
Checkout
   ↓
NOVA VERIFICAÇÃO
   ↓
Reserva
```

---

# 90. Cache

Dados relativamente estáticos:

```text
Marca
Modelo
Fotografias
Características
Categoria
```

podem utilizar cache maior.

Dados críticos:

```text
Preço
Disponibilidade
Caução
Reserva
Estado da candidatura
Dados do cliente
```

devem usar cache muito curto ou consulta atualizada.

---

# 91. Sincronização dos dados do cliente

Regra principal:

```text
WEGEST = SOURCE OF TRUTH
```

Quando necessário:

```text
WeGest
   ↓
Backend
   ↓
Cache temporário
   ↓
Frontend
```

Nunca transformar cache em fonte oficial.

---

# 92. Falhas da API

Nunca apresentar:

```text
RESERVA CONFIRMADA
```

caso o WeGest não tenha confirmado.

Mensagem:

```text
Não foi possível concluir a sua reserva.

[ TENTAR NOVAMENTE ]

[ CONTACTAR-NOS ]
```

---

# 93. Timeout

Nenhuma operação deverá permanecer indefinidamente em:

```text
Loading...
```

Estados:

```typescript
type RequestState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error"
  | "timeout";
```

---

# 94. Retry

Nunca:

```text
retry infinito
```

Preferir:

```text
Request
   ↓
Erro temporário
   ↓
Retry
   ↓
Erro
   ↓
Mensagem
```

---

# 95. Webhooks

Caso existam:

```text
vehicle.created
vehicle.updated
vehicle.status_changed

availability.changed

customer.created
customer.updated

booking.created
booking.updated
booking.cancelled

application.created
application.updated

document.requested

contract.created

payment.updated
```

Os nomes reais dependerão da API.

---

# 96. Autenticação

A arquitetura deverá prever:

- registo;
- login;
- logout;
- recuperação de password;
- confirmação de email;
- sessões;
- alteração de password.

Autenticação não substitui o cadastro operacional no WeGest.

---

# 97. Segurança

Nunca expor:

```text
WEGEST_API_KEY
WEGEST_SECRET
WEGEST_TOKEN
PAYMENT_SECRET
DATABASE_PASSWORD
```

no frontend.

Nunca utilizar:

```env
NEXT_PUBLIC_WEGEST_SECRET=
```

---

# 98. Variáveis de ambiente

```env
WEGEST_API_URL=
WEGEST_API_KEY=
WEGEST_API_SECRET=
WEGEST_TIMEOUT=

DATABASE_URL=

PAYMENT_PROVIDER=
PAYMENT_PUBLIC_KEY=
PAYMENT_SECRET_KEY=

STORAGE_URL=
STORAGE_SECRET=

APP_URL=
AZORES_APP_URL=
```

---

# 99. Storage

O storage local deverá ser utilizado apenas quando necessário.

Exemplos:

- conteúdos;
- ficheiros técnicos;
- documentos que ainda não possam ser enviados diretamente ao WeGest;
- imagens próprias.

Documentos privados deverão utilizar buckets privados.

---

# 100. Plataforma de pagamentos

A escolha será realizada posteriormente.

A arquitetura deverá permitir trocar fornecedor.

```typescript
interface PaymentGateway {
  createPayment(): Promise<Payment>;
  getPayment(): Promise<Payment>;
  refundPayment(): Promise<Refund>;
}
```

---

# 101. Emails

Rent a Car:

```text
Cadastro recebido
Reserva recebida
Pagamento confirmado
Reserva confirmada
Alteração
Cancelamento
Reembolso
Lembrete de levantamento
```

TVDE:

```text
Cadastro recebido
Candidatura recebida
Pagamento recebido
Candidatura em análise
Documentação adicional necessária
Candidatura aprovada
Candidatura recusada
Reembolso iniciado
Reembolso concluído
Lembrete de levantamento
```

---

# 102. SMS / WhatsApp

Arquitetura preparada para:

```text
SMS
WhatsApp
```

Exemplo:

```text
Reserva confirmada.

A sua viatura estará disponível amanhã às 10:00.
```

---

# 103. Backoffice

O backoffice operacional de clientes, reservas, candidatos e motoristas deverá ser prioritariamente o **WeGest**.

O projeto DÉCADA poderá possuir um backoffice próprio apenas para áreas que não são responsabilidade do WeGest.

Exemplos:

```text
Dashboard técnico
Pagamentos
Reembolsos
Conteúdo
SEO
Analytics
Integração WeGest
Logs
Configurações
```

Evitar duplicar:

```text
Clientes
Reservas
Candidatos
Motoristas
```

como sistemas independentes se já forem geridos pelo WeGest.

---

# 104. Dashboard operacional

Exemplo:

```text
Hoje

Rent a Car
34 reservas

TVDE
12 candidaturas

Pagamentos pendentes
4

Reembolsos pendentes
2

WeGest API
● Online
```

Os números podem ser consultados no WeGest quando possível.

---

# 105. Estado da integração

```text
WEGEST API

● Online

Última comunicação:
07/10/2026 09:54

Tempo médio:
312ms
```

Erro:

```text
● Atenção

Último erro:
07/10/2026 09:56
```

---

# 106. Analytics

Rent a Car:

```text
rentacar_search
rentacar_results
rentacar_vehicle_view
rentacar_extra_added
rentacar_checkout_started
rentacar_customer_created
rentacar_payment_started
rentacar_payment_completed
rentacar_booking_completed
```

TVDE:

```text
tvde_vehicle_view
tvde_pickup_selected
tvde_registration_started
tvde_application_started
tvde_document_uploaded
tvde_payment_started
tvde_payment_completed
tvde_application_submitted
tvde_application_approved
tvde_application_rejected
```

---

# 107. Funil Rent a Car

```text
VISITANTE
   ↓
Pesquisa
   ↓
Resultados
   ↓
Viatura
   ↓
Extras
   ↓
Cadastro
   ↓
Checkout
   ↓
Pagamento
   ↓
Reserva
```

Métricas:

- pesquisas;
- resultados vazios;
- visualizações;
- filtros;
- extras;
- cadastros;
- checkout iniciado;
- abandono;
- pagamento;
- reservas;
- ticket médio.

---

# 108. Funil TVDE

```text
VISITANTE
   ↓
Viaturas
   ↓
Viatura
   ↓
Levantamento
   ↓
Cadastro
   ↓
Candidatura
   ↓
Documentos
   ↓
Pagamento
   ↓
Análise WeGest
   ↓
Aprovação
```

---

# 109. SEO regional

Continente:

```text
decadaousada.pt/rent-a-car
decadaousada.pt/tvde
```

Açores:

```text
acores.decadaousada.pt/rent-a-car
acores.decadaousada.pt/tvde
```

Possíveis páginas:

```text
/rent-a-car/leiria
/rent-a-car/lisboa
/rent-a-car/faro

/tvde/leiria
/tvde/lisboa
```

Açores:

```text
/rent-a-car/ponta-delgada
/tvde/ponta-delgada
```

---

# 110. Estratégia de domínio recomendada

Estrutura recomendada:

```text
decadaousada.pt
```

para Continente.

```text
acores.decadaousada.pt
```

para Açores.

Ambas deverão partilhar:

- código;
- componentes;
- design system;
- backend;
- autenticação;
- integração;
- infraestrutura.

---

# 111. Design System

Componentes reutilizáveis:

```text
VehicleCard
VehicleGallery
PriceDisplay
LocationSelector
DatePicker
TimePicker
ExtraSelector
BookingSummary
PaymentForm
CustomerForm
DynamicWeGestForm
DocumentUploader
ApplicationStatus
ReservationStatus
CustomerProfile
```

---

# 112. Mobile First

Rent a Car:

```text
Pesquisa
→ Viatura
→ Extras
→ Cadastro
→ Pagamento
→ Reserva
```

TVDE:

```text
Viatura
→ Levantamento
→ Cadastro
→ Documentos
→ Pagamento
→ Candidatura
```

---

# 113. Acessibilidade

Considerar:

- contraste;
- teclado;
- labels;
- mensagens acessíveis;
- focus states;
- textos alternativos;
- botões adequados para mobile.

---

# 114. Performance

Requisitos:

- otimização de imagens;
- lazy loading;
- CDN;
- caching;
- SSR/ISR quando adequado;
- minimizar JavaScript;
- skeleton loading;
- queries eficientes;
- evitar chamadas desnecessárias ao WeGest.

---

# 115. Observabilidade

Monitorizar:

```text
API availability
API response time
timeouts
customer sync failures
booking failures
payment failures
refund failures
document upload failures
application failures
```

---

# 116. Logs

Guardar:

```text
timestamp
request_id
endpoint
method
status
response_time
error_code
wegest_request_id
```

Nunca guardar:

- passwords;
- API keys;
- tokens;
- números completos de cartão;
- CVV;
- documentos privados;
- informação sensível desnecessária.

---

# 117. Rotas principais

## Institucional

```text
/
```

```text
/contactos
```

```text
/perguntas-frequentes
```

## Rent a Car

```text
/rent-a-car
```

```text
/rent-a-car/viaturas
```

```text
/rent-a-car/viatura/[slug]
```

```text
/rent-a-car/reserva
```

```text
/rent-a-car/confirmacao
```

## TVDE

```text
/tvde
```

```text
/tvde/viaturas
```

```text
/tvde/viatura/[slug]
```

```text
/tvde/candidatura
```

```text
/tvde/candidatura/documentos
```

```text
/tvde/candidatura/pagamento
```

```text
/tvde/candidatura/confirmacao
```

## Portal

```text
/minha-conta
```

```text
/minha-conta/reservas
```

```text
/minha-conta/perfil
```

```text
/minha-conta/documentos
```

```text
/minha-conta/faturas
```

---

# 118. API interna

## Vehicles

```text
GET /api/vehicles
GET /api/vehicles/:id
```

## Locations

```text
GET /api/locations
```

## Customers

```text
POST /api/customers
GET /api/customers/me
PATCH /api/customers/me
```

Estes endpoints deverão atuar como proxy/adaptador para o WeGest.

## Rent a Car

```text
GET /api/rentacar/availability
GET /api/rentacar/pricing
GET /api/rentacar/extras

POST /api/rentacar/bookings
GET /api/rentacar/bookings/:id
POST /api/rentacar/bookings/:id/cancel
```

## TVDE

```text
GET /api/tvde/vehicles
GET /api/tvde/availability
GET /api/tvde/application-form

POST /api/tvde/customers
GET /api/tvde/customer/me

POST /api/tvde/applications
POST /api/tvde/applications/:id/documents
GET /api/tvde/applications/:id
```

## Payments

```text
POST /api/payments
GET /api/payments/:id
POST /api/payments/:id/refund
```

Os endpoints são conceptuais.

---

# 119. MVP Rent a Car

- [ ] Homepage;
- [ ] seleção regional;
- [ ] pesquisa;
- [ ] localizações;
- [ ] datas;
- [ ] horários;
- [ ] disponibilidade;
- [ ] categorias;
- [ ] Passageiros;
- [ ] Comerciais;
- [ ] filtros;
- [ ] fotografias;
- [ ] página da viatura;
- [ ] preço diário;
- [ ] preço total;
- [ ] extras;
- [ ] resumo;
- [ ] cadastro de cliente;
- [ ] criação do cliente no WeGest;
- [ ] vínculo com `wegestCustomerId`;
- [ ] UI de pagamento;
- [ ] integração de pagamento futura;
- [ ] criação da reserva no WeGest;
- [ ] confirmação;
- [ ] login;
- [ ] portal do cliente;
- [ ] dados provenientes do WeGest;
- [ ] histórico;
- [ ] detalhe da reserva;
- [ ] atualização de perfil via API;
- [ ] emails;
- [ ] mobile.

---

# 120. MVP TVDE

- [ ] Landing TVDE;
- [ ] listagem;
- [ ] fotografias;
- [ ] filtros;
- [ ] página da viatura;
- [ ] preço semanal;
- [ ] caução;
- [ ] sinal;
- [ ] limite km;
- [ ] custo de km adicional;
- [ ] condições;
- [ ] data de levantamento;
- [ ] hora;
- [ ] localização pela API;
- [ ] validação de disponibilidade;
- [ ] cadastro do motorista;
- [ ] criação do motorista no WeGest;
- [ ] vínculo com `wegestCustomerId`;
- [ ] ficha de cadastro proveniente da API;
- [ ] formulário dinâmico;
- [ ] upload de documentos;
- [ ] envio de documentos ao WeGest;
- [ ] storage privado apenas quando necessário;
- [ ] UI de pagamento;
- [ ] pagamento de sinal/caução;
- [ ] aviso de aprovação condicionada;
- [ ] submissão da candidatura ao WeGest;
- [ ] estado vindo do WeGest;
- [ ] aprovação;
- [ ] rejeição;
- [ ] reembolso;
- [ ] portal TVDE;
- [ ] dados provenientes do WeGest;
- [ ] emails;
- [ ] mobile.

---

# 121. Funcionalidades futuras

## Rent a Car

- códigos promocionais;
- fidelização;
- carteira de créditos;
- reservas recorrentes;
- favoritos;
- pagamento guardado;
- check-in online;
- assinatura de contratos;
- upgrade;
- upselling;
- recuperação de checkout.

## TVDE

- assinatura digital;
- contrato online;
- OCR;
- validação automática de documentos;
- scoring;
- área financeira;
- pagamentos semanais;
- gestão de quilometragem;
- renovação;
- troca de viatura;
- assistência;
- sinistros.

---

# 122. Perguntas para a API WeGest

## Geral

- [ ] Existe API REST?
- [ ] Existe Swagger/OpenAPI?
- [ ] Existe Sandbox?
- [ ] Como funciona autenticação?
- [ ] Existem rate limits?
- [ ] Existem webhooks?
- [ ] Existem ambientes separados?

## Frota

- [ ] Como consultar viaturas?
- [ ] Como consultar categorias?
- [ ] Existem fotografias?
- [ ] Existem várias fotografias?
- [ ] Existe distinção Rent a Car/TVDE?
- [ ] Uma viatura pode ter várias ofertas?
- [ ] Como consultar estado?

## Localizações

- [ ] Como consultar localizações?
- [ ] Existe região?
- [ ] Existe horário?
- [ ] Existe disponibilidade por localização?
- [ ] Pode levantar num local e devolver noutro?

## Disponibilidade

- [ ] Como consultar disponibilidade?
- [ ] É por viatura?
- [ ] É por categoria?
- [ ] Existe hold?
- [ ] Quanto tempo dura?

## Clientes Rent a Car

- [ ] Como criar cliente?
- [ ] Como atualizar cliente?
- [ ] Como consultar cliente?
- [ ] Qual ID é devolvido?
- [ ] Existe histórico?
- [ ] Existe relação cliente/reservas?
- [ ] Existem documentos?
- [ ] Existem faturas?
- [ ] É possível editar dados via API?
- [ ] Existem campos obrigatórios?

## Rent a Car

- [ ] Como consultar preços?
- [ ] Como consultar extras?
- [ ] Como criar reserva?
- [ ] Como alterar?
- [ ] Como cancelar?
- [ ] Como consultar reserva?
- [ ] Existem impostos?
- [ ] Taxas?
- [ ] Caução?
- [ ] Códigos promocionais?
- [ ] Política combustível?
- [ ] Franquia?
- [ ] Limite km?

## TVDE

- [ ] Como criar candidato?
- [ ] Como atualizar candidato?
- [ ] Como consultar candidato?
- [ ] A ficha vem pela API?
- [ ] A API informa campos obrigatórios?
- [ ] A API informa documentos?
- [ ] É possível enviar documentos?
- [ ] Existem preços semanais?
- [ ] Existe caução?
- [ ] Existe sinal?
- [ ] Existe limite km?
- [ ] Existe custo km adicional?
- [ ] Existe período mínimo?
- [ ] Como funciona candidatura?
- [ ] Existe endpoint de aprovação?
- [ ] Existe endpoint de recusa?
- [ ] Existe reserva temporária?
- [ ] Quando a viatura fica bloqueada?
- [ ] O que acontece após recusa?
- [ ] O portal consegue consultar estado?
- [ ] Existem contratos disponíveis via API?

---

# 123. Perguntas sobre pagamentos

- [ ] fornecedor;
- [ ] cartões;
- [ ] MB WAY;
- [ ] Multibanco;
- [ ] Apple Pay;
- [ ] Google Pay;
- [ ] preauthorization;
- [ ] caução;
- [ ] pagamentos parciais;
- [ ] reembolsos;
- [ ] reembolsos parciais;
- [ ] webhooks;
- [ ] conciliação.

---

# 124. Decisões pendentes

```text
Payment Provider
Email Provider
SMS Provider
Storage Provider
Authentication Provider
```

A UI e a arquitetura deverão permanecer desacopladas.

---

# 125. Stack

Exemplo:

```text
Frontend
Next.js

Backend
Next.js / Node.js

Database
PostgreSQL / Supabase

Fleet / Customers / BO
WeGest

Payments
TBD

Storage
TBD

Email
TBD

SMS
TBD

Analytics
TBD

Monitoring
TBD
```

---

# 126. Estrutura de projeto sugerida

```text
src/
│
├── app/
│   ├── rent-a-car/
│   ├── tvde/
│   ├── minha-conta/
│   └── api/
│
├── components/
│   ├── shared/
│   ├── vehicles/
│   ├── rentacar/
│   ├── tvde/
│   ├── booking/
│   ├── payment/
│   └── account/
│
├── domain/
│   ├── vehicle/
│   ├── offer/
│   ├── availability/
│   ├── pricing/
│   ├── customer/
│   ├── booking/
│   ├── application/
│   ├── payment/
│   └── refund/
│
├── services/
│   ├── wegest/
│   ├── payments/
│   ├── email/
│   ├── storage/
│   └── notifications/
│
├── lib/
├── types/
└── utils/
```

---

# 127. Regras finais de arquitetura

## Não duplicar frota

```text
WEGEST
↓
Frota
```

é a referência operacional.

## Não duplicar clientes

```text
WEGEST
↓
Clientes Rent a Car
↓
Motoristas TVDE
```

também são referências operacionais.

## Não duplicar regras comerciais

Preço, disponibilidade, caução, tarifas, estados e regras não deverão ser recriados no frontend quando já existirem no sistema de gestão.

## Não criar segundo backoffice

O site da DÉCADA OUSADA não deverá substituir o WeGest como backoffice operacional.

## Não misturar produtos

Rent a Car e TVDE compartilham infraestrutura, mas possuem:

```text
UX diferente
Funil diferente
Preço diferente
Checkout diferente
Regras diferentes
Objetivo diferente
```

---

# 128. Visão final

```text
                         DÉCADA OUSADA
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
             CONTINENTE                    AÇORES
        decadaousada.pt          acores.decadaousada.pt
                 │                           │
                 └─────────────┬─────────────┘
                               │
                               ▼
                    PLATAFORMA DÉCADA
                               │
               ┌───────────────┴───────────────┐
               │                               │
               ▼                               ▼
          RENT A CAR                          TVDE
               │                               │
          Reserva/dia                  Candidatura/semana
               │                               │
          Extras                            Caução
               │                               │
          Pagamento                         Sinal
               │                               │
          Cadastro                         Cadastro
               │                               │
               └──────────────┬────────────────┘
                              │
                              ▼
                           WEGEST
                              │
                ┌─────────────┼──────────────┐
                │             │              │
                ▼             ▼              ▼
              Frota        Clientes       Motoristas
                │             │              │
                ▼             ▼              ▼
         Disponibilidade   Reservas      Candidaturas
                                             │
                                             ▼
                                         Documentos
                                             │
                                             ▼
                                          Estados
```

A arquitetura final deverá seguir um princípio simples:

> **O website da DÉCADA OUSADA é a experiência digital. O WeGest é o sistema operacional do negócio.**

O website deverá oferecer ao utilizador uma experiência moderna, rápida e simples, enquanto o WeGest permanece responsável pela gestão operacional da frota, dos clientes Rent a Car, dos motoristas TVDE, das reservas, das candidaturas e dos respetivos dados.

Esta separação permite criar uma experiência digital muito superior sem duplicar o backoffice ou criar inconsistências entre sistemas.
