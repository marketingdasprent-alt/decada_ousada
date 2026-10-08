"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CancellationPreview } from "@/domain/booking";
import { formatMoney } from "@/domain/pricing";
import { apiFetch } from "@/lib/fetcher";

import { Notice } from "../shared/states";
import { Button } from "../shared/ui";

export function CancelBooking({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [preview, setPreview] = useState<CancellationPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function loadPreview() {
    setLoading(true);
    setError(null);
    const res = await apiFetch<CancellationPreview>(`/api/rentacar/bookings/${bookingId}/cancel`);
    setLoading(false);
    if (res.ok) setPreview(res.data);
    else setError(res.error.message);
  }

  async function confirm() {
    setLoading(true);
    setError(null);
    const res = await apiFetch<{ refundable: number }>(`/api/rentacar/bookings/${bookingId}/cancel`, { method: "POST" });
    setLoading(false);
    // Só atualiza a UI depois da confirmação do WeGest (doc §33)
    if (res.ok) {
      setDone(res.data.refundable > 0 ? `Reserva cancelada. O reembolso de ${formatMoney(res.data.refundable, "EUR", { decimals: true })} foi iniciado.` : "Reserva cancelada.");
      router.refresh();
    } else setError(res.error.message);
  }

  if (done) return <Notice tone="ok">{done}</Notice>;

  return (
    <div>
      {!preview ? (
        <Button variant="outline" onClick={loadPreview} loading={loading}>Cancelar reserva</Button>
      ) : (
        <div className="rounded-panel border border-negative/25 bg-negative-surface/40 p-5">
          <p className="font-semibold">Política aplicável</p>
          <p className="mt-1 text-body-small text-copy-secondary">{preview.policy}</p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-body-small">
            <div><dt className="text-copy-muted">Valor pago</dt><dd className="font-bold tabular">{formatMoney(preview.paid, "EUR", { decimals: true })}</dd></div>
            <div><dt className="text-copy-muted">Taxa</dt><dd className="font-bold tabular">{formatMoney(preview.fee, "EUR", { decimals: true })}</dd></div>
            <div><dt className="text-copy-muted">A devolver</dt><dd className="font-bold tabular text-positive">{formatMoney(preview.refundable, "EUR", { decimals: true })}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="dark" onClick={confirm} loading={loading}>Confirmar cancelamento</Button>
            <Button variant="ghost" onClick={() => setPreview(null)} disabled={loading}>Manter reserva</Button>
          </div>
        </div>
      )}
      {error && <Notice tone="danger" className="mt-4">{error}</Notice>}
    </div>
  );
}
