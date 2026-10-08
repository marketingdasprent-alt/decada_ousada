"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Painel aberto por cima da página (drawer, menu móvel): Esc fecha, Tab fica
 * dentro do painel e o foco volta ao botão que o abriu (WCAG 2.1.2, 2.4.3).
 * `includeTrigger` mantém o botão de abrir/fechar no ciclo de Tab, para
 * painéis que não tapam esse botão.
 */
export function useFocusTrap({
  open,
  onClose,
  container,
  trigger,
  includeTrigger = false,
}: {
  open: boolean;
  onClose: () => void;
  container: RefObject<HTMLElement | null>;
  trigger: RefObject<HTMLElement | null>;
  includeTrigger?: boolean;
}) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const returnTo = trigger.current;
    const items = () => {
      const inside = [...(container.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((el) => el.offsetParent !== null);
      return includeTrigger && returnTo ? [returnTo, ...inside] : inside;
    };
    (container.current?.querySelector<HTMLElement>(FOCUSABLE) ?? container.current)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const outside = !active || !list.includes(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnTo?.focus();
    };
  }, [open, container, trigger, includeTrigger]);
}
