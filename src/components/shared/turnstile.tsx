"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
const api = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

/**
 * Verificação "não sou um robô" (Cloudflare Turnstile), a mesma do formulário de /motoristas.
 * Só aparece com `siteKey` (TURNSTILE_SITE_KEY). Para pedir um token novo depois de um envio
 * falhado, mudar a `key` do componente.
 */
export function TurnstileWidget({ siteKey, onToken, errorId, size = "normal" }: { siteKey: string; onToken: (token: string) => void; errorId?: string; size?: "normal" | "compact" }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);

  const render = useCallback(() => {
    const t = api();
    if (!box.current || !t || widget.current) return;
    widget.current = t.render(box.current, {
      sitekey: siteKey,
      language: "pt-PT",
      theme: "light",
      size,
      callback: (token: string) => onToken(token),
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
    });
  }, [siteKey, onToken, size]);

  // O script pode já estar carregado (navegação no site): desenha sem esperar pelo onReady
  useEffect(() => {
    render();
    return () => {
      const t = api();
      if (widget.current && t) t.remove(widget.current);
      widget.current = null;
    };
  }, [render]);

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={render} />
      <div ref={box} aria-describedby={errorId} />
    </>
  );
}
