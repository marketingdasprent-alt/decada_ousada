"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { DRIVER_FORMS, type DriverMode } from "@/domain/drivers";

import { buttonClass } from "../shared/ui";

import { ModeSwitch, useModeFromHash } from "./mode-switch";

const WEGEST_ORIGIN = "https://www.wegest.pt";
/** Sem a primeira mensagem de altura neste tempo, o WeGest não deixou incorporar: mostra a alternativa. */
const LOAD_TIMEOUT_MS = 8000;

const TITLE: Record<DriverMode, string> = {
  aluguer: "Formulário de candidatura para alugar uma viatura",
  slot: "Formulário de candidatura para trabalhar como Slot",
};

/**
 * Formulários do WeGest incorporados (pedido da equipa, 2026-10-13): `?embed=1` e a altura
 * vem do próprio formulário por postMessage ({ tipo: "wegest-formulario:altura", altura }).
 * Enquanto o WeGest enviar X-Frame-Options: DENY o browser não mostra o iframe; aí não chega
 * nenhuma mensagem e aparece o botão para abrir o formulário noutro separador.
 */
export function DriverFormEmbed({ initialMode = "aluguer", inDialog = false }: { initialMode?: DriverMode; inDialog?: boolean }) {
  const uid = useId();
  const [mode, setMode] = useState<DriverMode>(initialMode);
  const [height, setHeight] = useState<number | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [visible, setVisible] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);

  const choose = useCallback((m: DriverMode) => {
    setMode(m);
    setHeight(null);
    setBlocked(false);
  }, []);
  useModeFromHash(choose, !inDialog);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== WEGEST_ORIGIN || event.source !== frame.current?.contentWindow) return;
      const data = (event.data ?? {}) as { tipo?: unknown; altura?: unknown };
      if (data.tipo !== "wegest-formulario:altura" || typeof data.altura !== "number") return;
      setHeight(Math.ceil(data.altura));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // O iframe é lazy: só conta o tempo depois de o formulário estar à vista
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A cada formulário novo, espera pela primeira altura; sem ela, o WeGest bloqueou a incorporação
  useEffect(() => {
    if (!visible || height !== null) return;
    const timer = window.setTimeout(() => setBlocked(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [visible, mode, height]);

  // No popup o endereço muda a cada abertura (`v`): um browser que guardou uma resposta do WeGest
  // com bloqueio (X-Frame-Options / frame-ancestors) nunca a reutiliza. O WeGest revalida com 304,
  // e um 304 não apaga da cache o cabeçalho antigo. A página do WeGest já é max-age=0: não se perde cache.
  const [openedAt] = useState(() => Date.now().toString(36));
  const src = `${DRIVER_FORMS[mode]}?embed=1&origem=site${inDialog ? `&v=${openedAt}` : ""}`;

  return (
    <div className={inDialog ? undefined : "rounded-panel border border-line bg-panel p-6 sm:p-8"}>
      {/* No popup a escolha já foi feita no botão: mostra logo o formulário */}
      {!inDialog && <ModeSwitch mode={mode} onChange={choose} labelId={`${uid}-modo`} />}

      <div ref={box} className={inDialog ? undefined : "mt-6"}>
        {blocked ? (
          <div className={inDialog ? "m-5 rounded-panel bg-panel-alt p-5" : "rounded-panel bg-panel-alt p-5"}>
            <p className="font-semibold">O formulário abre noutro separador.</p>
            <p className="mt-1 text-body-small text-copy-secondary">É o formulário de candidatura da DÉCADA OUSADA, no sistema de gestão. São cerca de 2 minutos.</p>
            <a href={DRIVER_FORMS[mode]} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg", "mt-4")}>
              {mode === "aluguer" ? "Abrir o formulário de Aluguer" : "Abrir o formulário de Slot"}
              <span className="sr-only">(abre noutro separador)</span>
            </a>
          </div>
        ) : (
          <iframe
            key={mode}
            ref={frame}
            src={src}
            title={TITLE[mode]}
            loading={inDialog ? "eager" : "lazy"}
            className="block min-h-150 w-full border-0"
            style={height ? { height } : undefined}
          />
        )}
      </div>
    </div>
  );
}
