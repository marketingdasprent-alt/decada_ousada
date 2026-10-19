"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState, type FormEvent, type ReactNode } from "react";

import { ID_DOCUMENT_TYPES, LICENSE_CATEGORIES, type AccountApplication, type AccountApplicationDraft } from "@/domain/customer/account";
import { applicationFetch } from "@/lib/application-fetch";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { formatFieldValue } from "@/lib/dynamic-form";

import { Checkbox, ErrorSummary, Field, Input, Select } from "../shared/form";
import { EmptyState, Notice } from "../shared/states";
import { Badge, Button, ButtonLink, Card, Skeleton } from "../shared/ui";
import { ApplicationDocuments, DOC_LABEL } from "./account-application-documents";
import { ApplicationStatusBadge, ApplicationTimeline } from "./application-status";

/** A mesma versão do texto de consentimento da ficha antiga (http-transport, CONSENT_VERSION). */
const CONSENT_VERSION = "site-2026-10";
const CONSENT_TEXT = "Autorizo o tratamento dos meus dados pessoais para a análise desta candidatura.";

const ID_TYPE_LABEL: Record<(typeof ID_DOCUMENT_TYPES)[number], string> = {
  cc: "Cartão de cidadão",
  ar: "Autorização de residência",
  tr: "Título de residência",
  passaporte: "Passaporte",
  bi: "Bilhete de identidade",
};

export const FIELD_LABEL: Record<string, string> = {
  nome: "Nome completo",
  email: "Email",
  telefone: "Telemóvel",
  nif: "NIF",
  morada: "Morada",
  codigo_postal: "Código postal",
  cidade: "Localidade",
  documento: "Documento de identificação",
  "documento.tipo": "Tipo de documento de identificação",
  "documento.numero": "Número do documento de identificação",
  "documento.validade": "Validade do documento de identificação",
  carta_conducao: "Carta de condução",
  "carta_conducao.numero": "Número da carta de condução",
  "carta_conducao.categorias": "Categorias da carta de condução",
  "carta_conducao.validade": "Validade da carta de condução",
  licenca_tvde: "Licença TVDE, ou indicar que está em formação",
  "licenca_tvde.numero": "Número da licença TVDE, ou indicar que está em formação",
  "licenca_tvde.validade": "Validade da licença TVDE",
  em_formacao_tvde: "Licença TVDE, ou indicar que está em formação",
  iban: "IBAN",
  consentimento: "Autorização do tratamento dos dados",
};
/** Campo que o WeGest devolva sem rótulo nosso: mostra-se o nome legível em vez de esconder. */
export const fieldLabel = (key: string) => FIELD_LABEL[key] ?? key.replace(/[._]/g, " ");

type SectionKey = "pessoais" | "documento" | "carta" | "licenca" | "iban" | "consentimento";
const SECTION_OF = (field: string): SectionKey =>
  field.startsWith("documento") ? "documento"
    : field.startsWith("carta_conducao") ? "carta"
      : field.startsWith("licenca_tvde") || field === "em_formacao_tvde" ? "licenca"
        : field === "iban" ? "iban"
          : field === "consentimento" ? "consentimento"
            : "pessoais";

const STATE_TO_STATUS = { rascunho: "draft", submetido: "submitted", em_analise: "under_review", aprovado: "approved", rejeitado: "rejected" } as const;

/** Hoje em Lisboa, AAAA-MM-DD. */
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());

type Load = { state: "loading" } | { state: "ready"; app: AccountApplication | null } | { state: "expired" } | { state: "forbidden" } | { state: "error"; message: string };

const API = "/api/account/application";
const LOGIN = "/entrar?tipo=motorista&next=" + encodeURIComponent("/tvde/minha-conta/candidaturas");

function useApplication(mock: boolean) {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const reload = useCallback(async () => {
    const res = await applicationFetch<AccountApplication | null>(API, mock);
    if (res.ok) setLoad({ state: "ready", app: res.data });
    else if (res.status === 401) setLoad({ state: "expired" });
    else if (res.status === 403) setLoad({ state: "forbidden" });
    else setLoad({ state: "error", message: res.error.message });
  }, [mock]);
  useEffect(() => {
    // Primeira leitura ao montar: o estado vem do WeGest, nunca de cache
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);
  return { load, setApp: (app: AccountApplication) => setLoad({ state: "ready", app }), setLoad, reload };
}

function Blocked({ load, onRetry }: { load: Exclude<Load, { state: "ready" }>; onRetry: () => void }) {
  if (load.state === "loading") return <div role="status" aria-label="A carregar a candidatura"><Skeleton className="h-96" /></div>;
  if (load.state === "expired")
    return <Notice tone="warn" title="A sessão terminou">Entre de novo com a sua conta de motorista para continuar a candidatura.<div className="mt-3"><ButtonLink href={LOGIN} size="sm">Entrar</ButtonLink></div></Notice>;
  if (load.state === "forbidden")
    return (
      <Notice tone="warn" title="É preciso uma conta de motorista">
        A candidatura TVDE é feita com uma conta de motorista. A conta com que entrou é de cliente Rent a Car. Entre com a conta de motorista, ou crie uma no separador Motorista TVDE.
        <div className="mt-3"><ButtonLink href="/entrar?tipo=motorista" size="sm">Entrar como motorista</ButtonLink></div>
      </Notice>
    );
  return <Notice tone="danger">{load.message}<div className="mt-3"><Button variant="outline" size="sm" onClick={onRetry}>Tentar novamente</Button></div></Notice>;
}

/** Resumo para o dashboard da Área TVDE. */
export function AccountApplicationSummary({ mock }: { mock: boolean }) {
  const { load, reload } = useApplication(mock);
  if (load.state !== "ready") return <Blocked load={load} onRetry={() => void reload()} />;
  const app = load.app;
  if (!app)
    return <EmptyState title="Ainda não começou a candidatura" description="Preencha os dados e envie os documentos na página da candidatura. Pode guardar e voltar mais tarde." action={<ButtonLink href="/tvde/minha-conta/candidaturas">Começar a candidatura</ButtonLink>} />;
  const draft = app.estado === "rascunho";
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="flex-1 text-body-large font-bold">Candidatura TVDE</h3>
        <ApplicationStatusBadge status={STATE_TO_STATUS[app.estado]} />
      </div>
      <div className="mt-5"><ApplicationTimeline status={STATE_TO_STATUS[app.estado]} withVehicle={false} /></div>
      <p className="mt-5 text-body-small text-copy-secondary">
        {draft ? missingSentence(app) : app.estado === "rejeitado" ? "A candidatura não foi aprovada. Veja o motivo na página da candidatura." : app.submetida_em ? "Enviada a " + formatDate(app.submetida_em.slice(0, 10)) + "." : "Candidatura enviada."}
      </p>
      <ButtonLink href="/tvde/minha-conta/candidaturas" size="sm" variant={draft ? "primary" : "outline"} className="mt-4">{draft ? "Continuar a candidatura" : "Ver a candidatura"}</ButtonLink>
    </Card>
  );
}

function missingSentence(app: AccountApplication) {
  const fields = new Set(app.campos_em_falta.map(fieldLabel)).size;
  const docs = app.em_falta.length;
  if (!fields && !docs) return "Está tudo preenchido. Já pode submeter a candidatura.";
  const parts = [fields ? (fields === 1 ? "1 dado" : fields + " dados") : "", docs ? (docs === 1 ? "1 documento" : docs + " documentos") : ""].filter(Boolean);
  return "Ainda falta " + parts.join(" e ") + ".";
}

/** Candidatura completa: ficha por secções, documentos e envio; só leitura depois de submetida. */
export function AccountApplicationForm({ mock, email }: { mock: boolean; email: string }) {
  const { load, setApp, reload } = useApplication(mock);
  const [notice, setNotice] = useState<{ tone: "ok" | "danger" | "warn"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (load.state !== "ready") return <Blocked load={load} onRetry={() => void reload()} />;
  const app = load.app;
  if (app && app.estado !== "rascunho") return <ReadOnly app={app} />;

  /** Erros que mudam o ecrã todo: sessão, conta errada, candidatura já submetida. */
  const handleFatal = (status: number) => {
    if (status === 401) { setNotice(null); void reload(); return true; }
    if (status === 403 || status === 409) { void reload(); return true; }
    return false;
  };

  async function submit() {
    setSubmitting(true);
    setNotice(null);
    const res = await applicationFetch<AccountApplication>(API, mock, { method: "POST" });
    setSubmitting(false);
    if (res.ok) { setApp(res.data); window.scrollTo({ top: 0 }); return; }
    if (handleFatal(res.status)) return;
    setNotice({ tone: "danger", text: res.error.message });
    if (res.status === 422) void reload();
  }

  const missingBySection = (section: SectionKey) => (app ? [...new Set(app.campos_em_falta.filter((f) => SECTION_OF(f) === section).map(fieldLabel))] : []);
  const sectionProps = { app, mock, email, onSaved: setApp, onFatal: handleFatal };
  const missingFields = app ? [...new Set(app.campos_em_falta.map(fieldLabel))] : [];

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-main-aside">
      <div className="min-w-0 space-y-6">
        <p className="text-copy-secondary">
          Preencha por partes e carregue em Guardar em cada uma. Pode sair e voltar: o que guardou fica na sua conta. Os dados só seguem para análise quando carregar em Submeter.
        </p>
        <PersonalSection {...sectionProps} missing={missingBySection("pessoais")} />
        <IdSection {...sectionProps} missing={missingBySection("documento")} />
        <LicenseSection {...sectionProps} missing={missingBySection("carta")} />
        <TvdeSection {...sectionProps} missing={missingBySection("licenca")} />
        <IbanSection {...sectionProps} missing={missingBySection("iban")} />
        <ConsentSection {...sectionProps} missing={missingBySection("consentimento")} />
        <Card className="p-5 sm:p-6">
          <h3 className="text-h4 font-bold">Documentos</h3>
          <p className="mt-1 text-body-small text-copy-secondary">PDF, JPEG ou PNG, até 10 MB cada. No telemóvel pode tirar a foto na hora.</p>
          <div className="mt-5">
            <ApplicationDocuments app={app} mock={mock} onChange={setApp} onFatal={handleFatal} />
          </div>
        </Card>
      </div>

      <aside className="min-w-0">
        <Card className="space-y-4 p-5 sm:p-6 xl:sticky-panel">
          <h3 className="text-h4 font-bold">Para submeter</h3>
          {!app && <p className="text-body-small text-copy-secondary">Comece pelos dados pessoais. Depois de os guardar, pode enviar os documentos.</p>}
          {app && (app.pode_submeter ? (
            <p className="text-body-small text-positive">Não falta nada. Reveja os dados e submeta a candidatura.</p>
          ) : (
            <>
              <MissingList title="Dados em falta" items={missingFields} />
              <MissingList title="Documentos em falta" items={app.em_falta.map((t) => DOC_LABEL[t as keyof typeof DOC_LABEL] ?? fieldLabel(t))} />
            </>
          ))}
          {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
          <Button className="w-full" disabled={!app?.pode_submeter} loading={submitting} onClick={() => void submit()} aria-describedby="submit-help">
            Submeter candidatura
          </Button>
          <p id="submit-help" className="text-caption text-copy-muted">
            {app?.pode_submeter ? "Depois de submeter, já não pode alterar os dados nem os documentos." : "O botão fica disponível quando não faltar nenhum dado nem documento."}
          </p>
        </Card>
      </aside>
    </div>
  );
}

function MissingList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-body-small font-semibold">{title} ({items.length})</p>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-body-small text-copy-secondary">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

// ───────────────────────────── Secções da ficha ─────────────────────────────

interface SectionProps {
  app: AccountApplication | null;
  mock: boolean;
  email: string;
  missing: string[];
  onSaved: (app: AccountApplication) => void;
  onFatal: (status: number) => boolean;
}

type Errors = Record<string, string>;

/**
 * Uma secção = um formulário com o seu Guardar. Só os campos preenchidos vão no PUT (rascunho
 * parcial). O formato é validado aqui; o dígito de controlo do NIF e do IBAN é o WeGest que verifica.
 */
function SectionForm({
  title,
  missing,
  app,
  mock,
  onSaved,
  onFatal,
  build,
  children,
}: Omit<SectionProps, "email"> & { title: string; build: (data: FormData) => { draft: AccountApplicationDraft; errors: Errors }; children: (errors: Errors) => ReactNode }) {
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "danger"; text: string } | null>(null);
  const headingId = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const { draft, errors: local } = build(new FormData(form));
    setStatus(null);
    setErrors(local);
    if (Object.keys(local).length) return focusFirstError(form);
    if (!Object.keys(draft).length) { setStatus({ tone: "danger", text: "Preencha pelo menos um campo para guardar." }); return; }
    setSaving(true);
    const res = await applicationFetch<AccountApplication>(API, mock, { method: "PUT", body: draft });
    setSaving(false);
    if (res.ok) { onSaved(res.data); setStatus({ tone: "ok", text: "Guardado." }); return; }
    if (onFatal(res.status)) return;
    const fieldErrors = res.error.fieldErrors ?? {};
    setErrors(fieldErrors);
    setStatus({ tone: "danger", text: res.error.message });
    if (Object.keys(fieldErrors).length) requestAnimationFrame(() => focusFirstError(form));
  }

  return (
    <Card className="p-5 sm:p-6">
      <form method="post" noValidate onSubmit={(e) => void onSubmit(e)} aria-labelledby={headingId}>
        <div className="flex flex-wrap items-center gap-3">
          <h3 id={headingId} className="flex-1 text-h4 font-bold">{title}</h3>
          {app && (missing.length ? <Badge tone="warn">Em falta: {missing.length}</Badge> : <Badge tone="ok">Completo</Badge>)}
        </div>
        <div className="mt-5">{children(errors)}</div>
        <ErrorSummary count={Object.keys(errors).length} className="mt-4" />
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Button type="submit" variant="dark" loading={saving}>Guardar</Button>
          <p role="status" className={cn("text-body-small", status?.tone === "danger" ? "text-negative" : "text-positive")}>{status?.text}</p>
        </div>
      </form>
    </Card>
  );
}

function focusFirstError(form: HTMLFormElement) {
  form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
}

/** Props de um controlo ligado ao seu erro (aria-invalid + aria-describedby). */
function control(id: string, errors: Errors, key: string) {
  return { id, name: key, "aria-invalid": Boolean(errors[key]) || undefined, "aria-describedby": errors[key] ? id + "-error" : undefined };
}

const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

function checkDate(errors: Errors, key: string, date: string) {
  if (date && date <= today()) errors[key] = "A validade tem de ser depois de hoje.";
}

function PersonalSection({ email, ...props }: SectionProps) {
  const uid = useId();
  const d = props.app?.dados ?? {};
  return (
    <SectionForm
      {...props}
      title="Dados pessoais"
      build={(data) => {
        const errors: Errors = {};
        const draft: AccountApplicationDraft = {};
        for (const key of ["nome", "telefone", "nif", "morada", "codigo_postal", "cidade"] as const) {
          const v = value(data, key);
          if (v) draft[key] = v;
        }
        if (draft.nif && !/^\d{9}$/.test(draft.nif)) errors.nif = "O NIF tem 9 dígitos.";
        if (draft.codigo_postal && !/^\d{4}-\d{3}$/.test(draft.codigo_postal)) errors.codigo_postal = "Use o formato 0000-000.";
        if (draft.telefone && !/^\+?[\d ]{9,20}$/.test(draft.telefone)) errors.telefone = "Indique o telemóvel só com números, ex. +351 912 345 678.";
        // O email da candidatura é sempre o da conta (o WeGest recusa outro)
        if (Object.keys(draft).length && email) draft.email = email;
        return { draft, errors };
      }}
    >
      {(errors) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" htmlFor={uid + "nome"} error={errors.nome} className="sm:col-span-2">
            <Input {...control(uid + "nome", errors, "nome")} defaultValue={d.nome} autoComplete="name" maxLength={200} />
          </Field>
          <Field label="Email" htmlFor={uid + "email"} help="O email da sua conta. Não se altera aqui.">
            <Input id={uid + "email"} value={email} readOnly disabled />
          </Field>
          <Field label="Telemóvel" htmlFor={uid + "telefone"} error={errors.telefone} help="Com o indicativo do país.">
            <Input {...control(uid + "telefone", errors, "telefone")} defaultValue={d.telefone} type="tel" autoComplete="tel" inputMode="tel" placeholder="+351 912 345 678" maxLength={20} />
          </Field>
          <Field label="NIF" htmlFor={uid + "nif"} error={errors.nif}>
            <Input {...control(uid + "nif", errors, "nif")} defaultValue={d.nif} inputMode="numeric" placeholder="9 dígitos" maxLength={9} className="max-w-field-short" />
          </Field>
          <Field label="Morada" htmlFor={uid + "morada"} error={errors.morada} className="sm:col-span-2">
            <Input {...control(uid + "morada", errors, "morada")} defaultValue={d.morada} autoComplete="street-address" placeholder="Rua, número e andar" maxLength={200} />
          </Field>
          <Field label="Código postal" htmlFor={uid + "codigo_postal"} error={errors.codigo_postal}>
            <Input
              {...control(uid + "codigo_postal", errors, "codigo_postal")}
              defaultValue={d.codigo_postal}
              autoComplete="postal-code"
              inputMode="numeric"
              placeholder="0000-000"
              maxLength={8}
              className="max-w-field-short"
              onChange={(e) => { e.currentTarget.value = formatFieldValue("postal_code", e.currentTarget.value); }}
            />
          </Field>
          <Field label="Localidade" htmlFor={uid + "cidade"} error={errors.cidade}>
            <Input {...control(uid + "cidade", errors, "cidade")} defaultValue={d.cidade} autoComplete="address-level2" maxLength={100} />
          </Field>
        </div>
      )}
    </SectionForm>
  );
}

function IdSection(props: SectionProps) {
  const uid = useId();
  const d = props.app?.dados.documento ?? {};
  return (
    <SectionForm
      {...props}
      title="Documento de identificação"
      build={(data) => {
        const errors: Errors = {};
        const doc: NonNullable<AccountApplicationDraft["documento"]> = {};
        const tipo = value(data, "documento.tipo");
        if ((ID_DOCUMENT_TYPES as readonly string[]).includes(tipo)) doc.tipo = tipo as (typeof ID_DOCUMENT_TYPES)[number];
        if (value(data, "documento.numero")) doc.numero = value(data, "documento.numero");
        if (value(data, "documento.validade")) doc.validade = value(data, "documento.validade");
        checkDate(errors, "documento.validade", doc.validade ?? "");
        return { draft: Object.keys(doc).length ? { documento: doc } : {}, errors };
      }}
    >
      {(errors) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de documento" htmlFor={uid + "tipo"} error={errors["documento.tipo"]} className="sm:col-span-2">
            <Select {...control(uid + "tipo", errors, "documento.tipo")} defaultValue={d.tipo ?? ""}>
              <option value="">Escolha o tipo</option>
              {ID_DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{ID_TYPE_LABEL[t]}</option>)}
            </Select>
          </Field>
          <Field label="Número do documento" htmlFor={uid + "numero"} error={errors["documento.numero"]}>
            <Input {...control(uid + "numero", errors, "documento.numero")} defaultValue={d.numero} maxLength={40} />
          </Field>
          <Field label="Válido até" htmlFor={uid + "validade"} error={errors["documento.validade"]}>
            <Input {...control(uid + "validade", errors, "documento.validade")} defaultValue={d.validade} type="date" min={today()} />
          </Field>
        </div>
      )}
    </SectionForm>
  );
}

function LicenseSection(props: SectionProps) {
  const uid = useId();
  const d = props.app?.dados.carta_conducao ?? {};
  return (
    <SectionForm
      {...props}
      title="Carta de condução"
      build={(data) => {
        const errors: Errors = {};
        const carta: NonNullable<AccountApplicationDraft["carta_conducao"]> = {};
        if (value(data, "carta_conducao.numero")) carta.numero = value(data, "carta_conducao.numero");
        const categorias = data.getAll("carta_conducao.categorias").map(String).filter((c): c is (typeof LICENSE_CATEGORIES)[number] => (LICENSE_CATEGORIES as readonly string[]).includes(c));
        if (categorias.length) carta.categorias = categorias;
        if (value(data, "carta_conducao.validade")) carta.validade = value(data, "carta_conducao.validade");
        checkDate(errors, "carta_conducao.validade", carta.validade ?? "");
        return { draft: Object.keys(carta).length ? { carta_conducao: carta } : {}, errors };
      }}
    >
      {(errors) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Número da carta" htmlFor={uid + "numero"} error={errors["carta_conducao.numero"]}>
            <Input {...control(uid + "numero", errors, "carta_conducao.numero")} defaultValue={d.numero} maxLength={40} />
          </Field>
          <Field label="Válida até" htmlFor={uid + "validade"} error={errors["carta_conducao.validade"]}>
            <Input {...control(uid + "validade", errors, "carta_conducao.validade")} defaultValue={d.validade} type="date" min={today()} />
          </Field>
          <fieldset className="sm:col-span-2" aria-describedby={errors["carta_conducao.categorias"] ? uid + "cat-error" : uid + "cat-help"}>
            <legend className="mb-1.5 text-body-small font-medium text-copy-secondary">Categorias</legend>
            <p id={uid + "cat-help"} className="mb-2 text-caption text-copy-muted">Marque todas as que constam da carta. Para TVDE conta a B.</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {LICENSE_CATEGORIES.map((c) => (
                <Checkbox key={c} name="carta_conducao.categorias" value={c} defaultChecked={d.categorias?.includes(c)} label={c} className="min-w-14" />
              ))}
            </div>
            {errors["carta_conducao.categorias"] && <p id={uid + "cat-error"} className="mt-1.5 text-body-small text-negative">{errors["carta_conducao.categorias"]}</p>}
          </fieldset>
        </div>
      )}
    </SectionForm>
  );
}

function TvdeSection(props: SectionProps) {
  const uid = useId();
  const dados = props.app?.dados;
  const [training, setTraining] = useState(Boolean(dados?.em_formacao_tvde));
  const d = dados?.licenca_tvde ?? {};
  return (
    <SectionForm
      {...props}
      title="Licença TVDE"
      build={(data) => {
        const errors: Errors = {};
        if (data.get("em_formacao_tvde") === "on") return { draft: { em_formacao_tvde: true, licenca_tvde: null }, errors };
        const licenca: { numero?: string; validade?: string } = {};
        if (value(data, "licenca_tvde.numero")) licenca.numero = value(data, "licenca_tvde.numero");
        if (value(data, "licenca_tvde.validade")) licenca.validade = value(data, "licenca_tvde.validade");
        checkDate(errors, "licenca_tvde.validade", licenca.validade ?? "");
        return { draft: Object.keys(licenca).length ? { em_formacao_tvde: false, licenca_tvde: licenca } : dados?.em_formacao_tvde ? { em_formacao_tvde: false } : {}, errors };
      }}
    >
      {(errors) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <Checkbox
            name="em_formacao_tvde"
            checked={training}
            onChange={(e) => setTraining(e.currentTarget.checked)}
            label="Ainda estou a tirar a formação TVDE e não tenho licença."
            className="sm:col-span-2"
          />
          {!training && (
            <>
              <Field label="Número da licença TVDE" htmlFor={uid + "numero"} error={errors["licenca_tvde.numero"]}>
                <Input {...control(uid + "numero", errors, "licenca_tvde.numero")} defaultValue={d?.numero} maxLength={40} />
              </Field>
              <Field label="Válida até" htmlFor={uid + "validade"} error={errors["licenca_tvde.validade"]}>
                <Input {...control(uid + "validade", errors, "licenca_tvde.validade")} defaultValue={d?.validade} type="date" min={today()} />
              </Field>
            </>
          )}
          {training && <p className="text-body-small text-copy-secondary sm:col-span-2">Sem licença, o documento Licença TVDE deixa de ser pedido.</p>}
        </div>
      )}
    </SectionForm>
  );
}

function IbanSection(props: SectionProps) {
  const uid = useId();
  const iban = props.app?.dados.iban;
  return (
    <SectionForm
      {...props}
      title="IBAN"
      build={(data) => {
        const errors: Errors = {};
        const v = value(data, "iban").replace(/\s+/g, "").toUpperCase();
        if (v && !/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(v)) errors.iban = "Confirme o IBAN, ex. PT50 0002 0123 1234 5678 9015 4.";
        return { draft: v ? { iban: v } : {}, errors };
      }}
    >
      {(errors) => (
        <Field label="IBAN" htmlFor={uid + "iban"} error={errors.iban} help="A conta onde recebe os pagamentos.">
          <Input
            {...control(uid + "iban", errors, "iban")}
            defaultValue={iban ? formatFieldValue("iban", iban) : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder="PT50 0000 0000 0000 0000 0000 0"
            maxLength={42}
            onChange={(e) => { e.currentTarget.value = formatFieldValue("iban", e.currentTarget.value); }}
          />
        </Field>
      )}
    </SectionForm>
  );
}

function ConsentSection(props: SectionProps) {
  const accepted = props.app?.dados.consentimento;
  return (
    <SectionForm
      {...props}
      title="Autorização"
      build={(data) => {
        const errors: Errors = {};
        if (data.get("consentimento") !== "on") errors.consentimento = "Para submeter, autorize o tratamento dos dados.";
        return { draft: { consentimento: { versao: CONSENT_VERSION, aceite_em: new Date().toISOString() } }, errors };
      }}
    >
      {(errors) => (
        <div>
          <Checkbox
            name="consentimento"
            defaultChecked={Boolean(accepted)}
            aria-invalid={Boolean(errors.consentimento) || undefined}
            aria-describedby={errors.consentimento ? "consent-error" : undefined}
            label={<>{CONSENT_TEXT} Saiba como na <Link href="/privacidade" target="_blank" rel="noopener" className="font-semibold text-brand underline underline-offset-2">política de privacidade</Link>.</>}
          />
          {errors.consentimento && <p id="consent-error" className="mt-1.5 text-body-small text-negative">{errors.consentimento}</p>}
          {accepted && <p className="mt-2 text-caption text-copy-muted">Autorizado a {formatDate(accepted.aceite_em.slice(0, 10))}.</p>}
        </div>
      )}
    </SectionForm>
  );
}

// ───────────────────────────── Depois de submeter ─────────────────────────────

const STATE_TEXT: Record<Exclude<AccountApplication["estado"], "rascunho">, string> = {
  submetido: "Candidatura enviada. A equipa da DÉCADA OUSADA vai analisá-la.",
  em_analise: "A equipa da DÉCADA OUSADA está a analisar a candidatura.",
  aprovado: "A candidatura foi aprovada.",
  rejeitado: "A candidatura não foi aprovada.",
};

function maskIban(iban: string) {
  const clean = iban.replace(/\s+/g, "");
  return clean.length > 8 ? clean.slice(0, 4) + " … " + clean.slice(-4) : clean;
}

function ReadOnly({ app }: { app: AccountApplication }) {
  const d = app.dados;
  const estado = app.estado as Exclude<AccountApplication["estado"], "rascunho">;
  const rows: Array<[string, string | undefined]> = [
    ["Nome completo", d.nome],
    ["Email", d.email],
    ["Telemóvel", d.telefone],
    ["NIF", d.nif],
    ["Morada", [d.morada, [d.codigo_postal, d.cidade].filter(Boolean).join(" ")].filter(Boolean).join(", ")],
    ["Documento de identificação", d.documento ? [d.documento.tipo ? ID_TYPE_LABEL[d.documento.tipo] : "", d.documento.numero].filter(Boolean).join(", ") : undefined],
    ["Carta de condução", d.carta_conducao ? [d.carta_conducao.numero, d.carta_conducao.categorias?.join(", ")].filter(Boolean).join(", categorias ") : undefined],
    ["Licença TVDE", d.em_formacao_tvde ? "Em formação" : d.licenca_tvde?.numero],
    ["IBAN", d.iban ? maskIban(d.iban) : undefined],
  ];
  const received = Object.entries(app.documentos).filter(([, doc]) => doc?.recebido).map(([tipo]) => DOC_LABEL[tipo as keyof typeof DOC_LABEL] ?? fieldLabel(tipo));
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="flex-1 text-h4 font-bold">Estado da candidatura</h3>
          <ApplicationStatusBadge status={STATE_TO_STATUS[app.estado]} />
        </div>
        <div className="mt-5"><ApplicationTimeline status={STATE_TO_STATUS[app.estado]} withVehicle={false} /></div>
        <p className="mt-5">{STATE_TEXT[estado]}{app.submetida_em ? " Enviada a " + formatDate(app.submetida_em.slice(0, 10)) + "." : ""}</p>
        {estado === "rejeitado" && (
          <Notice tone="danger" title="Motivo" className="mt-4">{app.motivo_rejeicao || "A equipa não indicou o motivo. Fale connosco pelo Suporte."}</Notice>
        )}
        <p className="mt-4 text-body-small text-copy-secondary">
          Depois de submetida, a candidatura já não se altera online. Para corrigir alguma coisa, fale connosco pelo <Link href="/tvde/minha-conta/suporte" className="font-semibold text-brand underline underline-offset-2">Suporte</Link>.
        </p>
      </Card>
      <Card className="p-5 sm:p-6">
        <h3 className="text-h4 font-bold">O que enviou</h3>
        <dl className="mt-4 divide-y divide-line">
          {rows.filter(([, v]) => v).map(([label, v]) => (
            <div key={label} className="grid grid-cols-1 gap-1 py-3 sm:grid-label-value sm:gap-4">
              <dt className="text-body-small text-copy-muted">{label}</dt>
              <dd className="break-words">{v}</dd>
            </div>
          ))}
          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-label-value sm:gap-4">
            <dt className="text-body-small text-copy-muted">Documentos</dt>
            <dd>{received.length ? <ul className="space-y-0.5">{received.map((r) => <li key={r}>{r}</li>)}</ul> : "Nenhum"}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
