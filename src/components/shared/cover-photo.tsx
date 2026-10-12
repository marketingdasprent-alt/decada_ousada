"use client";

import Image from "next/image";

import { cn } from "@/lib/cn";
import { isUnsplash, unsplashLoader } from "@/lib/unsplash";

/**
 * Foto que cobre o bloco onde está (o pai tem de ser `relative`). Pelo CDN do Unsplash
 * quando é de lá, na largura que o browser pede. Decorativa por omissão (`alt=""`).
 */
export function CoverPhoto({ src, alt = "", sizes, position, className, priority }: { src: string; alt?: string; sizes: string; position?: string; className?: string; priority?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loader={isUnsplash(src) ? unsplashLoader : undefined}
      className={cn("object-cover", className)}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}
