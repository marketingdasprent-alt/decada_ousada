"use client";

import { CheckCircle2, CreditCard, Landmark, Lock, Smartphone } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";

import { Field, Input } from "../shared/form";

export type PaymentMethodChoice = "card" | "mbway" | "multibanco";

export interface PaymentDraft {
  method: PaymentMethodChoice;
  /** Token devolvido pelo fornecedor. Na demo é simulado: o número do cartão nunca sai do browser. */
  token: string;
  phone?: string;
  valid: boolean;
}

const METHODS: Array<{ id: PaymentMethodChoice; label: string; icon: typeof CreditCard }> = [
  { id: "card", label: "Cartão de crédito/débito", icon: CreditCard },
  { id: "mbway", label: "MB WAY", icon: Smartphone },
  { id: "multibanco", label: "Referência Multibanco", icon: Landmark },
];

/**
 * UI de pagamento (doc §24, §65). O fornecedor ainda não está definido:
 * quando estiver, os campos do cartão passam a ser os "hosted fields"/iframe do fornecedor
 * e este componente recebe apenas o token. Aqui os dados do cartão NÃO são enviados ao servidor.
 */
export function PaymentForm({ onChange }: { onChange: (draft: PaymentDraft) => void }) {
  const id = useId();
  const [method, setMethod] = useState<PaymentMethodChoice>("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [phone, setPhone] = useState("");

  function emit(next: { method?: PaymentMethodChoice; card?: typeof card; phone?: string }) {
    const m = next.method ?? method;
    const c = next.card ?? card;
    const p = next.phone ?? phone;
    const digits = c.number.replace(/\D/g, "");
    let valid = false;
    let token = "";
    if (m === "card") {
      valid = digits.length >= 15 && /^\d{2}\/\d{2}$/.test(c.expiry) && /^\d{3,4}$/.test(c.cvv) && c.name.trim().length > 2;
      // Simulação: 4000 0000 0000 0002 é recusado
      token = valid ? (digits === "4000000000000002" ? "tok_fail" : `tok_demo_${digits.slice(-4)}`) : "";
    } else if (m === "mbway") {
      valid = /^9\d{8}$/.test(p.replace(/\D/g, "").slice(-9));
      token = valid ? "tok_mbway" : "";
    } else {
      valid = true;
      token = "tok_multibanco";
    }
    onChange({ method: m, token, phone: m === "mbway" ? p : undefined, valid });
  }

  const fmtNumber = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const fmtExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <div>
      <fieldset>
        <legend className="mb-3 font-semibold">Método de pagamento</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {METHODS.map(({ id: m, label, icon: Icon }) => (
            <label
              key={m}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-card border-2 p-4 text-body-small font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                method === m ? "border-selected bg-selected-surface" : "border-line bg-panel hover:border-copy/20",
              )}
            >
              <input
                type="radio"
                name={`${id}-method`}
                value={m}
                checked={method === m}
                onChange={() => {
                  setMethod(m);
                  emit({ method: m });
                }}
                className="sr-only"
              />
              <Icon className={cn("size-5", method === m ? "text-copy" : "text-copy-muted")} aria-hidden />
              <span className="flex-1">{label}</span>
              {method === m && <CheckCircle2 className="size-5 text-copy" aria-hidden />}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        {method === "card" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Número do cartão" htmlFor={`${id}-num`} className="sm:col-span-2">
              <Input
                id={`${id}-num`}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={(e) => {
                  const c = { ...card, number: fmtNumber(e.target.value) };
                  setCard(c);
                  emit({ card: c });
                }}
              />
            </Field>
            <Field label="Nome no cartão" htmlFor={`${id}-name`} className="sm:col-span-2">
              <Input id={`${id}-name`} autoComplete="cc-name" value={card.name} onChange={(e) => { const c = { ...card, name: e.target.value }; setCard(c); emit({ card: c }); }} />
            </Field>
            {/* Validade e CVV juntos, com a largura do que se escreve */}
            <div className="flex gap-4 sm:col-span-2">
            <Field label="Validade" htmlFor={`${id}-exp`} className="min-w-0 flex-1 max-w-field-short">
              <Input id={`${id}-exp`} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={card.expiry} onChange={(e) => { const c = { ...card, expiry: fmtExpiry(e.target.value) }; setCard(c); emit({ card: c }); }} />
            </Field>
            <Field label="CVV" htmlFor={`${id}-cvv`} className="min-w-0 flex-1 max-w-field-short">
              <Input id={`${id}-cvv`} inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvv} onChange={(e) => { const c = { ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }; setCard(c); emit({ card: c }); }} />
            </Field>
            </div>
          </div>
        )}
        {method === "mbway" && (
          <Field label="Telemóvel associado ao MB WAY" htmlFor={`${id}-phone`} help="Vai receber um pedido de pagamento na app MB WAY.">
            <Input id={`${id}-phone`} type="tel" inputMode="tel" placeholder="912 345 678" value={phone} onChange={(e) => { setPhone(e.target.value); emit({ phone: e.target.value }); }} />
          </Field>
        )}
        {method === "multibanco" && (
          <p className="rounded-card bg-panel-alt p-4 text-body-small text-copy-secondary">
            A referência Multibanco é gerada depois de confirmar. A reserva fica pendente até o pagamento ser recebido.
          </p>
        )}
      </div>

      <p className="mt-5 flex items-center gap-2 text-caption text-copy-muted">
        <Lock className="size-3.5" aria-hidden /> Pagamento seguro. Os dados do cartão são tratados diretamente pelo fornecedor de pagamentos.
      </p>
      <p className="mt-1 text-caption text-copy-muted">Ambiente de demonstração: nenhum valor é cobrado. Cartão de teste recusado: 4000 0000 0000 0002.</p>
    </div>
  );
}
