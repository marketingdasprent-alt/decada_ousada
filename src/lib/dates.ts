/**
 * Datas. A UI trabalha com "hora local de Portugal" (YYYY-MM-DDTHH:mm).
 * A API WeGest exige fuso explícito: converter com toApiDateTime() no servidor.
 */
const TZ: Record<string, string> = { mainland: "Europe/Lisbon", azores: "Atlantic/Azores" };

export function toApiDateTime(local: string, region: "mainland" | "azores" = "mainland"): string {
  // Calcula o offset real do fuso na data (inclui hora de verão)
  const [d, t = "00:00"] = local.split("T");
  const asUtc = new Date(`${d}T${t}:00Z`);
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ[region], timeZoneName: "longOffset" });
  const name = fmt.formatToParts(asUtc).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const offset = name === "GMT" ? "+00:00" : name.replace("GMT", "");
  return `${d}T${t}:00${offset}`;
}

const dateFmt = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
const shortFmt = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short" });
const weekdayFmt = new Intl.DateTimeFormat("pt-PT", { weekday: "short", day: "numeric", month: "short" });

/** Interpreta "YYYY-MM-DDTHH:mm" como hora local sem conversões de fuso. */
function parts(value: string) {
  const [d, t = "00:00"] = value.slice(0, 16).split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm] = t.split(":").map(Number);
  return { date: new Date(Date.UTC(y, m - 1, day, 12)), time: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}` };
}

export function formatDate(value: string): string {
  return dateFmt.format(parts(value).date);
}

export function formatDateShort(value: string): string {
  return shortFmt.format(parts(value).date).replace(".", "");
}

export function formatWeekday(value: string): string {
  return weekdayFmt.format(parts(value).date).replace(/\./g, "");
}

export function formatTime(value: string): string {
  return parts(value).time;
}

export function formatDateTime(value: string): string {
  return `${formatDate(value)}, ${formatTime(value)}`;
}

/** Data ISO (YYYY-MM-DD) a N dias de uma referência. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function rentalDays(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

export const TIME_SLOTS = Array.from({ length: 29 }, (_, i) => {
  const minutes = 7 * 60 + i * 30; // 07:00 → 21:00
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});
