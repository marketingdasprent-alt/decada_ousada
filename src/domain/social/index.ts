/** Perfil de Instagram da DÉCADA OUSADA (o mesmo nas duas regiões). */
export const INSTAGRAM = {
  handle: "decada_ousada",
  url: "https://www.instagram.com/decada_ousada/",
} as const;

/** Página de Facebook da DÉCADA OUSADA (indicada pela equipa, 2026-10-14). */
export const FACEBOOK = {
  name: "decada.ousada",
  url: "https://www.facebook.com/decada.ousada",
} as const;

/** Publicação do Instagram já normalizada para a UI. */
export interface InstagramPost {
  id: string;
  /** Página da publicação no Instagram. */
  url: string;
  /** Imagem (ou capa, nos vídeos). Link temporário do CDN do Instagram: nunca guardar. */
  image: string;
  caption: string;
  type: "image" | "video" | "album";
}
