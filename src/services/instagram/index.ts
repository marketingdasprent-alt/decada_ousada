import "server-only";

import { cacheLife, cacheTag } from "next/cache";

/**
 * Publicações recentes do Instagram da DÉCADA OUSADA, lidas só no servidor.
 *
 * Duas fontes, por esta ordem (docs/instagram.md):
 *   INSTAGRAM_ACCESS_TOKEN → API oficial (Instagram API with Instagram Login, `instagram_business_basic`)
 *   INSTAGRAM_FEED_URL     → feed JSON de um serviço que gere o token (ex.: Behold)
 * Sem nenhuma das duas, devolve uma lista vazia e as secções que a usam não aparecem.
 * O token nunca sai do servidor e nunca vai para os logs.
 */

export type InstagramPostType = "image" | "video" | "album";

export interface InstagramPost {
  id: string;
  /** Ligação para a publicação no Instagram. */
  url: string;
  /** Imagem a mostrar (a miniatura, nos vídeos). Link do CDN do Instagram, temporário. */
  image: string;
  caption: string;
  type: InstagramPostType;
  postedAt: string | null;
}

export interface InstagramFeed {
  username: string;
  profileUrl: string;
  posts: InstagramPost[];
}

const GRAPH_URL = "https://graph.instagram.com/me/media";
const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
const TIMEOUT_MS = 8000;

export const instagramUsername = () => process.env.INSTAGRAM_USERNAME?.trim() || "decada_ousada";

const toType = (raw: unknown): InstagramPostType => (raw === "VIDEO" ? "video" : raw === "CAROUSEL_ALBUM" ? "album" : "image");
const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Resposta da API oficial: { data: [{ id, caption, media_type, media_url, thumbnail_url, permalink, timestamp }] } */
function fromGraph(body: unknown): InstagramPost[] {
  const list = (body as { data?: unknown[] })?.data;
  if (!Array.isArray(list)) return [];
  return list.map((p) => {
    const r = p as Record<string, unknown>;
    const type = toType(r.media_type);
    return {
      id: str(r.id),
      url: str(r.permalink),
      image: type === "video" ? str(r.thumbnail_url) || str(r.media_url) : str(r.media_url),
      caption: str(r.caption),
      type,
      postedAt: str(r.timestamp) || null,
    };
  });
}

/** Feed JSON (Behold v2 `{ posts: [...] }` ou v1 `[...]`). */
function fromFeed(body: unknown): InstagramPost[] {
  const list = Array.isArray(body) ? body : (body as { posts?: unknown[] })?.posts;
  if (!Array.isArray(list)) return [];
  return list.map((p) => {
    const r = p as Record<string, unknown>;
    const sizes = r.sizes as Record<string, { mediaUrl?: string }> | undefined;
    const type = toType(r.mediaType);
    return {
      id: str(r.id),
      url: str(r.permalink),
      image: sizes?.medium?.mediaUrl || sizes?.large?.mediaUrl || (type === "video" ? str(r.thumbnailUrl) : str(r.mediaUrl)),
      caption: str(r.prunedCaption) || str(r.caption),
      type,
      postedAt: str(r.timestamp) || null,
    };
  });
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Instagram respondeu ${res.status}`);
  return res.json();
}

/** Últimas publicações (até `limit`). Nunca lança: em erro devolve lista vazia. */
export async function getInstagramFeed(limit = 8): Promise<InstagramFeed> {
  "use cache";
  cacheLife("minutes");
  cacheTag("instagram:feed");

  const username = instagramUsername();
  const feed: InstagramFeed = { username, profileUrl: `https://www.instagram.com/${username}/`, posts: [] };
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const feedUrl = process.env.INSTAGRAM_FEED_URL?.trim();

  try {
    let posts: InstagramPost[] = [];
    if (token) {
      const q = new URLSearchParams({ fields: FIELDS, limit: String(limit), access_token: token });
      posts = fromGraph(await fetchJson(`${GRAPH_URL}?${q}`));
    } else if (feedUrl) {
      posts = fromFeed(await fetchJson(feedUrl));
    }
    feed.posts = posts.filter((p) => p.id && p.url.startsWith("https://") && p.image.startsWith("https://")).slice(0, limit);
  } catch (err) {
    // Só a mensagem: o URL do pedido leva o token
    console.error("[instagram] feed indisponível:", err instanceof Error ? err.message : "erro desconhecido");
  }
  return feed;
}
