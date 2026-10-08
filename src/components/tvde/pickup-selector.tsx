"use client";

import { CalendarCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AVAILABILITY_LABEL, type Availability } from "@/domain/availability";
import type { Location } from "@/domain/location";
import { addDays, formatDate, TIME_SLOTS } from "@/lib/dates";
import { apiFetch } from "@/lib/fetcher";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { useToday } from "@/lib/use-today";

import { Input, Label, Select } from "../shared/form";
import { Notice } from "../shared/states";
import { buttonClass, disabledButtonClass } from "../shared/ui";

/**
 * Escolha de data, hora e local de levantamento TVDE (doc §47–48).
 * Cada alteração dispara nova consulta de disponibilidade ao WeGest.
 */
export function PickupSelector({ vehicleId, locations }: { vehicleId: string; locations: Location[] }) {
  const pickupLocations = locations.filter((l) => l.pickupAvailable);
  const today = useToday();
  const minDate = today ? addDays(today, 1) : "";
  const [pickedDate, setDate] = useState("");
  const date = pickedDate || (today ? addDays(today, 2) : "");
  const [time, setTime] = useState("10:00");
  const [locationId, setLocationId] = useState(pickupLocations[0]?.id ?? "");
  // Resultado associado à consulta que o gerou: "loading" é derivado, não guardado
  const [result, setResult] = useState<{ key: string; availability?: Availability; error?: string } | null>(null);
  const key = date && locationId ? `${date}T${time}|${locationId}` : "";

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const qs = new URLSearchParams({ viatura: vehicleId, inicio: `${date}T${time}`, local: locationId });
      const res = await apiFetch<Availability>(`/api/tvde/availability?${qs}`);
      if (cancelled) return;
      setResult(res.ok ? { key, availability: res.data } : { key, error: res.error.message });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [key, date, time, locationId, vehicleId]);

  const state: { status: "idle" | "loading" | "done" | "error"; availability?: Availability; error?: string } = !key
    ? { status: "idle" }
    : result?.key !== key
      ? { status: "loading" }
      : result.error
        ? { status: "error", error: result.error }
        : { status: "done", availability: result.availability };

  const available = state.status === "done" && state.availability?.status !== "unavailable";
  const href = `/tvde/candidatura?${new URLSearchParams({ viatura: vehicleId, inicio: `${date}T${time}`, local: locationId })}`;

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-body-small font-medium text-copy-secondary">Onde pretende levantar a viatura?</legend>
        <div className="space-y-2">
          {pickupLocations.map((l) => (
            <label key={l.id} className={cn("flex cursor-pointer items-center gap-3 rounded-card border-2 px-4 py-3 text-body-small has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus", locationId === l.id ? "border-selected bg-selected-surface" : "border-line")}>
              <input type="radio" name="tvde-location" value={l.id} checked={locationId === l.id} onChange={() => setLocationId(l.id)} className="accent-selected" />
              <span className="font-medium">{l.name}</span>
              {l.openingHours && <span className="ml-auto text-caption text-copy-muted">{l.openingHours}</span>}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-date-time gap-3">
        <div>
          <Label htmlFor="tvde-date">Data de levantamento</Label>
          <Input id="tvde-date" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="tvde-time">Hora</Label>
          <Select id="tvde-time" value={time} onChange={(e) => setTime(e.target.value)}>
            {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
      </div>

      <div aria-live="polite" className="min-h-12">
        {state.status === "loading" && (
          <p className="flex items-center gap-2 text-body-small text-copy-muted"><Loader2 className="size-4 animate-spin" aria-hidden /> A verificar disponibilidade…</p>
        )}
        {state.status === "done" && state.availability && (
          <Notice tone={available ? "ok" : "warn"}>
            {available
              ? `${AVAILABILITY_LABEL[state.availability.status]} para levantamento a ${formatDate(date)} às ${time}.`
              : `Indisponível nesta data.${state.availability.nextAvailableAt ? ` Próxima data: ${formatDate(state.availability.nextAvailableAt.slice(0, 10))}.` : ""}`}
          </Notice>
        )}
        {state.status === "error" && <Notice tone="danger">{state.error}</Notice>}
      </div>

      {available ? (
        <Link href={href} onClick={() => track("tvde_pickup_selected", { vehicleId })} className={buttonClass("primary", "lg", "w-full")}>
          <CalendarCheck className="size-5" aria-hidden /> Candidatar-me a esta viatura
        </Link>
      ) : (
        <span className={disabledButtonClass("lg", "w-full")} aria-disabled>Candidatar-me a esta viatura</span>
      )}
    </div>
  );
}
