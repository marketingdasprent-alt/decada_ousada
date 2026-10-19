"use client";

import { useState } from "react";
import { TurnstileWidget } from "../shared/turnstile";
import { Notice } from "../shared/states";

/** A chave pública corresponde ao CAPTCHA configurado no Supabase Auth do WeGest. */
export function useAuthCaptcha() {
  const siteKey = process.env.NEXT_PUBLIC_WEGEST_AUTH_CAPTCHA_SITE_KEY ?? "";
  const [token, setToken] = useState("");
  const [generation, setGeneration] = useState(0);
  return {
    token,
    ready: Boolean(siteKey && token),
    configured: Boolean(siteKey),
    reset() { setToken(""); setGeneration((value) => value + 1); },
    field: siteKey ? <TurnstileWidget key={generation} siteKey={siteKey} size="compact" onToken={setToken} /> : null,
  };
}

export function RegistrationUnavailable() {
  return <Notice tone="warn">O registo está temporariamente indisponível. Tente novamente mais tarde.</Notice>;
}
