import Image from "next/image";

import { getInstagramFeed, type InstagramPostType } from "@/services/instagram";

import { buttonClass, Container, Section, SectionHeading } from "./ui";

const TYPE_LABEL: Partial<Record<InstagramPostType, string>> = { video: "Vídeo", album: "Álbum" };

/**
 * Últimas publicações do Instagram, lidas no servidor (docs/instagram.md).
 * Sem ligação configurada ou sem publicações, a secção não aparece.
 */
export async function InstagramFeed({ className }: { className?: string }) {
  const { username, profileUrl, posts } = await getInstagramFeed(8);
  // Linhas completas de 4 (ou de 2 no telemóvel): nunca uma linha a meio
  const shown = posts.slice(0, posts.length >= 8 ? 8 : posts.length >= 4 ? 4 : 0);
  if (shown.length === 0) return null;

  return (
    <Section className={className} aria-labelledby="instagram-titulo">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={<span id="instagram-titulo">@{username}</span>} description="Novidades da frota, dos motoristas e dos bastidores, no Instagram." />
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "md")}>
            Seguir no Instagram
            <span className="sr-only">(abre noutro separador)</span>
          </a>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shown.map((post) => (
            <li key={post.id}>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-panel bg-panel-sunken"
              >
                {/* Links do CDN do Instagram são temporários: sem otimização nem cache de imagem */}
                <Image
                  src={post.image}
                  alt={post.caption ? post.caption.slice(0, 120) : `Publicação de @${username}`}
                  fill
                  unoptimized
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
                {TYPE_LABEL[post.type] && (
                  <span className="absolute top-2 right-2 rounded-control bg-panel-dark/80 px-2 py-0.5 text-caption font-semibold text-on-dark">
                    {TYPE_LABEL[post.type]}
                  </span>
                )}
                <span className="sr-only">(abre a publicação no Instagram, noutro separador)</span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
