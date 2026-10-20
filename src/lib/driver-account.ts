/**
 * Contas de motorista: são contas do WeGest (Supabase Auth do WeGest), as mesmas do portal e
 * da app do motorista. O browser regista e entra diretamente no WeGest com a chave pública;
 * o site nunca cria contas (guia "Contas de motorista no site da Década", WeGest 2026-10-14).
 *
 * Estes três valores são públicos (não são segredo). A chave wg_ra_… continua só no servidor.
 */
export const DRIVER_AUTH = {
  url: process.env.NEXT_PUBLIC_WEGEST_AUTH_URL ?? "",
  publishableKey: process.env.NEXT_PUBLIC_WEGEST_AUTH_KEY ?? "",
  orgId: process.env.NEXT_PUBLIC_WEGEST_ORG_ID ?? "",
};

/** Sem os valores, /entrar e a candidatura mantêm as contas próprias do site (demo e desenvolvimento). */
export const driverAuthEnabled = () => Boolean(DRIVER_AUTH.url && DRIVER_AUTH.publishableKey && DRIVER_AUTH.orgId);

/** Painel da conta (o mesmo para cliente e motorista): destino depois de entrar e de "A minha conta". */
export const DRIVER_ACCOUNT = "/minha-conta";

/** Destinos dos links de email. Têm de estar autorizados no WeGest para cada domínio. */
export const DRIVER_CONFIRM_PATH = "/entrar?confirmado=1";
export const DRIVER_NEW_PASSWORD_PATH = "/nova-password";

/** A mesma regra do WeGest: mínimo 8 caracteres, com pelo menos uma letra e um número. */
export function driverPasswordError(password: string): string | null {
  if (password.length >= 8 && /\p{L}/u.test(password) && /\d/.test(password)) return null;
  return "A password precisa de 8 caracteres, com letras e números.";
}

/**
 * Mensagens para o motorista a partir dos erros do Supabase Auth do WeGest. A mensagem técnica
 * nunca é mostrada; o que não está na lista cai numa mensagem genérica.
 */
const AUTH_MESSAGES: Array<[test: (m: string) => boolean, message: string]> = [
  [(m) => m.includes("captcha"), "A verificação de segurança expirou ou falhou. Conclua-a novamente."],
  [(m) => m.includes("invalid login credentials"), "Email ou password errados."],
  [(m) => m.includes("email not confirmed"), "Confirme primeiro o email. Abra o link que lhe enviámos."],
  [(m) => m.includes("pwned"), "Esta password apareceu em fugas de dados. Escolha outra."],
  [(m) => m.includes("weak_password") || m.includes("password should"), "A password precisa de 8 caracteres, com letras e números."],
  [(m) => m.includes("rate limit") || m.includes("too many"), "Demasiadas tentativas. Aguarde uns minutos."],
  [(m) => m.includes("failed to fetch") || m.includes("network"), "Falha de ligação. Tente de novo."],
  [(m) => m.includes("invalid") && m.includes("email"), "O email não é válido."],
];

export function driverAuthMessage(error: { message?: string; code?: string } | null | undefined): string {
  const text = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return AUTH_MESSAGES.find(([test]) => test(text))?.[1] ?? "Não foi possível concluir o pedido. Tente de novo.";
}

export const isEmailNotConfirmed = (error: { message?: string; code?: string } | null | undefined) =>
  `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase().includes("not confirmed");
