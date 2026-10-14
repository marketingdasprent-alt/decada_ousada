import { Images, Play } from "lucide-react";
import Image from "next/image";

import { FACEBOOK, INSTAGRAM, type InstagramPost } from "@/domain/social";
import { getInstagramPosts } from "@/services/instagram";

import { FacebookIcon } from "./facebook-icon";
import { InstagramIcon } from "./instagram-icon";
import { buttonClass, Container, Section, SectionHeading } from "./ui";

const TYPE_ICON = { video: Play, album: Images } as const;
const TYPE_LABEL = { image: "Publicação", video: "Vídeo", album: "Álbum" } as const;

/** Texto alternativo: o início da legenda; sem legenda, o tipo de publicação. */
function altText(p: InstagramPost) {
  const text = p.caption.replace(/\s+/g, " ").trim();
  if (!text) return `${TYPE_LABEL[p.type]} no Instagram`;
  return text.length > 120 ? `${text.slice(0, 117).trimEnd()}...` : text;
}

function PostTile({ post }: { post: InstagramPost }) {
  const TypeIcon = post.type === "image" ? null : TYPE_ICON[post.type];
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-square overflow-hidden rounded-panel bg-panel-sunken"
    >
      <Image
        src={post.image}
        alt={altText(post)}
        fill
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="object-cover transition-transform duration-(--duration-slow) group-hover:scale-105 motion-reduce:transition-none"
      />
      {TypeIcon && (
        <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-pill bg-panel-dark/70 text-on-dark">
          <TypeIcon className="size-4" aria-hidden />
          <span className="sr-only">{TYPE_LABEL[post.type]}</span>
        </span>
      )}
    </a>
  );
}

/**
 * Secção do Instagram: as últimas publicações de @decada_ousada (servidor, revistas a cada
 * minuto) e a ligação ao perfil. Sem token ou com a API em baixo, fica só a ligação.
 */
export async function InstagramFeed() {
  const all = (await getInstagramPosts()) ?? [];
  // Só linhas completas na grelha de quatro (sem espaços vazios); com menos de quatro, todas
  const posts = all.length >= 4 ? all.slice(0, all.length - (all.length % 4)) : all;
  const hasPosts = posts.length > 0;
  return (
    <Section aria-labelledby="instagram-titulo">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <SectionHeading
            title={<span id="instagram-titulo">Siga-nos no Instagram</span>}
            description={hasPosts ? `As últimas publicações de @${INSTAGRAM.handle}.` : `Acompanhe a DÉCADA OUSADA em @${INSTAGRAM.handle}.`}
          />
          <div className="flex flex-wrap gap-3">
            <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
              <InstagramIcon className="size-5" />
              Seguir no Instagram
            </a>
            <a href={FACEBOOK.url} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
              <FacebookIcon className="size-5" />
              Facebook
            </a>
          </div>
        </div>
        {hasPosts && (
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label={`Publicações de @${INSTAGRAM.handle} no Instagram`}>
            {posts.map((p) => (
              <li key={p.id}><PostTile post={p} /></li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
