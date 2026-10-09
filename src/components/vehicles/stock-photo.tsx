"use client";

import Image from "next/image";

import { isUnsplash, unsplashLoader } from "@/lib/unsplash";

/**
 * Fotografia de banco de imagens (dados de demonstração): pelo CDN do Unsplash, ou uma cópia
 * em `public/demo/` quando foi editada (matrículas desfocadas). Chega sempre em 5:3 (a proporção dos enquadramentos); `object-contain` garante que,
 * num enquadramento de outra proporção, a foto nunca é cortada (sobra fundo neutro).
 */
export function StockPhoto({ src, alt, sizes, priority }: { src: string; alt: string; sizes: string; priority?: boolean }) {
  return <Image src={src} alt={alt} fill sizes={sizes} className="object-contain" priority={priority} loader={isUnsplash(src) ? unsplashLoader : undefined} />;
}
