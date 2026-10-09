/**
 * Dados de demonstração no formato CRU do WeGest.
 * Passam pelos mesmos mappers que a API real: assim a normalização é exercitada desde já.
 * Preços, viaturas e locais são fictícios.
 */
import type { WgCategory, WgCoverage, WgDocumentType, WgExtra, WgFormField, WgLocation, WgRate, WgVehicle } from "../types";

export const MOCK_LOCATIONS: WgLocation[] = [
  { location_id: "LOC-LRA", location_name: "Leiria", region_code: "PT-CONT", address: "Av. Heróis de Angola, 2400 Leiria", lat: 39.7436, lng: -8.8071, allows_pickup: true, allows_return: true, opening_hours: "Seg–Sáb, 08:00–20:00", services: ["RAC", "TVDE"] },
  { location_id: "LOC-LIS", location_name: "Lisboa", region_code: "PT-CONT", address: "Av. Almirante Gago Coutinho, 1700 Lisboa", lat: 38.7742, lng: -9.1342, allows_pickup: true, allows_return: true, opening_hours: "Todos os dias, 07:00–23:00", services: ["RAC", "TVDE"] },
  { location_id: "LOC-OPO", location_name: "Porto", region_code: "PT-CONT", address: "Rua de Santa Catarina, 4000 Porto", lat: 41.1496, lng: -8.6063, allows_pickup: true, allows_return: true, opening_hours: "Seg–Sáb, 08:00–20:00", services: ["RAC"] },
  { location_id: "LOC-FAO", location_name: "Faro", region_code: "PT-CONT", address: "Estrada do Aeroporto, 8005 Faro", lat: 37.017, lng: -7.9681, allows_pickup: true, allows_return: true, opening_hours: "Todos os dias, 07:00–23:00", services: ["RAC", "TVDE"] },
  { location_id: "LOC-PDL", location_name: "Ponta Delgada", region_code: "PT-AC", address: "Av. Infante D. Henrique, 9500 Ponta Delgada", lat: 37.7396, lng: -25.6687, allows_pickup: true, allows_return: true, opening_hours: "Seg–Sáb, 08:00–19:00", services: ["RAC", "TVDE"] },
  { location_id: "LOC-PDL-AP", location_name: "Aeroporto de Ponta Delgada", region_code: "PT-AC", address: "Aeroporto João Paulo II, 9500 Ponta Delgada", lat: 37.7412, lng: -25.6979, allows_pickup: true, allows_return: true, opening_hours: "Todos os dias, 06:30–23:30", services: ["RAC"] },
  { location_id: "LOC-TER", location_name: "Angra do Heroísmo", region_code: "PT-AC", address: "Rua da Sé, 9700 Angra do Heroísmo", lat: 38.6548, lng: -27.2187, allows_pickup: true, allows_return: true, opening_hours: "Seg–Sex, 09:00–18:00", services: ["RAC"] },
  { location_id: "LOC-HOR", location_name: "Horta", region_code: "PT-AC", address: "Av. 25 de Abril, 9900 Horta", lat: 38.5323, lng: -28.6264, allows_pickup: true, allows_return: false, opening_hours: "Seg–Sex, 09:00–18:00", services: ["RAC"] },
];

export const MOCK_CATEGORIES: WgCategory[] = [
  { category_id: "ECON", category_name: "Económico", group: "PAX" },
  { category_id: "COMP", category_name: "Compacto", group: "PAX" },
  { category_id: "MED", category_name: "Médio", group: "PAX" },
  { category_id: "FAM", category_name: "Familiar", group: "PAX" },
  { category_id: "SUV", category_name: "SUV", group: "PAX" },
  { category_id: "PREM", category_name: "Premium", group: "PAX" },
  { category_id: "7PAX", category_name: "7 lugares", group: "PAX" },
  { category_id: "COM-S", category_name: "Comercial pequeno", group: "COM" },
  { category_id: "COM-M", category_name: "Comercial médio", group: "COM" },
  { category_id: "COM-L", category_name: "Comercial grande", group: "COM" },
];

const RAC_DEFAULTS: Omit<WgRate, "rate_id" | "daily_rate"> = {
  product: "RAC",
  km_limit: 300,
  extra_km_price: 0.15,
  excess_amount: 1000,
  deposit_amount: 300,
  fuel_policy: "Cheio/Cheio: levante e devolva com o depósito cheio.",
  cancellation_policy: "Cancelamento gratuito até 48h antes do levantamento. Depois, é retido 1 dia de aluguer.",
  includes: ["Seguro de responsabilidade civil", "Assistência em viagem 24h", "IVA incluído"],
};

const TVDE_DEFAULTS: Omit<WgRate, "rate_id" | "weekly_rate"> = {
  product: "TVDE",
  deposit_amount: 750,
  reservation_amount: 250,
  km_limit: 6000,
  extra_km_price: 0.08,
  min_period: 4,
  includes: [
    "Seguro TVDE com cobertura de ocupantes",
    "Manutenção e revisões",
    "Assistência em viagem 24h",
    "Viatura de substituição (após 48h de imobilização)",
    "Dístico TVDE",
  ],
  conditions: [
    "Pagamento semanal antecipado.",
    "Caução devolvida no fim do contrato após vistoria.",
    "Idade mínima de 21 anos e 3 anos de carta.",
  ],
  required_documents: ["Cartão de Cidadão ou título de residência", "Carta de condução", "Certificado de motorista TVDE", "Comprovativo de morada"],
};

function rac(id: string, daily: number, extra: Partial<WgRate> = {}): WgRate {
  return { ...RAC_DEFAULTS, rate_id: `${id}-RAC`, daily_rate: daily, ...extra };
}
function tvde(id: string, weekly: number, extra: Partial<WgRate> = {}): WgRate {
  return { ...TVDE_DEFAULTS, rate_id: `${id}-TVDE`, weekly_rate: weekly, ...extra };
}

type V = Omit<WgVehicle, "photos" | "status"> & { status?: WgVehicle["status"] };

const RAW: V[] = [
  // ───────────── Continente ─────────────
  { vehicle_id: "V-1001", vehicle_name: "Peugeot 208", brand: "Peugeot", model: "208", category_id: "ECON", paint: "silver", fuel_type: "GASOLINA", transmission_type: "MANUAL", seats: 5, doors: 5, luggage: 2, features: ["Ar condicionado", "Bluetooth", "Apple CarPlay / Android Auto", "Sensores de estacionamento"], region_code: "PT-CONT", location_ids: ["LOC-LRA", "LOC-LIS", "LOC-OPO", "LOC-FAO"], rates: [rac("V-1001", 39)], description: "Citadino ágil e económico, ideal para a cidade e escapadinhas de fim de semana." },
  { vehicle_id: "V-1002", vehicle_name: "Renault Clio", brand: "Renault", model: "Clio", category_id: "ECON", paint: "blue", fuel_type: "GASOLINA", transmission_type: "MANUAL", seats: 5, doors: 5, luggage: 2, features: ["Ar condicionado", "Bluetooth", "Cruise control"], region_code: "PT-CONT", location_ids: ["LOC-LRA", "LOC-LIS", "LOC-FAO"], rates: [rac("V-1002", 37)], description: "Conforto e baixo consumo para o dia a dia." },
  { vehicle_id: "V-1003", vehicle_name: "Toyota Yaris Hybrid", brand: "Toyota", model: "Yaris Hybrid", category_id: "COMP", paint: "pearl", fuel_type: "HIBRIDO", transmission_type: "AUTOMATICA", seats: 5, doors: 5, luggage: 2, range_km: 900, features: ["Ar condicionado automático", "Câmara traseira", "Apple CarPlay / Android Auto", "Cruise control adaptativo"], region_code: "PT-CONT", location_ids: ["LOC-LRA", "LOC-LIS", "LOC-OPO"], rates: [rac("V-1003", 45), tvde("V-1003", 220, { deposit_amount: 600, reservation_amount: 200 })], description: "Híbrido compacto com consumos muito baixos em cidade." },
  { vehicle_id: "V-1004", vehicle_name: "Toyota Corolla Hybrid", brand: "Toyota", model: "Corolla Hybrid", category_id: "MED", paint: "onyx", fuel_type: "HIBRIDO", transmission_type: "AUTOMATICA", seats: 5, doors: 5, luggage: 3, range_km: 950, features: ["Ar condicionado bizona", "Câmara traseira", "Apple CarPlay / Android Auto", "Cruise control adaptativo", "Sensores 360°"], region_code: "PT-CONT", location_ids: ["LOC-LRA", "LOC-LIS", "LOC-FAO"], rates: [rac("V-1004", 49), tvde("V-1004", 275)], description: "A referência TVDE: fiável, espaçoso e com consumos mínimos." },
  { vehicle_id: "V-1005", vehicle_name: "Kia Niro EV", brand: "Kia", model: "Niro EV", category_id: "SUV", paint: "white", fuel_type: "ELETRICO", transmission_type: "AUTOMATICA", seats: 5, doors: 5, luggage: 3, range_km: 460, features: ["Carregamento rápido DC", "Bomba de calor", "Câmara traseira", "Bancos aquecidos"], region_code: "PT-CONT", location_ids: ["LOC-LIS", "LOC-OPO"], rates: [rac("V-1005", 62), tvde("V-1005", 310, { deposit_amount: 900, reservation_amount: 300, km_limit: 8000 })], description: "SUV 100% elétrico com autonomia para um turno inteiro." },
  { vehicle_id: "V-1006", vehicle_name: "Tesla Model 3", brand: "Tesla", model: "Model 3", category_id: "PREM", paint: "red", fuel_type: "ELETRICO", transmission_type: "AUTOMATICA", seats: 5, doors: 4, luggage: 3, range_km: 510, features: ["Autopilot", "Ecrã 15\"", "Acesso Supercharger", "Teto panorâmico"], region_code: "PT-CONT", location_ids: ["LOC-LIS"], rates: [rac("V-1006", 89, { deposit_amount: 800, excess_amount: 2000 }), tvde("V-1006", 395, { deposit_amount: 1000, reservation_amount: 350, km_limit: 8000 })], description: "Elétrico premium para quem quer o melhor em tecnologia e conforto." },
  { vehicle_id: "V-1007", vehicle_name: "Peugeot 5008", brand: "Peugeot", model: "5008", category_id: "7PAX", paint: "graphite", fuel_type: "DIESEL", transmission_type: "AUTOMATICA", seats: 7, doors: 5, luggage: 4, features: ["7 lugares", "Ar condicionado bizona", "Câmara traseira", "Navegação"], region_code: "PT-CONT", location_ids: ["LOC-LRA", "LOC-LIS", "LOC-FAO"], rates: [rac("V-1007", 79)], description: "SUV de 7 lugares para famílias e grupos." },
  { vehicle_id: "V-1008", vehicle_name: "Toyota C-HR Hybrid", brand: "Toyota", model: "C-HR Hybrid", category_id: "SUV", paint: "wine", fuel_type: "HIBRIDO", transmission_type: "AUTOMATICA", seats: 5, doors: 5, luggage: 2, range_km: 850, features: ["Câmara traseira", "Cruise control adaptativo", "Apple CarPlay / Android Auto"], region_code: "PT-CONT", location_ids: ["LOC-LIS", "LOC-OPO", "LOC-FAO"], rates: [rac("V-1008", 58), tvde("V-1008", 290)], description: "SUV híbrido com estilo e eficiência." },
  { vehicle_id: "V-1009", vehicle_name: "Mercedes-Benz Classe C", brand: "Mercedes-Benz", model: "Classe C", category_id: "PREM", paint: "black", fuel_type: "DIESEL", transmission_type: "AUTOMATICA", seats: 5, doors: 4, luggage: 3, features: ["Bancos em pele", "Navegação", "Ar condicionado tri-zona", "Faróis LED"], region_code: "PT-CONT", location_ids: ["LOC-LIS", "LOC-OPO"], rates: [rac("V-1009", 95, { deposit_amount: 1000, excess_amount: 2500 })], description: "Elegância executiva para viagens de negócios." },
  { vehicle_id: "V-1010", vehicle_name: "Dacia Jogger", brand: "Dacia", model: "Jogger", category_id: "7PAX", paint: "olive", fuel_type: "GPL", transmission_type: "MANUAL", seats: 7, doors: 5, luggage: 3, range_km: 1000, features: ["7 lugares", "Bi-fuel GPL", "Ar condicionado", "Bluetooth"], region_code: "PT-CONT", location_ids: ["LOC-LRA", "LOC-FAO"], rates: [rac("V-1010", 52), tvde("V-1010", 235, { reservation_amount: 200 })], description: "Espaço para 7 com o custo por km mais baixo do mercado." },
  { vehicle_id: "V-1011", vehicle_name: "Skoda Octavia Break", brand: "Skoda", model: "Octavia Break", category_id: "FAM", paint: "grey", fuel_type: "DIESEL", transmission_type: "AUTOMATICA", seats: 5, doors: 5, luggage: 5, features: ["Bagageira de 640 L", "Navegação", "Cruise control"], region_code: "PT-CONT", location_ids: ["LOC-LRA", "LOC-LIS"], rates: [tvde("V-1011", 245)], description: "Carrinha espaçosa e económica, muito procurada para TVDE." },
  { vehicle_id: "V-1012", vehicle_name: "Citroën Berlingo Van", brand: "Citroën", model: "Berlingo Van", category_id: "COM-S", paint: "white", fuel_type: "DIESEL", transmission_type: "MANUAL", seats: 3, doors: 4, luggage: 0, features: ["Volume de carga 3,3 m³", "Porta lateral", "Bluetooth"], region_code: "PT-CONT", location_ids: ["LOC-LRA", "LOC-LIS", "LOC-OPO"], rates: [rac("V-1012", 55)], description: "Comercial compacto para entregas e pequenas mudanças." },
  { vehicle_id: "V-1013", vehicle_name: "Renault Trafic Furgão", brand: "Renault", model: "Trafic Furgão", category_id: "COM-M", paint: "silver", fuel_type: "DIESEL", transmission_type: "MANUAL", seats: 3, doors: 4, luggage: 0, features: ["Volume de carga 6 m³", "Porta lateral", "Câmara traseira"], region_code: "PT-CONT", location_ids: ["LOC-LRA", "LOC-LIS"], rates: [rac("V-1013", 75)], description: "Furgão médio para mudanças e transporte de material." },
  { vehicle_id: "V-1014", vehicle_name: "Fiat Ducato", brand: "Fiat", model: "Ducato", category_id: "COM-L", paint: "white", fuel_type: "DIESEL", transmission_type: "MANUAL", seats: 3, doors: 4, luggage: 0, features: ["Volume de carga 13 m³", "Teto alto", "Sensores traseiros"], region_code: "PT-CONT", location_ids: ["LOC-LRA", "LOC-LIS", "LOC-OPO"], rates: [rac("V-1014", 89)], description: "Comercial grande para mudanças completas." },

  // ───────────── Açores ─────────────
  { vehicle_id: "V-2001", vehicle_name: "Fiat Panda", brand: "Fiat", model: "Panda", category_id: "ECON", paint: "sand", fuel_type: "GASOLINA", transmission_type: "MANUAL", seats: 4, doors: 5, luggage: 1, features: ["Ar condicionado", "Bluetooth"], region_code: "PT-AC", location_ids: ["LOC-PDL", "LOC-PDL-AP", "LOC-TER"], rates: [rac("V-2001", 32)], description: "Pequeno e prático para explorar as ilhas." },
  { vehicle_id: "V-2002", vehicle_name: "Renault Clio", brand: "Renault", model: "Clio", category_id: "ECON", paint: "red", fuel_type: "GASOLINA", transmission_type: "MANUAL", seats: 5, doors: 5, luggage: 2, features: ["Ar condicionado", "Bluetooth", "Cruise control"], region_code: "PT-AC", location_ids: ["LOC-PDL", "LOC-PDL-AP", "LOC-HOR"], rates: [rac("V-2002", 36)], description: "Conforto e baixo consumo para as estradas da ilha." },
  { vehicle_id: "V-2003", vehicle_name: "Toyota Yaris Cross Hybrid", brand: "Toyota", model: "Yaris Cross Hybrid", category_id: "SUV", paint: "green", fuel_type: "HIBRIDO", transmission_type: "AUTOMATICA", seats: 5, doors: 5, luggage: 2, range_km: 850, features: ["Câmara traseira", "Apple CarPlay / Android Auto", "Cruise control adaptativo"], region_code: "PT-AC", location_ids: ["LOC-PDL", "LOC-PDL-AP"], rates: [rac("V-2003", 52), tvde("V-2003", 240, { deposit_amount: 650, reservation_amount: 200, km_limit: 5000 })], description: "SUV híbrido perfeito para as subidas de São Miguel." },
  { vehicle_id: "V-2004", vehicle_name: "Dacia Duster 4x4", brand: "Dacia", model: "Duster 4x4", category_id: "SUV", paint: "orange", fuel_type: "DIESEL", transmission_type: "MANUAL", seats: 5, doors: 5, luggage: 3, features: ["Tração integral", "Ar condicionado", "Navegação"], region_code: "PT-AC", location_ids: ["LOC-PDL", "LOC-TER"], rates: [rac("V-2004", 55)], description: "Tração 4x4 para chegar às lagoas e miradouros." },
  { vehicle_id: "V-2005", vehicle_name: "Toyota Corolla Hybrid", brand: "Toyota", model: "Corolla Hybrid", category_id: "MED", paint: "onyx", fuel_type: "HIBRIDO", transmission_type: "AUTOMATICA", seats: 5, doors: 5, luggage: 3, range_km: 950, features: ["Ar condicionado bizona", "Câmara traseira", "Apple CarPlay / Android Auto"], region_code: "PT-AC", location_ids: ["LOC-PDL"], rates: [rac("V-2005", 50), tvde("V-2005", 260, { deposit_amount: 700, km_limit: 5000 })], description: "A referência TVDE, agora também em Ponta Delgada." },
  { vehicle_id: "V-2006", vehicle_name: "Peugeot e-208", brand: "Peugeot", model: "e-208", category_id: "COMP", paint: "yellow", fuel_type: "ELETRICO", transmission_type: "AUTOMATICA", seats: 5, doors: 5, luggage: 2, range_km: 400, features: ["100% elétrico", "Carregamento rápido", "Câmara traseira"], region_code: "PT-AC", location_ids: ["LOC-PDL", "LOC-PDL-AP"], rates: [rac("V-2006", 48), tvde("V-2006", 245, { reservation_amount: 200, km_limit: 5000 })], description: "Elétrico citadino silencioso, ideal para a ilha." },
  { vehicle_id: "V-2007", vehicle_name: "Citroën SpaceTourer", brand: "Citroën", model: "SpaceTourer", category_id: "7PAX", paint: "graphite", fuel_type: "DIESEL", transmission_type: "AUTOMATICA", seats: 8, doors: 4, luggage: 5, features: ["8 lugares", "Portas laterais deslizantes", "Ar condicionado"], region_code: "PT-AC", location_ids: ["LOC-PDL", "LOC-PDL-AP"], rates: [rac("V-2007", 72)], description: "Até 8 pessoas com bagagem: grupos e famílias." },
  { vehicle_id: "V-2008", vehicle_name: "Renault Kangoo Van", brand: "Renault", model: "Kangoo Van", category_id: "COM-S", paint: "white", fuel_type: "DIESEL", transmission_type: "MANUAL", seats: 2, doors: 4, luggage: 0, features: ["Volume de carga 3,9 m³", "Porta lateral"], region_code: "PT-AC", location_ids: ["LOC-PDL", "LOC-TER"], rates: [rac("V-2008", 50)], description: "Comercial ligeiro para trabalho nas ilhas." },
];

/**
 * Fotografias de demonstração: Unsplash (licença Unsplash, uso comercial gratuito),
 * uma por modelo, verificadas uma a uma como sendo o modelo anunciado. Ligação direta
 * ao CDN, que entrega a largura pedida (até 3840 px) já recortada em 5:3 (a proporção de
 * todos os enquadramentos de viatura) à volta do ponto focal (x, y) do carro, para nenhuma
 * foto ficar cortada. Ficam com a ilustração, como quando o WeGest devolve
 * imagem_url = null: modelos sem foto gratuita do modelo exato (Renault Trafic, Renault
 * Kangoo) e fotos em que o carro já vem cortado no original (Toyota Yaris Hybrid,
 * Peugeot 5008, Citroën SpaceTourer) e o Fiat Panda (só há fotos gratuitas de gerações
 * antigas). Com `file`, a foto é servida de `public/demo/viaturas/<viatura>.jpg`: a mesma
 * foto, já em 5:3, com as matrículas legíveis desfocadas. Em produção as fotos vêm do WeGest.
 */
const DEMO_PHOTOS: Record<string, { id: string; x: number; y: number; file?: true }> = {
  "V-1001": { id: "photo-1581607767815-4d7df22e3e28", x: 0.4, y: 0.64 },
  "V-1002": { id: "photo-1666335009171-3ddc17937d6d", x: 0.5, y: 0.5 },
  "V-1004": { id: "photo-1638618164682-12b986ec2a75", x: 0.5, y: 0.56 },
  "V-1005": { id: "photo-1647418551307-a9bb946afe2e", x: 0.42, y: 0.42, file: true },
  "V-1006": { id: "photo-1767949374128-58d3592a273d", x: 0.5, y: 0.61 },
  "V-1008": { id: "photo-1652509328308-7f0d7804e678", x: 0.45, y: 0.55 },
  "V-1009": { id: "photo-1739644246928-f4f96c5d9afc", x: 0.5, y: 0.52, file: true },
  "V-1010": { id: "photo-1706589271894-4f4887011e51", x: 0.5, y: 0.5 },
  "V-1011": { id: "photo-1727790621990-3a7a2623d564", x: 0.5, y: 0.5, file: true },
  "V-1012": { id: "photo-1768389533475-edc8b2bb9c7d", x: 0.5, y: 0.46 },
  "V-1014": { id: "photo-1692279952855-4a72ce767dd8", x: 0.5, y: 0.51 },
  "V-2002": { id: "photo-1666335009164-2597314da8e7", x: 0.5, y: 0.5 },
  "V-2003": { id: "photo-1785900103411-b846f4a7d65e", x: 0.57, y: 0.67, file: true },
  "V-2004": { id: "photo-1604395924490-a3a18bb7193e", x: 0.5, y: 0.54, file: true },
  "V-2005": { id: "photo-1623869675781-80aa31012a5a", x: 0.55, y: 0.69 },
  "V-2006": { id: "photo-1656947874545-075c9b00f44c", x: 0.39, y: 0.64, file: true },
};

function demoPhotoUrl(vehicleId: string, { id, x, y, file }: { id: string; x: number; y: number; file?: true }): string {
  if (file) return `/demo/viaturas/${vehicleId}.jpg`;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=focalpoint&fp-x=${x}&fp-y=${y}&ar=5:3&q=80`;
}

export const MOCK_VEHICLES: WgVehicle[] = RAW.map((v) => ({
  ...v,
  status: v.status ?? "ACTIVE",
  photos: DEMO_PHOTOS[v.vehicle_id] ? [{ url: demoPhotoUrl(v.vehicle_id, DEMO_PHOTOS[v.vehicle_id]), view: "exterior" }] : [],
}));

export const MOCK_EXTRAS: WgExtra[] = [
  { extra_id: "EX-BABY", extra_name: "Cadeira de bebé", extra_description: "Grupo 0+ (até 13 kg)", price: 6, charge_type: "PER_DAY", max_qty: 2, code: "baby" },
  { extra_id: "EX-CHILD", extra_name: "Cadeira de criança", extra_description: "Grupo 1–3 (9–36 kg)", price: 5, charge_type: "PER_DAY", max_qty: 3, code: "child" },
  { extra_id: "EX-DRIVER", extra_name: "Condutor adicional", extra_description: "Mais um condutor autorizado", price: 8, charge_type: "PER_DAY", max_qty: 2, code: "driver" },
  { extra_id: "EX-GPS", extra_name: "GPS", extra_description: "Navegador portátil com mapas atualizados", price: 7, charge_type: "PER_DAY", max_qty: 1, code: "gps" },
  { extra_id: "EX-WIFI", extra_name: "Wi-Fi portátil", extra_description: "Dados ilimitados em Portugal", price: 6, charge_type: "PER_DAY", max_qty: 1, code: "wifi" },
  { extra_id: "EX-KM", extra_name: "Quilómetros ilimitados", extra_description: "Sem limite diário de km", price: 10, charge_type: "PER_DAY", max_qty: 1, code: "km" },
  { extra_id: "EX-AFTER", extra_name: "Entrega fora de horário", extra_description: "Levantamento ou devolução fora do horário do balcão", price: 25, charge_type: "PER_RENTAL", max_qty: 1, code: "clock" },
];

export const MOCK_COVERAGES: WgCoverage[] = [
  { coverage_id: "COV-BASIC", coverage_name: "Proteção base", coverage_description: "Incluída. Franquia standard do modelo.", price_per_day: 0, excess_amount: null },
  { coverage_id: "COV-PLUS", coverage_name: "Proteção Plus", coverage_description: "Franquia reduzida para 300 €. Inclui vidros e pneus.", price_per_day: 9, excess_amount: 300 },
  { coverage_id: "COV-TOTAL", coverage_name: "Proteção Total", coverage_description: "Franquia 0 €. Vidros, pneus, jantes e assistência premium.", price_per_day: 16, excess_amount: 0 },
];

export const MOCK_APPLICATION_FORM: { version: string; fields: WgFormField[]; documents: WgDocumentType[] } = {
  version: "2026-10-mock",
  fields: [
    { key: "full_name", label: "Nome completo", input_type: "text", mandatory: true, min_length: 5, group: "Dados pessoais" },
    { key: "birth_date", label: "Data de nascimento", input_type: "date", mandatory: true, max: "2005-12-31", group: "Dados pessoais", hint: "Idade mínima: 21 anos." },
    { key: "nif", label: "NIF", input_type: "text", mandatory: true, regex: "^[0-9]{9}$", regex_message: "O NIF tem 9 dígitos.", group: "Dados pessoais" },
    { key: "niss", label: "NISS", input_type: "text", mandatory: true, regex: "^[0-9]{11}$", regex_message: "O NISS tem 11 dígitos.", group: "Dados pessoais" },
    { key: "email", label: "Email", input_type: "email", mandatory: true, group: "Contactos" },
    { key: "phone", label: "Telemóvel", input_type: "tel", mandatory: true, placeholder: "+351 9XX XXX XXX", regex: "^\\+?[0-9 ]{9,15}$", regex_message: "Indique um número de telemóvel válido.", group: "Contactos" },
    { key: "address", label: "Morada", input_type: "text", mandatory: true, group: "Morada" },
    { key: "zip_code", label: "Código postal", input_type: "text", mandatory: true, placeholder: "0000-000", regex: "^[0-9]{4}-[0-9]{3}$", regex_message: "Formato: 0000-000", group: "Morada" },
    { key: "city", label: "Localidade", input_type: "text", mandatory: true, group: "Morada" },
    { key: "license_number", label: "Número da carta de condução", input_type: "text", mandatory: true, group: "Habilitação" },
    { key: "license_expiry", label: "Validade da carta", input_type: "date", mandatory: true, min: "2026-10-07", group: "Habilitação" },
    { key: "tvde_certificate", label: "N.º do certificado de motorista TVDE", input_type: "text", mandatory: true, group: "Habilitação" },
    {
      key: "platform", label: "Plataforma onde trabalha", input_type: "select", mandatory: true, group: "Atividade TVDE",
      choices: [
        { value: "uber", label: "Uber" },
        { value: "bolt", label: "Bolt" },
        { value: "freenow", label: "FREENOW" },
        { value: "multiple", label: "Várias plataformas" },
        { value: "none", label: "Ainda não trabalho em TVDE" },
      ],
    },
    {
      key: "experience", label: "Experiência como motorista TVDE", input_type: "radio", mandatory: true, group: "Atividade TVDE",
      choices: [
        { value: "0", label: "Menos de 6 meses" },
        { value: "1", label: "6 meses a 2 anos" },
        { value: "2", label: "Mais de 2 anos" },
      ],
    },
    { key: "notes", label: "Observações", input_type: "textarea", mandatory: false, max_length: 500, group: "Atividade TVDE" },
  ],
  documents: [
    { doc_type: "id_document", doc_label: "Documento de identificação", mandatory: true, doc_description: "Cartão de Cidadão ou título de residência (frente e verso).", mime_types: ["application/pdf", "image/jpeg", "image/png"], max_mb: 10 },
    { doc_type: "driver_license", doc_label: "Carta de condução", mandatory: true, doc_description: "Frente e verso.", mime_types: ["application/pdf", "image/jpeg", "image/png"], max_mb: 10 },
    { doc_type: "tvde_certificate", doc_label: "Certificado de motorista TVDE", mandatory: true, mime_types: ["application/pdf", "image/jpeg", "image/png"], max_mb: 10 },
    { doc_type: "address_proof", doc_label: "Comprovativo de morada", mandatory: true, doc_description: "Emitido há menos de 3 meses.", mime_types: ["application/pdf", "image/jpeg", "image/png"], max_mb: 10 },
    { doc_type: "bank_proof", doc_label: "Comprovativo de IBAN", mandatory: false, doc_description: "Para devolução da caução.", mime_types: ["application/pdf", "image/jpeg", "image/png"], max_mb: 10 },
  ],
};
