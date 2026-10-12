import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { InstagramPost } from "@/domain/social";

/** Instagram API com login do Instagram (conta profissional): publicações do próprio perfil. */
const MEDIA_URL = "https://graph.instagram.com/me/media";
const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink";
const LIMIT = 8;
const TIMEOUT = 8000;

interface IgMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
}

const TYPE: Record<IgMedia["media_type"], InstagramPost["type"]> = { IMAGE: "image", VIDEO: "video", CAROUSEL_ALBUM: "album" };

function toPost(m: IgMedia): InstagramPost | null {
  // Nos vídeos a imagem é a capa; media_url seria o próprio vídeo
  const image = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
  if (!image || !m.permalink) return null;
  return { id: m.id, url: m.permalink, image, caption: m.caption ?? "", type: TYPE[m.media_type] ?? "image" };
}

/**
 * Últimas publicações do Instagram, revistas a cada minuto (perfil `minutes`). Devolve null
 * sem `INSTAGRAM_ACCESS_TOKEN` ou se a API falhar: a página mostra só a ligação ao perfil.
 */
export async function getInstagramPosts(): Promise<InstagramPost[] | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("instagram");
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;
  try {
    const url = new URL(MEDIA_URL);
    url.searchParams.set("fields", FIELDS);
    url.searchParams.set("limit", String(LIMIT));
    url.searchParams.set("access_token", token);
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) {
      console.error(`[instagram] ${res.status} ao ler publicações`);
      return null;
    }
    const body = (await res.json()) as { data?: IgMedia[] };
    return (body.data ?? []).map(toPost).filter((p): p is InstagramPost => p !== null).slice(0, LIMIT);
  } catch (err) {
    console.error("[instagram] falha ao ler publicações", err instanceof Error ? err.message : err);
    return null;
  }
}
