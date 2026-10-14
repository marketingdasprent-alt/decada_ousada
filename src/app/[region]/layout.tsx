import type { Metadata } from "next";
import { Anton, Archivo } from "next/font/google";
import { Suspense } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { REGION_CONFIG } from "@/domain/region";
import { META_PIXEL_ID } from "@/lib/meta-pixel";
import { regionFromParams, regionStaticParams } from "@/lib/region";

import "../globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], display: "swap" });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400", display: "swap" });

export function generateStaticParams() {
  return regionStaticParams();
}

export async function generateMetadata({ params }: LayoutProps<"/[region]">): Promise<Metadata> {
  const region = await regionFromParams(params);
  const cfg = REGION_CONFIG[region];
  return {
    metadataBase: new URL(`https://${cfg.host}`),
    title: { default: cfg.seo.title, template: `%s | DÉCADA OUSADA${region === "azores" ? " Açores" : ""}` },
    description: cfg.seo.description,
    icons: { icon: cfg.logo.square },
    openGraph: { siteName: "DÉCADA OUSADA", locale: "pt_PT", type: "website", images: [cfg.logo.square] },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[region]">) {
  const region = await regionFromParams(params);
  return (
    <html lang="pt-PT" data-region={region} className={`${archivo.variable} ${anton.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#conteudo" className="skip-link">
          Saltar para o conteúdo
        </a>
        {/* Logo a seguir ao salto: o aviso de cookies é o primeiro a ser lido e focado (a posição no ecrã é fixa) */}
        {META_PIXEL_ID && (
          <Suspense fallback={null}>
            <CookieConsent pixelId={META_PIXEL_ID} />
          </Suspense>
        )}
        <SiteHeader region={region} />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <SiteFooter region={region} />
      </body>
    </html>
  );
}
