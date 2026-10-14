# Pesquisa: rent-a-car nos Açores (concorrência)

Pedido do marketing (Thiago Sousa): ver os sites de rent-a-car dos Açores, listar
preços e forma de trabalhar, e procurar na concorrência cada viatura que a API do
WeGest devolve para os Açores. Ponto de partida do pedido: "nos Açores não cobram
caução e não alugam comerciais". Consulta feita a 2026-10-14, nos sites de cada
empresa.

Isto é contexto de mercado. Não são regras nem preços da DÉCADA OUSADA e nada
daqui vai para o site sem confirmação do cliente.

**Simulações** (iguais em todas as empresas, condutor com mais de 25 anos, sem
extras):

- **Base:** aeroporto de Ponta Delgada, 09/11/2026 10:00 a 16/11/2026 10:00
  (7 dias, época baixa).
- **Época alta:** mesmo local, 09/08/2027 a 16/08/2027.
- **Outras ilhas:** aeroportos das Lajes (Terceira), Pico e Horta (Faial), mesmas
  datas de novembro.

Os preços mudam com a data e a procura.

**Validação.** Todos os preços das secções 2 a 5 foram simulados de novo no mesmo
dia, num navegador, empresa a empresa, e conferem com o que está escrito (as
correções feitas nesta segunda passagem estão assinaladas com "corrigido"). Na
Ilha Verde e na Way2Azores o total foi confirmado no passo seguinte da reserva,
sem dados pessoais e sem concluir nada. Na Way2Azores o passo 3 só abre com os
cookies do site aceites; na primeira passagem foram recusados, por isso o total
da Terceira só foi confirmado na segunda. Ficaram por validar: a tabela de cauções
da Autatlantis (está numa imagem) e os preços de agosto da Way2Azores.

---

## 1. Resumo para o marketing

| Afirmação | O que os sites mostram |
|---|---|
| "Não cobram caução" | **Em parte.** O modelo dominante é: tarifa base com caução ou franquia alta (700 € a 2 800 € nos carros pequenos) e um pacote de seguro total que baixa a caução para 0 € a 300 € e, em algumas, dispensa o cartão de crédito. A Way2Azores usa isto como mensagem principal: "Sem franquia, sem cartão de crédito, só caução de combustível" (no resumo da reserva aparece "Caução 120,00"). Só a IslandRent não pede caução nenhuma, mas a tarifa base dela só tem seguro contra terceiros. |
| "Não alugam comerciais" | **Não se confirma nas maiores.** Autatlantis (Opel Combo, Renault Trafic; em agosto também Toyota Hilux), Ilha Verde (Renault Kangoo, Ford Transit Cargo, Ford Ranger) e Way2Azores (Citroën Berlingo Van em São Miguel, Opel Combo na Terceira) têm comerciais na pesquisa online. Micauto/Angrauto e IslandRent só mostram ligeiros de passageiros. |

Outros padrões que se repetem:

- **Preço anunciado ≠ preço final.** Na Ilha Verde o preço da lista já inclui a
  taxa de aeroporto, mas nos ligeiros o total soma depois o pack Essential
  (CDW + roubo) de 139,99 €: o Twingo passa de 229,90 € para 369,90 €.
- **Seguro vendido em pacotes de 2 ou 3 níveis** (básico / médio / total), com a
  caução a descer em cada nível.
- **Época alta muito mais cara:** em agosto o mesmo carro custa 2 a 5,5 vezes o
  preço de novembro (ver secção 3).
- **Idade mínima 18 a 21 anos**, com 1 ou 2 anos de carta, e taxa de condutor
  jovem.
- **Pagamento antecipado** online (MB Way, Multibanco, cartão). A caução fica no
  cartão de crédito; Micauto e Ilha Verde aceitam também débito.
- **Entrega no aeroporto** muitas vezes por transfer até um parque ou loja, não
  balcão no terminal (IslandRent, Way2Azores).
- **Frota da DÉCADA OUSADA vs. concorrência:** ver secção 6. Conclusão
  provisória: até os alertas da secção 7 estarem resolvidos (IVA a 23% e seguro
  incluído desconhecido), estes números não servem para decidir preços.

---

## 2. Preço do carro mais barato (7 dias, Ponta Delgada, novembro)

| Empresa | Carro | Tarifa base | Caução / franquia na base | Com seguro total | Caução com seguro total |
|---|---|---|---|---|---|
| Way2Azores | Fiat Panda | 51,50 € | Franquia 2 000 €, cartão de crédito obrigatório | 121,50 € (total final confirmado no passo 3) | Sem franquia, sem cartão; o resumo mostra "Caução 120,00" |
| Micauto | Económico (grupo B) | 73,50 € | Caução 1 650 € (franquia 1 500 € + 150 €) | 318,50 € (Zero Excess, +35 €/dia) | 150 € |
| Autatlantis | VW Up! | 75,95 € | Caução 700 € (franquia 700 €) | 208,95 € (Super Relax, +19 €/dia) ou 320,95 € (Total Relax, +35 €/dia) | 100 € |
| IslandRent | Seat Ibiza | 86,35 € | Sem caução; a base só tem seguro contra terceiros | 243,85 € (SCDW, +22,50 €/dia) | Sem caução |
| Ilha Verde | Renault Twingo | 369,90 € (lista mostra 229,90 €) | Caução 200 € + franquia 1 200 € (valores dos grupos A/B; o site não indica o grupo) | 582,70 € (pacote Premium, +30,40 €/dia) | Não indicado no site |

Valores com IVA (16% nos Açores), tal como mostrados em cada site.

**Ilha Verde, decomposição do total (corrigido):** aluguer 206,50 € + taxa de
aeroporto 23,40 € = 229,90 € (o valor da lista); o total soma o pack Essential
(139,99 €), que vem selecionado e é o nível mais baixo. O mesmo acréscimo de
139,99 € aparece no Clio (250,90 € → 390,90 €), no Qashqai (352,40 € → 492,40 €)
e no Mercedes C 300 de (1 121,06 € → 1 261,06 €). Na Renault Kangoo (comercial)
o total é igual à lista, 561,07 €. Nos restantes modelos da Ilha Verde, os
valores desta pesquisa são os da lista.

---

## 3. Época alta: agosto de 2027 (7 dias, Ponta Delgada)

| Empresa | Carro | Agosto | Novembro | Diferença |
|---|---|---|---|---|
| Autatlantis | VW Up! | 420,07 € | 75,95 € | 5,5× |
| Way2Azores | Fiat Panda, básico | 230,00 € | 51,50 € | 4,5× |
| Way2Azores | Fiat Panda, pacote total | 347,25 € | 121,50 € | 2,9× |
| IslandRent | Seat Ibiza | 363,32 € | 86,35 € | 4,2× |
| Ilha Verde | Renault Twingo (lista) | 481,08 € | 229,90 € | 2,1× |
| Micauto | sem preço | "stop sale" para essas datas | 73,50 € | n/d |

Na IslandRent o carro mais barato de agosto é o Kia Picanto manual, 346,50 €,
que não aparece em novembro (corrigido; a linha acima compara o mesmo carro).
Os valores de agosto da Way2Azores não foram simulados de novo.

Em agosto a Ilha Verde deixa de mostrar comerciais em São Miguel e a
Autatlantis passa a mostrar pick-ups Toyota Hilux (840 €).

---

## 4. Outras ilhas (novembro, 7 dias, aeroporto)

### Terceira (Lajes)

| Empresa | Carro mais barato | 7 dias | Comerciais |
|---|---|---|---|
| Micauto / Angrauto | Mini (grupo A) ou Económico (grupo B) | 73,50 € | não |
| Way2Azores | Fiat Panda, pacote total | 84,00 € (básico: 140,00 €) | Opel Combo Edition, 175,00 € (227,50 € com pacote total) |
| Autatlantis | Fiat Panda | 93,24 € | não aparecem |
| Ilha Verde | Renault Twingo (lista) | 170,90 € | Renault Kangoo, 561,07 € |

Na Terceira a Way2Azores vende o pacote total abaixo do básico em vários carros
(Panda, Fiat 500, Citroën C3 e Opel Corsa, todos entre 84,00 € e 85,54 €). O
passo 3 da reserva confirma o Panda a 84,00 € no total, com tarifa base de 14 €,
sem franquia e com a caução de 120 €. Pode ser um erro de tarifa da Way2Azores,
mas é o que o site cobra (antes estava como "por verificar").

### Pico e Faial (novo)

| Empresa | Ilha | Carro mais barato | 7 dias | Comerciais |
|---|---|---|---|---|
| Micauto | Pico | Mini (grupo A) ou Económico (grupo B) | 73,50 € | não |
| Autatlantis | Pico | Fiat Panda | 93,24 € | Opel Combo, 455 € |
| Autatlantis | Faial | Fiat Panda | 93,24 € | não aparecem |

Na Autatlantis o preço é quase igual entre ilhas: Panda 93,24 €, Duster
218,75 € e Jogger 306,25 € em Terceira, Pico e Faial.

---

## 5. Fichas por empresa

### Autatlantis

- **Onde:** 9 ilhas (aeroportos, portos e centros). Sede em Ponta Delgada.
- **Frota e preços (7 dias, tarifa base, Ponta Delgada):** VW Up! 75,95 €; Fiat
  Panda 81,48 €; Toyota Yaris 87,15 €; Citroën C3 Aircross 90,72 €; Toyota Aygo
  automático 112 €; Opel Corsa automático 121,31 €; Fiat 500 124,95 €; Opel
  Crossland automático 192,50 €; Dacia Duster, Opel Astra e Mini Cooper 218,75 €;
  Toyota Corolla automático 231 €; Opel Astra SW 262,50 €; BMW Série 1 automático
  301 €; Dacia Jogger 7 lugares 306,25 €; Toyota Auris Hybrid 315 €; Toyota
  Proace 9 lugares 350 €; Citroën Jumpy 9 lugares 437,50 €; Peugeot 5008 656,25 €;
  Mercedes C200 787,50 €; Mercedes GLC 966 €.
- **Comerciais:** Opel Combo, 2 lugares, 455 €; Renault Trafic, 3 lugares, 770 €.
  Em agosto: Toyota Hilux cabine simples e dupla, 840 €.
- **Incluído na base:** CDW, proteção contra roubo, km ilimitados, taxa de
  aeroporto. Cancelamento gratuito até 48 h custa mais 15,19 € (paga 20% à cabeça).
- **Pacotes de seguro** (por dia, grupos mais baratos):

  | Pacote | Preço | Caução | Franquia |
  |---|---|---|---|
  | Relax (CDW + TP) | incluído | 700 € a 1 800 € | 700 € a 1 800 € |
  | Super Relax (+ SCDW, vidros, pneus) | 19 € a 36 € | 100 € a 200 € | 100 € a 200 € |
  | Total Relax (+ assistência, PAI) | 35 € a 49 € | depósito 100 € | 0 € |

- **Regras:** 21 a 85 anos, 1 ano de carta; condutor 21 a 23 anos paga 20 €/dia;
  condutor adicional 4,90 €/dia; pré-autorização em Visa, Mastercard, Amex ou
  Revolut (não aceita Maestro); fora de horas 40 €.
- **Fontes:** [pesquisa no site](https://book.autatlantis.com/search/?zone=2&pickup_datetime=2026-11-09T10%3A00&pickup_station=SMGAPT&dropoff_datetime=2026-11-16T10%3A00&dropoff_station=SMGAPT),
  [condições gerais](https://www.autatlantis.com/condicoes-gerais) (tabela de cauções em imagem na mesma página).

### Ilha Verde

- **Onde:** 8 ilhas, balcões nos aeroportos principais. A maior rent-a-car do
  arquipélago, segundo guias de viagem.
- **Frota e preços (7 dias, valor da lista):** Renault Twingo 229,90 €; Hyundai
  i10 240,05 €; Renault Clio 250,90 €; Hyundai Kauai 264,90 €; Ford Focus
  285,90 €; Nissan Leaf 332,10 €; Nissan Qashqai 352,40 €; Mini Cooper 393 €;
  Dacia Jogger 7 lugares 451,95 €; Volvo XC40 481,20 €; Dacia Duster 504,09 €;
  Renault Trafic 9 lugares 518,37 €; Mazda CX-60 577,34 €; Nissan Ariya 605,04 €;
  Mercedes C 300 de 1 121,06 €; Mercedes E 300 de 1 351,57 €.
  **Atenção:** nos ligeiros o total soma o pack Essential de 139,99 € (ver
  secção 2).
- **Comerciais:** Renault Kangoo 561,07 € (total confirmado); Ford Transit Cargo
  634,11 € e 759,39 €; Ford Ranger 844,87 € (valores da lista). As FAQ dizem
  "comerciais em locais selecionados, sujeito a disponibilidade".
- **Pacotes de seguro:** Essential (CDW + TP, 139,99 € por 7 dias nos ligeiros
  verificados), Comfort (+19,80 €/dia, franquia parcial e vidros/pneus), Premium
  (+30,40 €/dia, franquia reduzida ou eliminada).
- **Caução** (tabela de 1 set. 2026): 200 € (grupos A/B) a 800 €, à parte da
  franquia. **Franquia CDW/TP:** 1 200 € a 7 500 €.
- **Regras:** 18 anos, 1 ano de carta; condutor até 21 anos 3 €/dia (máx. 30 €);
  condutor adicional 29,50 €; cartão de crédito ou débito; cancelamento gratuito
  até 48 h; entrega em hotel 30 € por trajeto; fora de horas 35 € na primeira hora.
- **Fontes:** [pesquisa no site](https://www.ilhaverde.com/pt-pt/reservar/?booking_step=search&region=sao-miguel&pickup_location=PDL&dropoff_location=PDL&pickup_date=09%2F11%2F2026&dropoff_date=16%2F11%2F2026&pickup_time=10%3A00&dropoff_time=10%3A00&driver_age=21-80),
  [tarifário de extras (PDF)](https://www.ilhaverde.com/wp-content/uploads/2026/09/preco_pt.pdf).

### Way2Azores

- **Onde:** São Miguel (aeroporto por transfer até ao Parque 5, hotéis), Terceira
  (aeroporto das Lajes, Angra, Praia da Vitória) e Madeira.
- **Mensagem principal no site:** "Sem franquia, sem cartão de crédito, só caução
  de combustível".
- **Como funciona:** cada carro tem dois preços lado a lado (São Miguel).

  | Carro | Pacote básico | Franquia | Pacote total (franquia 0, sem cartão) |
  |---|---|---|---|
  | Fiat Panda | 51,50 € | 2 000 € | 121,50 € |
  | Fiat 500 | 55,00 € | 2 000 € | 125,00 € |
  | Citroën PureTech | 69,00 € | 2 000 € | 139,00 € |
  | VW Polo / Seat Ibiza | 90,00 € | 2 000 € | 160,00 € |
  | Opel Crossland | 62,00 € | 2 750 € | 167,00 € |
  | Seat Arona | 72,50 € | 2 750 € | 177,50 € |
  | Citroën C3 Hybrid automático | 100,50 € | 2 500 € | 170,50 € |
  | Dacia Jogger 7 lugares | 172,60 € | 2 750 € | 312,60 € |
  | Seat Tiguan Allspace 7 lugares | 272,00 € | 3 250 € | 447,00 € |
  | Opel Vivaro 9 lugares | 279,00 € | 3 000 € | 454,00 € |
  | Citroën Berlingo Van XL (comercial) | 90,00 € | 2 500 € | 160,00 € |

  O pacote total aparece com "20% de desconto". Um Mercedes C220d aparece a
  3 520 € por 7 dias, o que parece erro no site.
- **Regras:** 18 anos; condutor 18 a 23 anos pode pagar suplemento; carta com
  mais de 1 ano; no pacote básico o cartão de crédito em nome do condutor é
  obrigatório.
- **Fontes:** [site](https://www.way2azores-rent.pt/pt), [perguntas e respostas](https://www.way2azores-rent.pt/pt/faqs).
- **Comunidade:** queixas antigas (2020 a 2024) sobre pressão para comprar o
  seguro ao balcão e cauções de cerca de 2 000 € ([Portal da Queixa](https://portaldaqueixa.com/brands/way2azores/complaints/way2azores-seguranca-zero-satisfacao-zero-nao-recomendo-a-empresa-36130420)).

### Micauto (São Miguel e Pico) e Angrauto (Terceira)

- **Onde:** mesmo grupo e mesmo site. Aeroportos de Ponta Delgada, Terceira e
  Pico, e centro de Ponta Delgada. Também aluga motas.
- **Frota e preços (7 dias, Ponta Delgada, "a partir de"):** Económico 73,50 €;
  Económico automático 110,26 €; Compacto 147 €; Compacto automático 169,05 €;
  SUV compacto 147 €; SUV compacto automático 183,74 €; Monovolume 7 lugares
  294 €; Minibus 9 lugares automático 367,50 €; Compacto Elite automático 441 €;
  Monovolume automático 441 €. Sem comerciais na pesquisa.
- **Incluído na base:** só responsabilidade civil, km ilimitados e IVA.
- **Caução:** bloqueio no cartão de **crédito ou débito** igual à franquia mais
  150 € para combustível e multas: 1 650 € (grupos A e B) ou 2 650 € (grupo C e
  seguintes). Com o seguro Zero Excess (35 €/dia nos grupos A e B, 40 €/dia nos
  restantes) a franquia passa a 0 € e fica só o bloqueio de 150 €.
- **Regras:** 21 anos e 2 anos de carta (25 anos no grupo D); depósito cheio;
  cobranças posteriores possíveis até 90 dias após a devolução. Desconto de 10%
  para quem se regista no "Micauto Club".
- **Agosto de 2027:** ainda sem preços ("stop sale" para essas datas).
- **Fontes:** [pesquisa no site](https://www.micauto.com/reservas/?vehicle_type=cars&step=1&pickup_location=PDLAir&dropoff_location=PDLAir&pickup_date=2026-11-09&pickup_time=10:00&dropoff_date=2026-11-16&dropoff_time=10:00&drivers_age=30),
  [condições gerais](https://www.micauto.com/condicoes/), [FAQ](https://www.micauto.com/faq/).

### IslandRent

- **Onde:** só São Miguel. Loja na Relva; recolha no aeroporto por transfer
  gratuito a partir do parque principal.
- **Frota e preços (7 dias):** Seat Ibiza 86,35 €; Seat Arona 99,21 €; Kia Picanto
  automático 102,89 €; Kia XCeed 112,07 €; Seat Ibiza automático 115,74 €; Kia
  Stonic e Seat Arona automáticos 128,60 €; Cupra Formentor 257,14 €; Cupra
  Terramar 282,86 €.
- **Caução:** "não exigimos cartão de crédito nem depósito de segurança, mesmo
  com o seguro básico de responsabilidade civil" (FAQ).
- **Atenção:** a tarifa base só inclui seguro contra terceiros. Os danos no
  próprio carro ficam por conta do cliente, a não ser que junte um seguro:
  - CDW: 7,50 €/dia, franquia 1 200 € (no Seat Ibiza).
  - SCDW, cobertura total: 22,50 €/dia, franquia 0 €. Total do Ibiza com SCDW:
    243,85 €.
- **Regras:** 18 anos, sem taxa de condutor jovem; paga com débito, Visa,
  Mastercard, MB Way ou Multibanco; km ilimitados; 9:00 a 20:00.
- **Comerciais:** não tem.
- **Fontes:** [pesquisa no site](https://islandrent.pt/pesquise-seu-carro/?option=com_vikrentcar&task=search&place=1&returnplace=1&ck_returnplace=ok&pickupdate=2026/11/09&pickuph=10&pickupm=0&releasedate=2026/11/16&releaseh=10&releasem=0&categories=all&Itemid=249),
  [FAQ](https://islandrent.pt/en/page-home/), [condições](https://islandrent.pt/en/rental-terms-and-conditions/).

### Wayzor (só condições, sem preços)

- **Onde:** São Miguel, Terceira e Faial (aeroportos de Ponta Delgada, Lajes e
  Horta).
- **Acesso:** o site bloqueia o acesso automático (Cloudflare), mesmo a partir de
  um navegador comum aberto pela ferramenta de pesquisa. Os preços continuam por
  ver; é preciso simulá-los à mão. As condições abaixo vêm das
  páginas oficiais de [termos](https://www.wayzor.pt/pt/termos) e
  [FAQ](https://www.wayzor.pt/en/faq/faq-s-wayzor/) tal como aparecem nos
  motores de pesquisa; não foi possível abri-las diretamente.
- **Caução:** a franquia inteira fica bloqueada no cartão de crédito do condutor:
  de 845 € (VW Up!) a 2 800 €. Com o pacote de proteção extra desce, com mínimo
  de 300 €. Libertação até 30 dias úteis.
- **Seguro:** a base inclui só responsabilidade civil. Seguros comprados a
  terceiros não dispensam o bloqueio.

### Azores Easy Rent (só condições, sem preços)

- **Onde:** São Miguel e Pico. Carros e motas 125 cc.
- **Preços:** o motor de reservas pede conta de cliente; não foi simulado.
- **Seguro:** Easy Pack incluído (franquia desde 700 €); Super Easy Pack desde
  24 €/dia, franquia 0 €.
- **Caução:** feita no cartão de crédito no levantamento, igual à franquia do
  pacote escolhido. Cartão de crédito sempre obrigatório.
- **Cancelamento:** reembolso total até 48 h antes.
- **Fontes:** [site](https://azoreseasyrent.com/), [termos](https://azoreseasyrent.com/termos-condicoes).

---

## 6. Frota da DÉCADA OUSADA vs. concorrência

Pedido do Thiago: para cada viatura que vem pela API do WeGest, procurar o mesmo
modelo (ou o mais próximo) numa rent-a-car dos Açores e ver se tem preço.

**De onde vêm os números da DÉCADA OUSADA:** API do WeGest em produção
(`GET /disponibilidade`), localização "Açores", 09/11/2026 10:00 a 16/11/2026
10:00, consultada a 2026-10-14. A API devolve 37 dos 50 modelos de rent-a-car
para esta localização. Os valores são os que a API devolve (`cotacao.aluguer`,
com IVA), sem nenhum cálculo nosso. Para agosto de 2027 a API responde
`TARIFA_INDISPONIVEL` ("Ainda não há preços para estas datas").

**Como ler a comparação:** a cotação da API não traz caução nem franquia, por
isso não se sabe que seguro está incluído. Nas concorrentes o preço é a tarifa
base (o seguro mínimo de cada uma), salvo onde diz "total". Na Way2Azores o
valor entre parênteses é o pacote total (franquia 0); na Terceira esse pacote
sai mais barato do que o básico (secção 4). "Lista" quer dizer o valor da lista
da Ilha Verde, sem o pack Essential.

### Ligeiros de passageiros

| Viatura DÉCADA OUSADA | DO, 7 dias | Mesmo modelo na concorrência | Mais próximo na concorrência |
|---|---|---|---|
| Fiat Panda | 315,00 € | Autatlantis 81,48 €; Way2Azores 51,50 € (121,50 € com pacote total) | Micauto Económico 73,50 €; Ilha Verde Twingo 369,90 € total |
| Renault Clio | 385,00 € | Ilha Verde Clio IV 390,90 € total (lista 250,90 €) | IslandRent Seat Ibiza 86,35 €; Autatlantis Toyota Yaris 87,15 €; Way2Azores Polo/Ibiza 90,00 € (160,00 €) |
| Opel Corsa | 455,00 € | Autatlantis Corsa automático 121,31 €; Way2Azores Corsa, só na Terceira, 157,50 € (85,54 €) | Ilha Verde Ford Fiesta automático 277,15 € (lista) |
| Fiat Grande Panda | 560,00 € | não existe | Autatlantis Citroën C3 Aircross 90,72 €; Way2Azores Citroën C3 Hybrid automático 100,50 € |
| Fiat Tipo | 455,00 € | não existe | ver Opel Astra |
| Renault Megane | 560,00 € | não existe | ver Opel Astra |
| Seat Leon | 560,00 € | não existe | ver Opel Astra |
| Peugeot 308 | 595,00 € | não existe | ver Opel Astra |
| Opel Astra | 630,00 € | Autatlantis Astra 218,75 € (Astra SW 262,50 €); Way2Azores Astra, só na Terceira, 192,50 € (280,00 €) | Ilha Verde Ford Focus 285,90 € (lista); Micauto Compacto 147 €; IslandRent Kia XCeed 112,07 € |
| Opel Astra e | 665,00 € | não existe | Ilha Verde Nissan Leaf 332,10 € (lista), único elétrico compacto encontrado |
| Citroën ë-C4 | 630,00 € | não existe | Ilha Verde Nissan Leaf 332,10 € (lista) |
| Nissan Qashqai | 560,00 € | Ilha Verde Qashqai 492,40 € total (lista 352,40 €) | Autatlantis Dacia Duster 218,75 €; Micauto SUV compacto 147 €; Way2Azores Seat Arona 72,50 € (177,50 €); IslandRent Seat Arona 99,21 € |
| Dacia Jogger 7 lugares | 490,00 € | Autatlantis 306,25 €; Way2Azores 172,60 € (312,60 €); Ilha Verde 451,95 € (lista) | Micauto Monovolume 7 lugares 294 € |
| BMW 116d / 118d | 630,00 € | Autatlantis BMW Série 1 automático 301 € | Autatlantis Mini Cooper 218,75 €; Ilha Verde Mini Cooper 393 € (lista); Micauto Compacto Elite automático 441 € |
| BMW 216d / 218d | 665,00 € | não existe | ver BMW 116d |
| Mercedes Classe A 180 / 200 | 630,00 € | não existe | ver BMW 116d |
| Mercedes Classe A | 231,00 € | não existe | ver BMW 116d (preço DO suspeito, secção 7) |
| Mercedes Classe A 250e | 0,00 € | não existe | ver BMW 116d (preço DO suspeito, secção 7) |
| BMW 530e | 840,00 € | não existe | Autatlantis Mercedes C200 787,50 €; Ilha Verde Mercedes C 300 de 1 261,06 € total, Mercedes E 300 de 1 351,57 € (lista) |
| Tesla Model 3 | 980,00 € | nenhuma tem Tesla | Ilha Verde Nissan Ariya 605,04 € (lista), o elétrico mais caro encontrado |
| Mercedes GLB | 1 050,00 € | não existe | Autatlantis Mercedes GLC 966 €; Ilha Verde Mazda CX-60 577,34 €, Volvo XC40 481,20 € (lista) |
| BMW X6 | 1 225,00 € | não existe | Autatlantis Mercedes GLC 966 €; nenhum SUV deste nível |
| Porsche 718 Cayman | 2 100,00 € | não existe | nenhum desportivo; o mais próximo é o Mazda MX-5 da Ilha Verde, 331,40 € (lista) |

### Comerciais

| Viatura DÉCADA OUSADA | DO, 7 dias | Mesmo modelo na concorrência | Mais próximo na concorrência |
|---|---|---|---|
| Opel Combo | 126,00 € | Autatlantis 455 € (também no Pico); Way2Azores Combo Edition, só na Terceira, 175,00 € (227,50 €) | Way2Azores Citroën Berlingo Van XL 90,00 € (160,00 €); Ilha Verde Renault Kangoo 561,07 € total |
| Fiat Doblo L2 (maxi) | 147,00 € | não existe | ver Opel Combo |
| Fiat Doblo | 350,00 € | não existe | ver Opel Combo |
| Fiat Scudo | 490,00 € | não existe | Autatlantis Renault Trafic 3 lugares 770 € |
| Opel Vivaro (carga) | 490,00 € | não existe em carga (a Way2Azores só tem o Vivaro de 9 lugares) | Autatlantis Renault Trafic 3 lugares 770 € |
| Fiat Ducato | 260,19 € | não existe | Ilha Verde Ford Transit Cargo 634,11 € e 759,39 € (lista) |
| Opel Movano | 260,19 € | não existe | Ilha Verde Ford Transit Cargo 634,11 € (lista) |
| Citroën Jumper, Fiat Ducato 15 m³, Opel Movano Van, Peugeot Boxer | 630,00 € cada | não existe | Ilha Verde Ford Transit Cargo 634,11 € e 759,39 € (lista) |
| Opel Movano caixa aberta cabine dupla | 840,00 € | não existe | pick-ups: Ilha Verde Ford Ranger 844,87 € (lista); Autatlantis Toyota Hilux 840 €, só em agosto |
| Fiat Ducato contentor c/ plataforma elevatória | 980,00 € | não existe | nenhuma concorrente tem |
| Renault Master contentor c/ plataforma | 980,00 € | não existe | nenhuma concorrente tem |

**Modelos que a API não devolve para os Açores** (não entram na comparação):
Citroën C4, Kia Ceed SW, Mercedes C250 Coupé, Mercedes C300de, Mercedes CLA,
Mercedes V-Klasse, Opel Grandland, Opel Mokka-e, Peugeot 2008, Peugeot 208,
Peugeot e-308, Peugeot Expert, Volvo XC40.

### O que a comparação mostra

- **Ligeiros:** onde há o mesmo modelo, a DÉCADA OUSADA está acima de quase
  todas. O Panda custa 315 € contra 51,50 € a 121,50 € (Way2Azores, sem e com
  seguro total) e 81,48 € (Autatlantis). O Astra custa 630 € contra 218,75 €. A
  exceção é a Ilha Verde depois do pack Essential: o Clio da DÉCADA OUSADA
  (385 €) fica abaixo do da Ilha Verde (390,90 €); o Qashqai fica acima (560 €
  contra 492,40 €).
- **Premium:** quase nada para comparar. Só a Autatlantis tem um BMW (Série 1,
  301 € contra 630 € a 665 € dos BMW e Mercedes compactos da DO). Tesla, BMW X6
  e Porsche não têm equivalente nos Açores.
- **Comerciais:** é onde a DÉCADA OUSADA tem mais oferta. Nos pequenos, o Opel
  Combo (126 €) só perde para a tarifa base do Citroën Berlingo Van da Way2Azores
  (90 €, com franquia de 2 500 €); fica abaixo do Berlingo com pacote total
  (160 €), do Combo da Way2Azores na Terceira (175 €) e do da Autatlantis (455 €),
  e do Kangoo da Ilha Verde (561,07 €). Furgões grandes de carga e
  contentores com plataforma não aparecem em nenhuma concorrente; o mais parecido
  é o Ford Transit Cargo da Ilha Verde.

---

## 7. Alertas sobre os dados da API (confirmar com o João antes de passar ao Paulo)

1. **IVA a 23%.** Todas as cotações para "Açores" vêm com `iva: 23`. As
   concorrentes faturam com 16% (taxa dos Açores). Parece a tarifa do
   continente aplicada aos Açores.
2. **Preços que parecem errados:** Mercedes Classe A 250e a 0 €; Mercedes Classe A
   a 33 €/dia quando a Classe A 180 / 200 está a 90 €/dia; Fiat Ducato e Opel
   Movano a 37,17 €/dia quando os outros furgões grandes estão a 90 €/dia; Opel
   Combo a 18 €/dia e Fiat Doblo L2 a 21 €/dia quando o Fiat Doblo está a
   50 €/dia.
3. **Sem caução nem franquia.** A cotação RAC vem com `caucao` e `franquia` a
   `null`, por isso não se sabe se o preço inclui seguro. Sem isso não dá para
   comparar com o "sem caução" da concorrência.
4. **Uma só localização "Açores",** sem ilha nem aeroporto. Não se sabe se as
   viaturas estão em São Miguel, na Terceira ou noutra ilha.
5. **Agosto sem tarifa.** Não há preços para a época alta, por isso a comparação
   de agosto ainda não é possível.

---

## 8. Ainda por verificar

- **Preços da Wayzor:** o site bloqueia o acesso automático. Simular à mão num
  navegador normal.
- **Preços da Azores Easy Rent:** o motor de reservas exige criar conta.
- **Go Rent a Car, Auto Ramalhense, Magic Islands, 7 Lombas, AzoresCar:** só
  aparecem em comparadores, guias e diretórios. Não foi encontrado site próprio
  com reserva online; o contacto é por telefone ou WhatsApp.
- **Tabela de cauções da Autatlantis:** está numa imagem; confirmar à mão.
- **Agosto na Way2Azores:** valores da primeira passagem, não simulados de novo.
- **Santa Maria, São Jorge, Flores, Graciosa, Corvo:** não simuladas.

## 9. O que isto pode significar para a DÉCADA OUSADA

Para decidir com o cliente, não para publicar:

- A comparação justa é o **preço total com seguro sem franquia**, porque é isso
  que o cliente açoriano está habituado a ver como "sem caução". Na amostra,
  um económico custa entre 121,50 € e 582,70 € por 7 dias nessas condições, em
  novembro.
- Se a DÉCADA OUSADA pedir caução nos Açores, convém mostrar logo a alternativa
  sem caução (pacote de seguro), como fazem a Way2Azores, a Autatlantis e a
  Micauto.
- Há comerciais à venda online, mas só nas três empresas grandes e com poucos
  modelos. A DÉCADA OUSADA tem mais modelos de comerciais (14 na API para os
  Açores) do que qualquer concorrente encontrada (a Ilha Verde, a que tem mais,
  mostra 4). Falta saber qual é a procura real.
- Antes de qualquer decisão de preço, resolver os alertas da secção 7: com IVA
  a 23% e sem saber o seguro incluído, a diferença nos ligeiros pode estar
  exagerada.
