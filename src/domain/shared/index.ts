/** Estados de pedido na UI: nunca ficar indefinidamente em loading (doc §93). */
export type RequestState = "idle" | "loading" | "success" | "empty" | "error" | "timeout";

export type ErrorCode =
  | "timeout"
  | "unavailable"
  | "not_found"
  | "validation"
  | "unauthorized"
  | "conflict"
  | "payment_failed"
  | "upstream"
  | "internal";

/** Erro normalizado devolvido pela API interna ao frontend. */
export interface ApiError {
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
  /** Motivo específico, para a UI oferecer a saída certa. */
  reason?: "vehicle_unavailable" | "session_expired" | "price_changed";
  requestId?: string;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };
