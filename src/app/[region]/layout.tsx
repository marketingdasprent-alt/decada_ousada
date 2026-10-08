import type { Metadata } from "next";
import { Anton, Archivo } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { REGION_CONFIG } from "@/domain/region";
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
        <SiteHeader region={region} />
        {process.env.WEGEST_MODE !== "http" && (
          <p role="note" className="bg-caution-surface px-4 py-2 text-center text-caption font-medium text-caution">
            Ambiente de demonstração: viaturas, preços, locais e disponibilidade são fictícios até à ligação ao sistema de gestão.
          </p>
        )}
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <SiteFooter region={region} />
      </body>
    </html>
  );
}
