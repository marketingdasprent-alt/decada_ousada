"use client";

import { useState } from "react";

import type { VehicleImage as VehicleImageType } from "@/domain/vehicle";
import { cn } from "@/lib/cn";

import { VehicleImage } from "./vehicle-image";

export function VehicleGallery({ images, name }: { images: VehicleImageType[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ url: "", alt: name }];
  const illustrated = list.some((i) => !i.url || i.illustrative);

  return (
    <div>
      <div className="relative">
        <VehicleImage image={list[active]} className="aspect-vehicle rounded-panel" sizes="(min-width: 1024px) 60vw, 100vw" priority />
        {illustrated && (
          <span className="absolute bottom-3 left-3 rounded-control bg-panel/85 px-2 py-1 text-caption font-medium text-copy-muted backdrop-blur">
            Imagem ilustrativa
          </span>
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3" role="tablist" aria-label={`Fotografias de ${name}`}>
          {list.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Ver imagem ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden rounded-card border-2 transition-colors",
                i === active ? "border-selected" : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <VehicleImage image={img} className="aspect-vehicle" sizes="15vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
