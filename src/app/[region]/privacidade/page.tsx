import type { Metadata } from "next";

import { CookieSettingsButton } from "@/components/shared/cookie-consent";
import { PageHeader } from "@/components/shared/page-header";
import { Pending } from "@/components/shared/pending";
import { Notice } from "@/components/shared/states";
import { buttonClass, Container, Section } from "@/components/shared/ui";
import { META_PIXEL_ID } from "@/lib/meta-pixel";

export const metadata: Metadata = { title: "Privacidade e cookies" };

type Row = { name: string; who: string; purpose: string; duration: string };

/** O que este site grava no browser (src/services/auth, src/lib/consent.ts, src/lib/analytics.ts, src/lib/meta-pixel.ts). */
const NECESSARY: Row[] = [
  { name: "do_session", who: "DÉCADA OUSADA", purpose: "Manter a sessão iniciada na área de cliente.", duration: "14 dias" },
  { name: "do:consent (armazenamento local)", who: "DÉCADA OUSADA", purpose: "Guardar a sua escolha sobre cookies.", duration: "Até a alterar ou limpar os dados do browser" },
  { name: "do:ev:* (armazenamento de sessão)", who: "DÉCADA OUSADA", purpose: "Não contar duas vezes o mesmo passo de uma reserva ou candidatura.", duration: "Até fechar o separador" },
];

const MARKETING: Row[] = [
  { name: "_fbp", who: "Meta Platforms Ireland", purpose: "Medir as visitas e os pedidos que chegam das campanhas no Facebook e no Instagram.", duration: "90 dias" },
];

/** Em mobile, um bloco etiqueta/valor por cookie; a partir de `sm`, tabela (não corta colunas). */
function CookieTable({ caption, rows }: { caption: string; rows: Row[] }) {
  return (
    <>
      <ul aria-label={caption} className="mt-4 divide-y divide-line rounded-panel border border-line bg-panel sm:hidden">
        {rows.map((r) => (
          <li key={r.name} className="px-4 py-3">
            <p className="font-code font-medium text-copy">{r.name}</p>
            <dl className="mt-2 grid grid-cols-1 gap-1 text-body-small">
              {[
                ["De quem", r.who],
                ["Para quê", r.purpose],
                ["Duração", r.duration],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="inline font-semibold text-copy">{label}: </dt>
                  <dd className="inline text-copy-secondary">{value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="mt-4 hidden overflow-x-auto rounded-panel border border-line bg-panel sm:block">
        <table className="w-full text-left text-body-small">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-line bg-panel-sunken text-copy">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Nome</th>
              <th scope="col" className="px-4 py-3 font-semibold">De quem</th>
              <th scope="col" className="px-4 py-3 font-semibold">Para quê</th>
              <th scope="col" className="px-4 py-3 font-semibold">Duração</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-copy-secondary">
            {rows.map((r) => (
              <tr key={r.name}>
                <th scope="row" className="px-4 py-3 font-code font-medium text-copy">{r.name}</th>
                <td className="px-4 py-3">{r.who}</td>
                <td className="px-4 py-3">{r.purpose}</td>
                <td className="px-4 py-3">{r.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/**
 * Política de privacidade e cookies. A parte de cookies descreve o que o código grava; o
 * texto jurídico (responsável, finalidades, prazos, contacto) é da DÉCADA OUSADA e fica
 * pendente até chegar (AGENTS.md, regra 4).
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacidade e cookies" crumbs={[{ label: "Privacidade e cookies" }]} />
      <Section>
        <Container className="max-w-3xl space-y-12">
          <Notice title="Conteúdo em validação">O texto da política de privacidade aguarda informação da DÉCADA OUSADA. A lista de cookies corresponde ao que o site usa hoje.</Notice>

          <section>
            <h2 className="display text-h2">Responsável pelo tratamento</h2>
            <div className="mt-4 space-y-2 text-copy-secondary">
              <p>Entidade, NIF e morada: <Pending>A fornecer pela DÉCADA OUSADA</Pending></p>
              <p>Contacto para questões de privacidade: <Pending>A fornecer pela DÉCADA OUSADA</Pending></p>
            </div>
          </section>

          <section>
            <h2 className="display text-h2">Dados que tratamos</h2>
            <p className="mt-4 text-copy-secondary">
              Os dados que indica ao criar conta, reservar uma viatura, candidatar-se a uma viatura TVDE ou pedir contacto para trabalhar como motorista são usados para tratar esse pedido no nosso sistema de gestão.
            </p>
            <p className="mt-3 text-copy-secondary">Finalidades, fundamentos legais, prazos de conservação e destinatários: <Pending>A fornecer pela DÉCADA OUSADA</Pending></p>
          </section>

          <section id="cookies">
            <h2 className="display text-h2">Cookies</h2>
            <p className="mt-4 text-copy-secondary">
              Os cookies necessários estão sempre ativos, porque o site não funciona sem eles.
              {META_PIXEL_ID && " Os de marketing só são usados se os aceitar, e pode mudar de ideias a qualquer momento."}
            </p>
            <h3 className="mt-8 text-body-large font-semibold">Necessários</h3>
            <CookieTable caption="Cookies necessários" rows={NECESSARY} />
            {META_PIXEL_ID && (
              <>
                <h3 className="mt-8 text-body-large font-semibold">Marketing</h3>
                <p className="mt-2 text-copy-secondary">
                  O Meta Pixel recebe as páginas vistas e os passos de reservas e candidaturas (por exemplo, &quot;reserva concluída&quot; com o valor). Não enviamos nomes, emails, telefones nem documentos.
                </p>
                <CookieTable caption="Cookies de marketing" rows={MARKETING} />
                <CookieSettingsButton className={buttonClass("outline", "md", "mt-6")}>Alterar preferências de cookies</CookieSettingsButton>
              </>
            )}
          </section>

          <section>
            <h2 className="display text-h2">Os seus direitos</h2>
            <p className="mt-4 text-copy-secondary">
              Pode pedir acesso, retificação, apagamento, limitação ou portabilidade dos seus dados e opor-se ao tratamento, nos termos do Regulamento Geral sobre a Proteção de Dados. Pode também apresentar queixa à Comissão Nacional de Proteção de Dados (CNPD).
            </p>
            <p className="mt-3 text-copy-secondary">Como exercer estes direitos: <Pending>A fornecer pela DÉCADA OUSADA</Pending></p>
          </section>
        </Container>
      </Section>
    </>
  );
}
