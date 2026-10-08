import "server-only";

/**
 * Log técnico das chamadas ao WeGest (doc §105, §116).
 * Guarda apenas metadados: nunca payloads, tokens ou dados pessoais.
 * TODO(DB): persistir em `integration_logs` (PostgreSQL) em produção.
 */
export interface IntegrationLogEntry {
  timestamp: string;
  requestId: string;
  endpoint: string;
  method: string;
  status: number;
  responseTimeMs: number;
  errorCode?: string;
  wegestRequestId?: string;
}

const MAX_ENTRIES = 200;
const g = globalThis as unknown as { __integrationLog?: IntegrationLogEntry[] };
const log = () => (g.__integrationLog ??= []);

export function recordIntegrationCall(entry: Omit<IntegrationLogEntry, "timestamp">) {
  const list = log();
  list.unshift({ ...entry, timestamp: new Date().toISOString() });
  if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
}

export function getIntegrationStats() {
  const list = log();
  const ok = list.filter((e) => e.status > 0 && e.status < 500);
  const errors = list.filter((e) => e.status === 0 || e.status >= 500);
  const avg = ok.length ? Math.round(ok.reduce((a, e) => a + e.responseTimeMs, 0) / ok.length) : null;
  return {
    total: list.length,
    lastCallAt: list[0]?.timestamp ?? null,
    lastErrorAt: errors[0]?.timestamp ?? null,
    averageMs: avg,
    recent: list.slice(0, 20),
  };
}
