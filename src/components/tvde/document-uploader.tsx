"use client";

import { CheckCircle2, FileUp, Loader2, RefreshCw } from "lucide-react";
import { useRef, useState } from "react";

import type { ApplicationDocument, DocumentRequirement } from "@/domain/application";
import { track } from "@/lib/analytics";
import { apiFetch } from "@/lib/fetcher";
import { cn } from "@/lib/cn";

/**
 * Upload de documentos TVDE (doc §55–57). Envio via backend → WeGest.
 * Os ficheiros nunca ficam com URL pública.
 */
export function DocumentUploader({
  applicationId,
  requirements,
  documents,
  onChange,
  highlight,
}: {
  applicationId: string;
  requirements: DocumentRequirement[];
  documents: ApplicationDocument[];
  onChange?: (docs: ApplicationDocument[], status: string) => void;
  /** Tipos pedidos pela equipa (documentação adicional). */
  highlight?: string[];
}) {
  const [docs, setDocs] = useState(documents);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function upload(req: DocumentRequirement, file: File) {
    setErrors((e) => ({ ...e, [req.type]: "" }));
    if (!req.accept.includes(file.type)) return setErrors((e) => ({ ...e, [req.type]: "Formato não suportado. Use PDF, JPG ou PNG." }));
    if (file.size > req.maxSizeMb * 1024 * 1024) return setErrors((e) => ({ ...e, [req.type]: `O ficheiro excede ${req.maxSizeMb} MB.` }));
    setBusy(req.type);
    const body = new FormData();
    body.set("doc_type", req.type);
    body.set("file", file);
    const res = await apiFetch<{ documents: ApplicationDocument[]; status: string }>(`/api/tvde/applications/${applicationId}/documents`, { method: "POST", body, timeoutMs: 60_000 });
    setBusy(null);
    if (res.ok) {
      track("tvde_document_uploaded", { applicationId, type: req.type });
      setDocs(res.data.documents);
      onChange?.(res.data.documents, res.data.status);
    } else setErrors((e) => ({ ...e, [req.type]: res.error.message }));
  }

  return (
    <ul className="space-y-3">
      {requirements.map((req) => {
        const doc = docs.find((d) => d.type === req.type);
        const isBusy = busy === req.type;
        const requested = highlight?.includes(req.type);
        return (
          <li key={req.type} className={cn("rounded-panel border bg-panel p-4 sm:p-5", requested ? "border-caution" : doc ? "border-positive/40" : "border-line")}>
            <div className="flex flex-wrap items-center gap-4">
              <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-card", doc && !requested ? "bg-positive-surface text-positive" : "bg-panel-alt text-copy-secondary")}>
                {isBusy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : doc && !requested ? <CheckCircle2 className="size-5" aria-hidden /> : <FileUp className="size-5" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {req.label} {req.required ? <span className="text-brand" aria-label="obrigatório">*</span> : <span className="text-caption font-normal text-copy-muted">(opcional)</span>}
                </p>
                <p className="text-body-small text-copy-muted">{doc ? `Enviado: ${doc.fileName}` : (req.description ?? "PDF, JPG ou PNG")}, máx. {req.maxSizeMb} MB</p>
                {requested && <p className="mt-1 text-body-small font-medium text-caution">Pedido pela equipa: envie uma versão atualizada.</p>}
              </div>
              <input
                ref={(el) => { inputs.current[req.type] = el; }}
                type="file"
                accept={req.accept.join(",")}
                className="sr-only"
                id={`doc-${req.type}`}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(req, f);
                  e.target.value = "";
                }}
              />
              <label htmlFor={`doc-${req.type}`} className={cn("inline-flex h-10 cursor-pointer items-center gap-2 rounded-control border px-4 text-body-small font-semibold transition-colors", isBusy && "pointer-events-none opacity-50", doc ? "border-line hover:border-copy/30" : "border-copy bg-panel-dark text-on-dark hover:bg-panel-dark/90")}>
                {doc ? <><RefreshCw className="size-4" aria-hidden /> Substituir</> : "Escolher ficheiro"}
              </label>
            </div>
            {errors[req.type] && <p role="alert" className="mt-3 text-body-small text-negative">{errors[req.type]}</p>}
          </li>
        );
      })}
    </ul>
  );
}
