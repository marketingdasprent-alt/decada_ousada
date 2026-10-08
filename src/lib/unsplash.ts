import type { ImageLoader } from "next/image";

/** CDN do Unsplash: pede a largura que o browser precisa (até 3840 px), em vez da foto original. */
export const unsplashLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  if (quality) url.searchParams.set("q", String(quality));
  return url.toString();
};
