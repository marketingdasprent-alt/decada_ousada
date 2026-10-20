"use client";

import { useEffect, useState } from "react";
import type { AccountInvoice } from "@/domain/customer/account";
import { signOutDriver } from "@/lib/driver-auth-client";
import { accountFetch } from "@/lib/account-fetch";
import { formatMoney } from "@/domain/pricing";
import { formatDate } from "@/lib/dates";
import { Button, ButtonLink, Skeleton } from "../shared/ui";
import { EmptyState, Notice } from "../shared/states";

const typeNames = { FT: "Fatura", FR: "Fatura-recibo", NC: "Nota de crédito", RC: "Recibo" };

export function WeGestInvoices() {
  const [invoices, setInvoices] = useState<AccountInvoice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [retry, setRetry] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    accountFetch("/api/account/invoices").then(async (response) => {
      const body = await response.json().catch(() => null);
      if (!active) return;
      if (response.status === 401) { await signOutDriver(); setExpired(true); return; }
      if (!response.ok || !Array.isArray(body?.data)) { setError("Não foi possível carregar as faturas. Tente novamente."); return; }
      setInvoices(body.data);
    }).catch(() => { if (active) setError("Sem ligação ao serviço de faturas. Tente novamente."); });
    return () => { active = false; };
  }, [retry]);

  async function download(invoice: AccountInvoice) {
    if (downloading) return;
    setDownloading(invoice.id); setError(null);
    try {
      const response = await accountFetch("/api/account/invoices/" + encodeURIComponent(invoice.id), 60_000);
      if (response.status === 401) { setExpired(true); return; }
      if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf")) {
        setError(response.status === 404 ? "Esta fatura não tem PDF disponível." : response.status === 429 ? "Demasiados pedidos. Aguarde um minuto antes de tentar novamente." : "O PDF está indisponível de momento. Tente mais tarde."); return;
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "fatura-" + invoice.id + ".pdf";
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { setError("Não foi possível obter o PDF a tempo. Tente novamente mais tarde."); }
    finally { setDownloading(null); }
  }

  if (expired) return <Notice tone="warn">A sessão terminou. <ButtonLink href="/entrar?next=%2Fminha-conta%2Ffaturas" size="sm" className="mt-3">Entrar novamente</ButtonLink></Notice>;
  return <div className="space-y-5">
    {error && <Notice tone="danger">{error}{!invoices && <Button variant="outline" size="sm" className="mt-3" onClick={() => { setError(null); setRetry((value) => value + 1); }}>Tentar novamente</Button>}</Notice>}
    {!invoices && !error && <div role="status" aria-label="A carregar faturas"><Skeleton className="h-64" /></div>}
    {invoices?.length === 0 && <EmptyState title="Ainda não tem faturas" description="As faturas aparecem aqui depois de emitidas em seu nome." />}
    {Boolean(invoices?.length) && <ul className="divide-y divide-line rounded-panel border border-line bg-panel">
      {invoices?.map((invoice) => <li key={invoice.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="break-words font-semibold">{typeNames[invoice.tipo]} {[invoice.serie, invoice.numero].filter(Boolean).join("/")}</p>
          <p className="text-body-small text-copy-muted">{invoice.data_emissao ? formatDate(invoice.data_emissao) : "Data não disponível"}{invoice.reserva_codigo ? ", Reserva " + invoice.reserva_codigo : ""}</p>
        </div>
        <p className="font-bold tabular">{invoice.total === null ? "Total não disponível" : formatMoney(invoice.total, "EUR", { decimals: true })}</p>
        <Button variant="outline" size="sm" disabled={Boolean(downloading) || !invoice.numero} loading={downloading === invoice.id} onClick={() => void download(invoice)} aria-label={"Descarregar " + typeNames[invoice.tipo] + " " + (invoice.numero ?? "")}>Descarregar PDF</Button>
      </li>)}
    </ul>}
    {downloading && <p role="status" className="text-body-small text-copy-secondary">A preparar o PDF. Pode demorar até cerca de 45 segundos.</p>}
  </div>;
}
