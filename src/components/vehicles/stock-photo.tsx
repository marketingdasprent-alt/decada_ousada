"use client";

import Image, { type ImageLoader } from "next/image";

/** CDN do Unsplash: pede a largura que o browser precisa (até 3840 px), em vez da foto original. */
const unsplashLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  if (quality) url.searchParams.set("q", String(quality));
  return url.toString();
};

/**
 * Fotografia de banco de imagens (dados de demonstração), servida pelo CDN do Unsplash.
 * O CDN já a entrega em 5:3 (a proporção dos enquadramentos); `object-contain` garante que,
 * num enquadramento de outra proporção, a foto nunca é cortada (sobra fundo neutro).
 */
export function StockPhoto({ src, alt, sizes, priority }: { src: string; alt: string; sizes: string; priority?: boolean }) {
  return <Image src={src} alt={alt} fill sizes={sizes} className="object-contain" priority={priority} loader={unsplashLoader} />;
}
