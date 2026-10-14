"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { AnalyticsData, AnalyticsEvent } from "@/lib/analytics";
import { CONSENT_EVENT, CONSENT_OPEN_EVENT, openConsentSettings, readConsent, saveConsent, type Consent } from "@/lib/consent";
import { loadPixel, pixelPageView, pixelTrack, revokePixel } from "@/lib/meta-pixel";

import { Checkbox } from "./form";
import { Button } from "./ui";

/** Antes da hidratação não se sabe a escolha: nem aviso nem pixel. */
const UNKNOWN = "unknown";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const snapshot = () => {
  const c = readConsent();
  return c ? `${c.marketing ? 1 : 0}:${c.at}` : "";
};

function useConsent(): Consent | null | typeof UNKNOWN {
  const raw = useSyncExternalStore(subscribe, snapshot, () => UNKNOWN);
  if (raw === UNKNOWN) return UNKNOWN;
  if (!raw) return null;
  const [m, at] = [raw.slice(0, 1), raw.slice(2)];
  return { marketing: m === "1", at };
}

/**
 * Aviso de cookies, preferências e Meta Pixel (montado no layout só quando há id do pixel).
 * O pixel carrega logo na primeira visita, com o aviso ainda aberto (DECISIONS.md 2026-10-14),
 * e só para com "Só necessários" ou com marketing desligado nas preferências: deixa de enviar
 * e o cookie _fbp é apagado. Recebe os eventos do funil (`do:analytics`) e um PageView por
 * cada página vista, também na navegação sem recarregar.
 */
export function CookieConsent({ pixelId }: { pixelId: string }) {
  const consent = useConsent();
  const marketing = consent !== UNKNOWN && consent?.marketing !== false;
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(false);
  const loaded = useRef(false);
  const banner = useRef<HTMLElement>(null);
  const bannerOpen = consent === null;

  // Enquanto o aviso está aberto, a página reserva o espaço dele (globals.css): o foco e o fim da
  // página não ficam por baixo da faixa, e a barra de ação do checkout sobe para cima dela
  useEffect(() => {
    const el = banner.current;
    if (!bannerOpen || !el) return;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => root.style.setProperty("--consent-banner-h", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--consent-banner-h");
    };
  }, [bannerOpen]);

  // Liga ou desliga o pixel conforme a escolha
  useEffect(() => {
    if (marketing) {
      loadPixel(pixelId);
      loaded.current = true;
    } else if (loaded.current) {
      revokePixel();
    }
  }, [marketing, pixelId]);

  useEffect(() => {
    if (marketing) pixelPageView();
  }, [marketing, pathname]);

  useEffect(() => {
    if (!marketing) return;
    const onEvent = (e: Event) => {
      const { name, data } = (e as CustomEvent<{ name: AnalyticsEvent; data: AnalyticsData }>).detail;
      pixelTrack(name, data);
    };
    window.addEventListener("do:analytics", onEvent);
    return () => window.removeEventListener("do:analytics", onEvent);
  }, [marketing]);

  // "Cookies" no rodapé (ou noutra página) abre as preferências com a escolha atual
  useEffect(() => {
    const open = () => {
      setDraft(readConsent()?.marketing ?? true);
      dialog.current?.showModal();
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  const save = (value: boolean) => {
    saveConsent(value);
    dialog.current?.close();
  };

  return (
    <>
      {consent === null && (
        <section ref={banner} aria-label="Aviso de cookies" className="fixed inset-x-0 bottom-0 z-overlay border-t border-line bg-panel shadow-overlay">
          <div className="layout-container flex flex-col gap-2 py-3 lg:grid lg:grid-main-aside lg:items-center lg:gap-x-8 lg:gap-y-1">
            <p className="text-body-small text-copy-secondary lg:col-start-1">
              Usamos cookies necessários para o site funcionar e cookies de marketing da Meta para medir as nossas campanhas. Pode recusar os de marketing.
            </p>
            <div className="grid grid-cols-2 gap-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <Button onClick={() => save(true)}>Aceitar tudo</Button>
              <Button variant="dark" onClick={() => save(false)}>Só necessários</Button>
            </div>
            <div className="flex flex-wrap gap-x-6 text-body-small lg:col-start-1 lg:row-start-2">
              <button type="button" className="cursor-pointer font-medium text-copy underline underline-offset-4 max-md:tap-target" onClick={openConsentSettings}>Gerir preferências</button>
              <Link href="/privacidade#cookies" className="font-medium text-copy underline underline-offset-4 max-md:tap-target">Política de cookies</Link>
            </div>
          </div>
        </section>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="cookies-titulo"
        className="m-auto w-full max-w-lg rounded-panel bg-panel p-0 text-copy shadow-overlay backdrop:bg-overlay max-sm:mb-0 max-sm:rounded-b-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 sm:px-6">
          <h2 id="cookies-titulo" className="display text-h3">Preferências de cookies</h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Fechar preferências de cookies"
            className="flex size-11 items-center justify-center rounded-control hover:bg-panel-sunken"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div>
            <Checkbox label={<span className="font-semibold text-copy">Necessários</span>} checked disabled readOnly />
            <p className="mt-1 pl-7.5 text-caption text-copy-muted">Sessão da área de cliente e esta escolha. Sempre ativos, porque o site não funciona sem eles.</p>
          </div>
          <div>
            <Checkbox label={<span className="font-semibold text-copy">Marketing (Meta Pixel)</span>} checked={draft} onChange={(e) => setDraft(e.target.checked)} />
            <p className="mt-1 pl-7.5 text-caption text-copy-muted">Mede as visitas e os pedidos que chegam das campanhas no Facebook e no Instagram. Não enviamos nomes, emails nem telefones.</p>
          </div>
          <p className="text-caption text-copy-muted">
            Saiba mais na <Link href="/privacidade" className="underline underline-offset-4" onClick={() => dialog.current?.close()}>política de privacidade e cookies</Link>.
          </p>
        </div>
        <div className="flex justify-end border-t border-line px-5 py-4 sm:px-6">
          <Button onClick={() => save(draft)}>Guardar preferências</Button>
        </div>
      </dialog>
    </>
  );
}

/**
 * Abre as preferências de cookies (rodapé, página de privacidade). É um link para a secção de
 * cookies de /privacidade: sem JavaScript leva lá; com JavaScript abre o diálogo.
 */
export function CookieSettingsButton({ className, children = "Preferências de cookies" }: { className?: string; children?: string }) {
  return (
    <Link
      href="/privacidade#cookies"
      className={className}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openConsentSettings();
      }}
    >
      {children}
    </Link>
  );
}
