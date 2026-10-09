import type { Region } from "@/domain/region";

/** Cenas com imagem de fundo própria em cada região (identidade regional, não só cor e logótipo). */
export type HeroScene = "home" | "rentacar" | "tvde";

/**
 * Imagem de fundo da hero. `x`/`y` (0 a 100) dizem que parte da foto fica à vista quando
 * o ecrã a recorta. Fotos automóveis do Unsplash (licença Unsplash, uso comercial gratuito);
 * a legenda diz o que mostram, sem afirmar locais que a foto não garante. São decorativas:
 * o texto da hero diz o essencial.
 */
export interface HeroImage {
  id: string;
  x: number;
  y: number;
  /** O que a foto mostra (para quem mantém o site; no ecrã é decorativa). */
  subject: string;
  /** Cópia editada em `public/` (ex.: matrículas desfocadas), usada em vez do CDN. */
  file?: string;
}

export const REGION_IMAGERY: Record<Region, Record<HeroScene, HeroImage>> = {
  mainland: {
    home: { id: "photo-1662577629898-484e7eb1d0d2", x: 50, y: 50, subject: "Chave na mão e a viatura pronta" },
    rentacar: { id: "photo-1629725194712-b091c4a1aadd", x: 50, y: 70, subject: "Viatura numa rua de Lisboa, com o elétrico ao fundo", file: "/demo/hero/lisboa.jpg" },
    tvde: { id: "photo-1565128446913-4433ca388a53", x: 50, y: 60, subject: "Motorista ao volante" },
  },
  azores: {
    home: { id: "photo-1683729413378-e6396b0f338f", x: 50, y: 55, subject: "Viatura em estrada entre pastagens e muros de pedra" },
    rentacar: { id: "photo-1557598628-bdd7d0767917", x: 50, y: 45, subject: "Entrega da chave junto ao mar" },
    tvde: { id: "photo-1729698598583-6e578527fa5a", x: 50, y: 60, subject: "Viatura em circulação à noite" },
  },
};

export function heroImageUrl(image: HeroImage): string {
  return image.file ?? `https://images.unsplash.com/${image.id}?auto=format&fit=crop&q=75`;
}
