import "server-only";

/**
 * CAPTCHA dos formulários públicos (Cloudflare Turnstile, docs/motoristas-formularios.md).
 * Com TURNSTILE_SECRET_KEY o token é obrigatório e verificado na Cloudflare; sem ela (ainda
 * não configurado) o formulário fica só com o campo-armadilha contra robôs.
 */
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 8000;

export const captchaRequired = () => !!process.env.TURNSTILE_SECRET_KEY;

export async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(TIMEOUT_MS) });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[captcha] verificação indisponível:", err instanceof Error ? err.message : "erro desconhecido");
    return false;
  }
}
