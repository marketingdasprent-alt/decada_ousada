"use client";

import { Camera, CheckCircle2, FileUp, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import {
  APPLICATION_DOC_TYPES,
  APPLICATION_FILE_MAX,
  APPLICATION_FILE_TYPES,
  type AccountApplication,
  type ApplicationDocType,
  type ApplicationUploadTicket,
} from "@/domain/customer/account";
import { applicationFetch } from "@/lib/application-fetch";
import { cn } from "@/lib/cn";

import { Badge, Button } from "../shared/ui";

export const DOC_LABEL: Record<ApplicationDocType, string> = {
  documento_frente: "Documento de identificação (frente)",
  documento_verso: "Documento de identificação (verso)",
  carta_frente: "Carta de condução (frente)",
  carta_verso: "Carta de condução (verso)",
  licenca_tvde: "Licença TVDE",
  registo_criminal: "Registo criminal",
  comprovativo_morada: "Comprovativo de morada",
  comprovativo_iban: "Comprovativo de IBAN",
};

const ACCEPT = APPLICATION_FILE_TYPES.join(",");
const BY_EXTENSION: Record<string, (typeof APPLICATION_FILE_TYPES)[number]> = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" };

/** O tipo declarado pelo browser, ou pela extensão quando vem vazio. O WeGest confirma pelo conteúdo. */
function fileType(file: File): (typeof APPLICATION_FILE_TYPES)[number] | null {
  const declared = (APPLICATION_FILE_TYPES as readonly string[]).includes(file.type) ? (file.type as (typeof APPLICATION_FILE_TYPES)[number]) : null;
  return declared ?? (file.type ? null : BY_EXTENSION[file.name.split(".").pop()?.toLowerCase() ?? ""] ?? null);
}

/** O upload_url só pode ser https (storage do WeGest) ou a rota local do mock. */
function safeUploadUrl(raw: string): string | null {
  try {
    const url = new URL(raw, window.location.origin);
    if (url.protocol === "https:" || (url.origin === window.location.origin && url.pathname.startsWith("/api/account/application/mock-upload/"))) return url.toString();
  } catch {
    // URL inválido: tratado como falha do envio
  }
  return null;
}

type Busy = { tipo: ApplicationDocType; step: string } | null;

export function ApplicationDocuments({
  app,
  mock,
  onChange,
  onFatal,
}: {
  app: AccountApplication | null;
  mock: boolean;
  onChange: (app: AccountApplication) => void;
  onFatal: (status: number) => boolean;
}) {
  const [busy, setBusy] = useState<Busy>(null);
  const [errors, setErrors] = useState<Partial<Record<ApplicationDocType, string>>>({});
  const [done, setDone] = useState<Partial<Record<ApplicationDocType, string>>>({});
  const files = useRef<Partial<Record<ApplicationDocType, HTMLInputElement | null>>>({});
  const cameras = useRef<Partial<Record<ApplicationDocType, HTMLInputElement | null>>>({});

  const setError = (tipo: ApplicationDocType, message: string) => setErrors((e) => ({ ...e, [tipo]: message }));
  const setNote = (tipo: ApplicationDocType, message: string) => setDone((d) => ({ ...d, [tipo]: message }));

  async function upload(tipo: ApplicationDocType, file: File) {
    setError(tipo, "");
    setNote(tipo, "");
    // Recusa imediata, antes de qualquer pedido
    if (file.size > APPLICATION_FILE_MAX) return setError(tipo, "O ficheiro tem mais de 10 MB (máximo 10 MB). Escolha um ficheiro mais pequeno.");
    if (file.size === 0) return setError(tipo, "O ficheiro está vazio.");
    const type = fileType(file);
    if (!type) return setError(tipo, "O ficheiro tem de ser PDF, JPEG ou PNG.");

    const path = "/api/account/application/documents/" + tipo;
    try {
      // 1. Pedido de envio: o WeGest devolve um URL assinado, válido para este ficheiro
      setBusy({ tipo, step: "A preparar o envio" });
      const ticket = await applicationFetch<ApplicationUploadTicket>(path, mock, { method: "POST", body: { content_type: type, tamanho: file.size } });
      if (!ticket.ok) {
        if (!onFatal(ticket.status)) setError(tipo, ticket.error.message);
        return;
      }
      const url = safeUploadUrl(ticket.data.upload_url);
      if (!url) return setError(tipo, "O envio não está disponível de momento. Tente de novo.");

      // 2. Envio dos bytes direto ao storage, sem passar pelo servidor do site
      setBusy({ tipo, step: "A enviar o ficheiro" });
      const sent = await fetch(url, { method: ticket.data.metodo || "PUT", headers: ticket.data.cabecalhos, body: file, credentials: "omit", signal: AbortSignal.timeout(120_000) });
      if (!sent.ok) return setError(tipo, "O envio do ficheiro falhou (código " + sent.status + "). Tente de novo; se repetir, fale connosco.");

      // 3. Confirmação: o WeGest abre o ficheiro e confirma que é mesmo PDF, JPEG ou PNG
      setBusy({ tipo, step: "A confirmar" });
      const confirmed = await applicationFetch<AccountApplication>(path, mock, { method: "PUT", body: { caminho: ticket.data.caminho } });
      if (!confirmed.ok) {
        if (!onFatal(confirmed.status)) setError(tipo, confirmed.error.message);
        return;
      }
      onChange(confirmed.data);
      setNote(tipo, "Recebido: " + file.name);
    } catch {
      setError(tipo, "O envio demorou demasiado ou perdeu a ligação. Tente de novo.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(tipo: ApplicationDocType) {
    setError(tipo, "");
    setNote(tipo, "");
    setBusy({ tipo, step: "A remover" });
    const res = await applicationFetch<AccountApplication>("/api/account/application/documents/" + tipo, mock, { method: "DELETE" });
    setBusy(null);
    if (res.ok) { onChange(res.data); setNote(tipo, "Removido."); return; }
    if (!onFatal(res.status)) setError(tipo, res.error.message);
  }

  if (!app) return <p className="text-body-small text-copy-secondary">Guarde primeiro os dados pessoais. Depois disso, pode enviar os documentos aqui.</p>;

  return (
    <ul className="divide-y divide-line">
      {APPLICATION_DOC_TYPES.map((tipo) => {
        const received = Boolean(app.documentos[tipo]?.recebido);
        const waived = tipo === "licenca_tvde" && Boolean(app.dados.em_formacao_tvde) && !received;
        const isBusy = busy?.tipo === tipo;
        const label = DOC_LABEL[tipo];
        const describedBy = "doc-" + tipo + "-state";
        return (
          <li key={tipo} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-card", received ? "bg-positive-surface text-positive" : "bg-panel-alt text-copy-secondary")} aria-hidden>
                {received ? <CheckCircle2 className="size-5" /> : <FileUp className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{label}</p>
                <p id={describedBy} className="mt-0.5">
                  {received ? <Badge tone="ok">Recebido</Badge> : waived ? <Badge>Dispensado: em formação TVDE</Badge> : <Badge tone="warn">Em falta</Badge>}
                </p>
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <input
                  ref={(el) => { files.current[tipo] = el; }}
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void upload(tipo, file);
                  }}
                />
                <input
                  ref={(el) => { cameras.current[tipo] = el; }}
                  type="file"
                  accept="image/jpeg,image/png"
                  capture="environment"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void upload(tipo, file);
                  }}
                />
                <Button
                  variant={received ? "outline" : "dark"}
                  size="sm"
                  className="max-md:h-11"
                  disabled={Boolean(busy)}
                  loading={isBusy && busy?.step !== "A remover"}
                  onClick={() => files.current[tipo]?.click()}
                  aria-label={(received ? "Trocar o ficheiro de " : "Carregar ") + label}
                  aria-describedby={describedBy}
                >
                  {received ? "Trocar" : "Carregar"}
                </Button>
                <Button variant="outline" size="sm" className="max-md:h-11 md:hidden" disabled={Boolean(busy)} onClick={() => cameras.current[tipo]?.click()} aria-label={"Tirar foto para " + label}>
                  <Camera className="size-4" aria-hidden /> Tirar foto
                </Button>
                {received && (
                  <Button variant="ghost" size="sm" className="max-md:h-11" disabled={Boolean(busy)} loading={isBusy && busy?.step === "A remover"} onClick={() => void remove(tipo)} aria-label={"Remover " + label}>
                    <Trash2 className="size-4" aria-hidden /> Remover
                  </Button>
                )}
              </div>
            </div>
            <div role="status" className="text-body-small">
              {isBusy && <p className="mt-2 text-copy-secondary">{busy.step}…</p>}
              {!isBusy && done[tipo] && <p className="mt-2 text-copy-secondary">{done[tipo]}</p>}
            </div>
            {errors[tipo] && <p role="alert" className="mt-2 text-body-small text-negative">{errors[tipo]}</p>}
          </li>
        );
      })}
    </ul>
  );
}
