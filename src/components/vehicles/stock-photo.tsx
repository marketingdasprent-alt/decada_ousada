"use client";

import Image from "next/image";

import { unsplashLoader } from "@/lib/unsplash";

/**
 * Fotografia de banco de imagens (dados de demonstração), servida pelo CDN do Unsplash.
 * O CDN já a entrega em 5:3 (a proporção dos enquadramentos); `object-contain` garante que,
 * num enquadramento de outra proporção, a foto nunca é cortada (sobra fundo neutro).
 */
export function StockPhoto({ src, alt, sizes, priority }: { src: string; alt: string; sizes: string; priority?: boolean }) {
  return <Image src={src} alt={alt} fill sizes={sizes} className="object-contain" priority={priority} loader={unsplashLoader} />;
}
