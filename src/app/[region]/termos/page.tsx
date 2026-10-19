import type { Metadata } from "next";
import { Pending } from "@/components/shared/pending";
import { Container, Section } from "@/components/shared/ui";

export const metadata: Metadata = { title: "Termos e condições", robots: { index: false } };
export default function TermsPage() {
  return <Section><Container variant="narrow">
    <h1 className="display text-h1">Termos e condições</h1>
    <div className="mt-6"><Pending>Texto pendente de fornecimento pela DÉCADA OUSADA</Pending></div>
  </Container></Section>;
}
