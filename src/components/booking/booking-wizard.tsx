"use client";

import { ArrowLeft, Baby, CheckCircle2, ChevronDown, Clock, Gauge, MapPinned, Minus, Navigation, Plus, ShieldCheck, UserPlus, Wifi } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import type { Coverage, Extra, RentalSearch, SelectedExtra } from "@/domain/booking";
import { formatMoney, type Quote } from "@/domain/pricing";
import type { Vehicle } from "@/domain/vehicle";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { rentalDays } from "@/lib/dates";
import { apiFetch } from "@/lib/fetcher";
import { checkoutDraftQuery } from "@/lib/search";
import { customerSchema, type CustomerFormValues } from "@/lib/validation";

import { PaymentForm, type PaymentDraft } from "../payment/payment-form";
import { Checkbox, ErrorSummary, Field, Input, Textarea } from "../shared/form";
import { Notice } from "../shared/states";
import { Stepper } from "../shared/stepper";
import { Button, ButtonLink, Card } from "../shared/ui";
import { BookingSummary } from "./booking-summary";
import { CustomerForm, EMPTY_CUSTOMER } from "./customer-form";

const ICONS: Record<NonNullable<Extra["icon"]>, typeof Baby> = {
  baby: Baby,
  child: Baby,
  driver: UserPlus,
  gps: Navigation,
  wifi: Wifi,
  shield: ShieldCheck,
  km: Gauge,
  clock: Clock,
};

const STEPS = ["Proteção e extras", "Dados", "Pagamento"];

const QTY_BUTTON = "flex size-11 items-center justify-center rounded-control border border-line disabled:cursor-not-allowed disabled:border-transparent disabled:bg-panel-sunken disabled:text-copy-muted";

/** Checkout Rent a Car: Viatura → Extras → Dados → Pagamento → Confirmação (doc §18). */
export function BookingWizard({
  vehicle,
  offerId,
  search,
  extras,
  coverages,
  initialQuote,
  initialExtras,
  initialCoverageId,
  initialStep,
  pickupName,
  returnName,
  customer,
  loggedIn,
  backHref,
  checkoutPath,
  alternativesHref,
}: {
  vehicle: Vehicle;
  offerId: string;
  search: RentalSearch;
  extras: Extra[];
  coverages: Coverage[];
  initialQuote: Quote;
  initialExtras: SelectedExtra[];
  initialCoverageId: string | null;
  initialStep: number;
  pickupName?: string;
  returnName?: string;
  customer: Partial<CustomerFormValues> | null;
  loggedIn: boolean;
  backHref: string;
  /** Caminho do checkout com a pesquisa, para voltar aqui depois de entrar. */
  checkoutPath: string;
  /** Resultados para as mesmas datas, quando a viatura deixa de estar disponível. */
  alternativesHref: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [selected, setSelected] = useState<SelectedExtra[]>(initialExtras);
  const [coverageId, setCoverageId] = useState<string | null>(initialCoverageId);
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [form, setForm] = useState({ ...EMPTY_CUSTOMER, ...Object.fromEntries(Object.entries(customer ?? {}).filter(([, v]) => v)) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [payment, setPayment] = useState<PaymentDraft>({ method: "card", token: "", valid: false });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string; reason?: string } | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const idempotencyKey = useRef<string>("");

  const days = rentalDays(search.pickupAt, search.returnAt);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID();
  }, []);

  // Foco no título do passo depois de mudar de passo (não no primeiro render)
  const stepMounted = useRef(false);
  useEffect(() => {
    if (!stepMounted.current) {
      stepMounted.current = true;
      return;
    }
    topRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
  }, [step]);

  // Entrada no passo "Dados" (uma vez por visita ao checkout)
  const checkoutStarted = useRef(false);
  useEffect(() => {
    if (step < 1 || checkoutStarted.current) return;
    checkoutStarted.current = true;
    track("rentacar_checkout_started", { vehicleId: vehicle.id, loggedIn });
  }, [step, vehicle.id, loggedIn]);

  /** Entrar e voltar ao checkout com as escolhas feitas (proteção, extras, passo). */
  function loginHref(atStep: number) {
    const draft = checkoutDraftQuery({ extras: selected, coverageId, step: atStep });
    const target = draft ? `${checkoutPath}&${draft}` : checkoutPath;
    return `/entrar?next=${encodeURIComponent(target)}`;
  }

  // Recotação no WeGest sempre que extras/cobertura mudam (debounce)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setQuoting(true);
    const t = setTimeout(async () => {
      const res = await apiFetch<Quote>("/api/rentacar/quote", {
        method: "POST",
        body: JSON.stringify({ vehicleId: vehicle.id, offerId, search, extras: selected, coverageId }),
      });
      if (res.ok) {
        setQuote(res.data);
        setQuoteError(null);
      } else setQuoteError(res.error.message);
      setQuoting(false);
    }, 350);
    return () => clearTimeout(t);
  }, [selected, coverageId, vehicle.id, offerId, search]);

  const qty = (id: string) => selected.find((s) => s.extraId === id)?.quantity ?? 0;
  function setQty(extra: Extra, n: number) {
    const q = Math.max(0, Math.min(extra.maxQuantity, n));
    if (q > qty(extra.id)) track("rentacar_extra_added", { extraId: extra.id, quantity: q });
    setSelected((list) => (q === 0 ? list.filter((s) => s.extraId !== extra.id) : list.some((s) => s.extraId === extra.id) ? list.map((s) => (s.extraId === extra.id ? { ...s, quantity: q } : s)) : [...list, { extraId: extra.id, quantity: q }]));
  }

  function go(n: number) {
    setStep(n);
    setSummaryOpen(false);
    // Sem animação de scroll para quem pede movimento reduzido
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topRef.current?.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
  }

  function validateCustomer(): boolean {
    const res = customerSchema.safeParse(form);
    const errs: Record<string, string> = {};
    if (!res.success) for (const i of res.error.issues) errs[i.path.join(".")] ??= i.message;
    if (form.licenseExpiresAt && form.licenseExpiresAt < search.returnAt.slice(0, 10)) errs.licenseExpiresAt = "A carta tem de ser válida até ao fim do aluguer.";
    if (!loggedIn) {
      if (!password) errs.password = "Crie uma password para a sua conta.";
      else if (password.length < 8) errs.password = "A password deve ter pelo menos 8 caracteres.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      return false;
    }
    return true;
  }

  async function submit() {
    if (!payment.valid || !acceptTerms) return;
    setSubmitting(true);
    setSubmitError(null);
    track("rentacar_payment_started", { method: payment.method, total: quote.total });
    const res = await apiFetch<{ bookingId: string; paymentStatus: string }>("/api/rentacar/bookings", {
      method: "POST",
      timeoutMs: 45_000,
      body: JSON.stringify({
        vehicleId: vehicle.id,
        offerId,
        search,
        extras: selected,
        coverageId,
        expectedTotal: quote.total,
        customer: form,
        account: loggedIn ? undefined : { password },
        message: message || undefined,
        acceptTerms,
        payment: { method: payment.method, token: payment.token, phone: payment.phone },
        idempotencyKey: idempotencyKey.current,
      }),
    });
    if (res.ok) {
      if (!loggedIn) track("rentacar_customer_created", { vehicleId: vehicle.id });
      track("rentacar_payment_completed", { method: payment.method, status: res.data.paymentStatus, total: quote.total });
      router.push(`/rent-a-car/confirmacao?reserva=${encodeURIComponent(res.data.bookingId)}`);
      return;
    }
    setSubmitting(false);
    // Preço alterado: mostrar o novo total e pedir nova confirmação (WeGest PRECO_ALTERADO)
    if (res.status === 409 && res.raw?.quote) {
      setQuote(res.raw.quote as Quote);
      setSubmitError({ message: "O preço foi atualizado pelo nosso sistema. Reveja o novo total e confirme novamente.", reason: "price_changed" });
      return;
    }
    if (res.error.fieldErrors) {
      const fe: Record<string, string> = {};
      for (const [k, v] of Object.entries(res.error.fieldErrors)) fe[k.replace(/^customer\./, "").replace(/^account\./, "")] = v;
      setErrors(fe);
      go(1);
    }
    setSubmitError({ message: res.error.message, reason: res.error.reason });
    // Nova chave para uma nova tentativa depois de um erro definitivo
    if (res.status !== 0 && res.status < 500) idempotencyKey.current = crypto.randomUUID();
  }

  const summary = (
    <BookingSummary
      vehicle={vehicle}
      quote={quote}
      pickup={pickupName}
      ret={returnName}
      pickupAt={search.pickupAt}
      returnAt={search.returnAt}
      updating={quoting}
    />
  );

  // Viatura indisponível ou sessão expirada: o pagamento não pode seguir daqui
  const blocked = submitError?.reason === "vehicle_unavailable" || submitError?.reason === "session_expired";
  const payButton = (
    <Button size="lg" className="w-full" onClick={submit} loading={submitting} disabled={!payment.valid || !acceptTerms || quoting}>
      {submitting ? "A processar…" : `Pagar ${formatMoney(quote.total, "EUR", { decimals: true })} e reservar`}
    </Button>
  );
  const mobileAction: ReactNode =
    step === 0 ? (
      <Button size="lg" className="w-full" onClick={() => go(1)} disabled={quoting}>Continuar</Button>
    ) : step === 1 ? (
      <Button type="submit" form="dados-form" size="lg" className="w-full">Continuar para pagamento</Button>
    ) : blocked ? null : (
      payButton
    );

  return (
    <div ref={topRef}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href={backHref} className="flex items-center gap-1.5 text-body-small font-medium text-copy-secondary hover:text-copy max-md:min-h-(--layout-tap)">
          <ArrowLeft className="size-4" aria-hidden /> Voltar à viatura
        </Link>
        <Stepper steps={STEPS} current={step} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-main-aside">
        <div className="min-w-0">
          {step === 0 && (
            <div className="space-y-10">
              {coverages.length > 0 && (
                <fieldset>
                  <legend className="contents">
                    <h2 data-step-heading tabIndex={-1} className="text-h3 font-bold focus:outline-none">Proteção</h2>
                  </legend>
                  <p className="mt-1 text-body text-copy-secondary">A cobertura escolhida define a franquia em caso de dano.</p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {coverages.map((c) => (
                      <label key={c.id} className={cn("relative flex cursor-pointer flex-col rounded-panel border-2 bg-panel p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus", coverageId === c.id ? "border-selected bg-selected-surface" : "border-line hover:border-copy/20")}>
                        <input type="radio" name="coverage" className="sr-only" checked={coverageId === c.id} onChange={() => setCoverageId(c.id)} />
                        <ShieldCheck className={cn("size-6", coverageId === c.id ? "text-copy" : "text-copy-muted")} aria-hidden />
                        {coverageId === c.id && <CheckCircle2 className="absolute right-4 top-4 size-5 text-copy" aria-hidden />}
                        <span className="mt-3 font-bold">{c.name}</span>
                        {c.description && <span className="mt-1 text-body text-copy-secondary">{c.description}</span>}
                        <span className="mt-auto pt-4 text-body-small">
                          {c.pricePerDay === 0 ? <span className="font-semibold text-positive">Incluída</span> : <><span className="font-bold tabular">+ {formatMoney(c.pricePerDay)}</span>/dia</>}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {extras.length > 0 && (
                <section aria-labelledby="extras">
                  <h2 id="extras" {...(coverages.length === 0 ? { "data-step-heading": true, tabIndex: -1 } : {})} className="text-h3 font-bold focus:outline-none">Personalize a sua reserva</h2>
                  <ul className="mt-5 grid gap-3 md:grid-cols-2">
                    {extras.map((e) => {
                      const Icon = (e.icon && ICONS[e.icon]) || MapPinned;
                      const n = qty(e.id);
                      return (
                        <li key={e.id} className={cn("flex items-center gap-4 rounded-panel border bg-panel p-4", n > 0 ? "border-selected" : "border-line")}>
                          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-card", n > 0 ? "bg-selected text-on-dark" : "bg-panel-alt text-copy-secondary")}>
                            <Icon className="size-5" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-tight">{e.name}</p>
                            <p className="text-body-small text-copy-secondary"><span className="tabular">+ {formatMoney(e.price)}</span>/{e.chargeUnit === "day" ? "dia" : "reserva"}</p>
                            {e.description && <p className="text-caption text-copy-muted">{e.description}</p>}
                          </div>
                          {e.maxQuantity > 1 ? (
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => setQty(e, n - 1)} disabled={n === 0} aria-label={`Remover ${e.name}`} className={QTY_BUTTON}><Minus className="size-4" /></button>
                              <span className="w-6 text-center font-semibold tabular" aria-live="polite">{n}</span>
                              <button type="button" onClick={() => setQty(e, n + 1)} disabled={n >= e.maxQuantity} aria-label={`Adicionar ${e.name}`} className={QTY_BUTTON}><Plus className="size-4" /></button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setQty(e, n ? 0 : 1)}
                              aria-pressed={n > 0}
                              aria-label={n ? `Remover ${e.name}` : `Adicionar ${e.name}`}
                              className={cn("flex size-11 items-center justify-center rounded-control border", n ? "border-selected bg-selected text-on-dark" : "border-line")}
                            >
                              {n ? <Minus className="size-4" /> : <Plus className="size-4" />}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
              {quoteError && <Notice tone="warn">{quoteError}</Notice>}
              <div className="flex justify-end max-lg:hidden">
                <Button size="lg" onClick={() => go(1)} disabled={quoting}>Continuar</Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <form
              id="dados-form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (validateCustomer()) go(2);
              }}
            >
              <h2 data-step-heading tabIndex={-1} className="text-h3 font-bold focus:outline-none">Os seus dados</h2>
              <p className="mt-1 text-body text-copy-secondary">Os dados são enviados para a ficha de cliente no nosso sistema de gestão.</p>
              <Card className="mt-6 p-5 sm:p-6">
                <CustomerForm values={form} errors={errors} onChange={(p) => setForm((f) => ({ ...f, ...p }))} lockEmail={loggedIn && !!customer?.email} />
                {!loggedIn && (
                  <fieldset className="mt-8 border-t border-line pt-6">
                    <legend className="mb-1 font-semibold">Criar a sua conta</legend>
                    <p className="mb-4 text-body-small text-copy-secondary">
                      Para acompanhar a reserva na área de cliente. Já tem conta? <Link href={loginHref(1)} className="font-medium text-brand underline underline-offset-4">Iniciar sessão</Link>
                    </p>
                    <Field label="Password" htmlFor="new-password" required error={errors.password} help="Mínimo 8 caracteres.">
                      <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={errors.password ? true : undefined} />
                    </Field>
                  </fieldset>
                )}
                <div className="mt-8 border-t border-line pt-6">
                  <Field label="Mensagem para a equipa (opcional)" htmlFor="msg" help="Ex.: número do voo e hora de chegada.">
                    <Textarea id="msg" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
                  </Field>
                </div>
              </Card>
              <ErrorSummary count={Object.keys(errors).length} className="mt-6" />
              <div className="mt-6 flex justify-between gap-3">
                <Button type="button" variant="ghost" onClick={() => go(0)}>Voltar</Button>
                <Button type="submit" size="lg" className="max-lg:hidden">Continuar para pagamento</Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div>
              <h2 data-step-heading tabIndex={-1} className="text-h3 font-bold focus:outline-none">Pagamento</h2>
              <Card className="mt-6 p-5 sm:p-6">
                <PaymentForm onChange={setPayment} />
              </Card>
              <Notice className="mt-6" title="Como funciona a confirmação">
                A sua reserva entra no nosso sistema de gestão e é confirmada pela equipa DÉCADA OUSADA. Recebe um email em cada passo.
              </Notice>
              <Checkbox
                className="mt-6"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                label={<>Li e aceito os <Link href="/perguntas-frequentes" className="text-brand underline underline-offset-4">termos e condições</Link> e a política de cancelamento.</>}
              />
              {submitError && (
                <Notice tone="danger" className="mt-6">
                  <p>{submitError.message}</p>
                  {submitError.reason === "vehicle_unavailable" && (
                    <ButtonLink href={alternativesHref} variant="outline" className="mt-3">Ver viaturas para as mesmas datas</ButtonLink>
                  )}
                  {submitError.reason === "session_expired" && (
                    <ButtonLink href={loginHref(2)} variant="outline" className="mt-3">Entrar</ButtonLink>
                  )}
                </Notice>
              )}
              <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <Button type="button" variant="ghost" onClick={() => go(1)} disabled={submitting}>Voltar</Button>
                {!blocked && <div className="max-lg:hidden">{payButton}</div>}
              </div>
              <p className="mt-3 text-right text-caption text-copy-muted max-lg:hidden">{days} {days === 1 ? "dia" : "dias"}, IVA incluído</p>
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky-panel">{summary}</div>
        </aside>
      </div>

      {/* Mobile: total, resumo expansível e ação do passo sempre à vista */}
      <div data-action-bar className="fixed inset-x-0 bottom-0 z-sticky border-t border-line bg-panel shadow-overlay lg:hidden">
        {summaryOpen && (
          <div id="resumo-mobile" className="max-h-96 overflow-y-auto border-b border-line p-4">
            {summary}
          </div>
        )}
        <div className="space-y-3 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p aria-live="polite" className="text-body-small text-copy-secondary">
              Total <span className="ml-1 text-h4 font-bold text-copy tabular">{formatMoney(quote.total, "EUR", { decimals: true })}</span>
              {quoting && <span className="sr-only">, a atualizar</span>}
            </p>
            <button
              type="button"
              aria-expanded={summaryOpen}
              aria-controls="resumo-mobile"
              onClick={() => setSummaryOpen((o) => !o)}
              className="flex min-h-11 items-center gap-1 text-body-small font-medium text-copy underline underline-offset-4"
            >
              {summaryOpen ? "Fechar resumo" : "Ver resumo"}
              <ChevronDown className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} aria-hidden />
            </button>
          </div>
          {mobileAction}
        </div>
      </div>
    </div>
  );
}
