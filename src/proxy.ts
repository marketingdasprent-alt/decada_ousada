import { NextResponse, type NextRequest } from "next/server";

import { isLiveDomain, isRegion, regionFromHost, type Region } from "@/domain/region";

/**
 * Multi-região num único deploy (doc §5, §110):
 *   www.decadaousada.pt/...      → /mainland/...
 *   acores.decadaousada.pt/...   → /azores/...
 *
 * Fora do domínio real (localhost, pré-visualizações *.vercel.app): acores.localhost:3000
 * ou ?regiao=acores (fica em cookie). No domínio real a região vem só do domínio.
 * As rotas /api recebem a região no cabeçalho x-do-region.
 */
const DEV_COOKIE = "do_region_dev";

function resolveRegion(req: NextRequest): { region: Region; setDevCookie?: Region } {
  const host = req.headers.get("host");
  const fromHost = regionFromHost(host);
  if (fromHost === "azores" || isLiveDomain(host)) return { region: fromHost };

  const q = req.nextUrl.searchParams.get("regiao");
  if (q === "acores" || q === "continente") {
    const r: Region = q === "acores" ? "azores" : "mainland";
    return { region: r, setDevCookie: r };
  }
  const cookie = req.cookies.get(DEV_COOKIE)?.value;
  return { region: isRegion(cookie) ? cookie : fromHost };
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { region, setDevCookie } = resolveRegion(req);

  const headers = new Headers(req.headers);
  headers.set("x-do-region", region);

  let res: NextResponse;
  if (pathname.startsWith("/api/")) {
    res = NextResponse.next({ request: { headers } });
  } else if (/^\/(mainland|azores)(\/|$)/.test(pathname)) {
    // O segmento interno nunca aparece no URL público
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(mainland|azores)/, "") || "/";
    res = NextResponse.redirect(url);
  } else {
    const url = req.nextUrl.clone();
    url.pathname = `/${region}${pathname === "/" ? "" : pathname}`;
    res = NextResponse.rewrite(url, { request: { headers } });
  }

  if (setDevCookie) res.cookies.set(DEV_COOKIE, setDevCookie, { path: "/", sameSite: "lax" });
  return res;
}

export const config = {
  matcher: ["/((?!_next/|brand/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico|txt|xml)$).*)"],
};
