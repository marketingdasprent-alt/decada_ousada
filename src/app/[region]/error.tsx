"use client";

import { ErrorState } from "@/components/shared/states";
import { Container, Section } from "@/components/shared/ui";

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Section><Container>
      <ErrorState title="Algo correu mal." description="Não foi possível apresentar esta página. Tente novamente." />
      <div className="mt-4 text-center">
        <button type="button" onClick={reset} className="text-body-small font-medium text-brand underline underline-offset-4">Tentar novamente</button>
      </div>
    </Container></Section>
  );
}
