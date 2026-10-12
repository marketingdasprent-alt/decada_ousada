import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { InstagramPost } from "@/domain/social";

/**
 * Publicações do próprio perfil, de uma de duas fontes (docs/instagram.md):
 *   INSTAGRAM_ACCESS_TOKEN → Instagram API com login do Instagram (conta profissional)
 *   INSTAGRAM_FEED_URL     → feed JSON de um serviço que gere o token (ex.: Behold)
 */
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

/** Publicação no feed JSON do Behold (v2; a v1 devolve a lista sem o objeto à volta). */
interface FeedMedia {
  id: string;
  caption?: string;
  prunedCaption?: string;
  mediaType: IgMedia["media_type"];
  /** Links originais do CDN do Instagram. As cópias redimensionadas (`sizes`) vêm de outro domínio e não se usam. */
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink: string;
}

const TYPE: Record<IgMedia["media_type"], InstagramPost["type"]> = { IMAGE: "image", VIDEO: "video", CAROUSEL_ALBUM: "album" };

/**
 * Só imagens dos domínios em `images.remotePatterns` (next.config.ts): com outro domínio o
 * `next/image` lança um erro e a página inteira falha, por isso a publicação fica de fora.
 */
function isAllowedImage(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && /(^|\.)(cdninstagram\.com|fbcdn\.net)$/.test(hostname);
  } catch {
    return false;
  }
}

function toPost(m: IgMedia): InstagramPost | null {
  // Nos vídeos a imagem é a capa; media_url seria o próprio vídeo
  const image = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
  if (!image || !m.permalink || !isAllowedImage(image)) return null;
  return { id: m.id, url: m.permalink, image, caption: m.caption ?? "", type: TYPE[m.media_type] ?? "image" };
}

function feedToPost(m: FeedMedia): InstagramPost | null {
  const image = m.mediaType === "VIDEO" ? m.thumbnailUrl : m.mediaUrl;
  if (!image || !m.permalink || !isAllowedImage(image)) return null;
  return { id: m.id, url: m.permalink, image, caption: m.prunedCaption ?? m.caption ?? "", type: TYPE[m.mediaType] ?? "image" };
}

async function readJson(url: URL): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(`${res.status} ao ler publicações`);
  return res.json();
}

/**
 * Últimas publicações do Instagram, revistas a cada minuto (perfil `minutes`). Devolve null
 * sem fonte configurada ou se a fonte falhar: a página mostra só a ligação ao perfil.
 */
export async function getInstagramPosts(): Promise<InstagramPost[] | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("instagram");
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const feedUrl = process.env.INSTAGRAM_FEED_URL;
  try {
    let posts: (InstagramPost | null)[];
    if (token) {
      const url = new URL(MEDIA_URL);
      url.searchParams.set("fields", FIELDS);
      url.searchParams.set("limit", String(LIMIT));
      url.searchParams.set("access_token", token);
      const body = (await readJson(url)) as { data?: IgMedia[] };
      posts = (body.data ?? []).map(toPost);
    } else if (feedUrl) {
      const body = (await readJson(new URL(feedUrl))) as FeedMedia[] | { posts?: FeedMedia[] };
      posts = (Array.isArray(body) ? body : (body.posts ?? [])).map(feedToPost);
    } else {
      return null;
    }
    return posts.filter((p): p is InstagramPost => p !== null).slice(0, LIMIT);
  } catch (err) {
    // Só a mensagem: o URL do pedido leva o token
    console.error("[instagram] falha ao ler publicações", err instanceof Error ? err.message : "erro desconhecido");
    return null;
  }
}
