import Image from "next/image";

import type { VehicleImage as VehicleImageType } from "@/domain/vehicle";
import { cn } from "@/lib/cn";

import { CarIllustration } from "./car-illustration";
import { StockPhoto } from "./stock-photo";

/** Fotos de demonstração: CDN do Unsplash ou cópias editadas em `public/demo/`. */
const isStock = (url: string) => url.startsWith("https://images.unsplash.com/") || url.startsWith("/demo/");

/**
 * Fotografia da viatura. Usa a URL do WeGest quando existe; caso contrário, ilustração.
 * As URLs do WeGest são temporárias (24 h): nunca guardar o link, só o modelo.
 */
export function VehicleImage({
  image,
  className,
  sizes,
  priority,
  surface = "light",
}: {
  image?: VehicleImageType;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Fundo da ilustração: claro (Rent a Car) ou escuro (card TVDE). */
  surface?: "light" | "dark";
}) {
  if (!image || !image.url) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <CarIllustration paint={image?.placeholder?.paint} body={image?.placeholder?.body} surface={surface} label={image?.alt} />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden bg-panel-sunken", className)}>
      {isStock(image.url) ? (
        <StockPhoto src={image.url} alt={image.alt} sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"} priority={priority} />
      ) : (
        <Image src={image.url} alt={image.alt} fill sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"} className="object-cover" priority={priority} unoptimized />
      )}
    </div>
  );
}
