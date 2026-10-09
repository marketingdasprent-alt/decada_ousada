"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Product = "rentacar" | "tvde";

type Selection = [Product, (p: Product) => void];

const ServiceSelectionContext = createContext<Selection | null>(null);

/**
 * Serviço escolhido nos separadores da hero, partilhado com o resto da página inicial:
 * a secção por baixo da hero mostra as categorias Rent a Car ou as viaturas TVDE,
 * conforme o separador. Sem provider, cada `HeroSearch` guarda a escolha sozinho.
 */
export function ServiceSelectionProvider({ initial = "rentacar", children }: { initial?: Product; children: ReactNode }) {
  const selection = useState<Product>(initial);
  return <ServiceSelectionContext.Provider value={selection}>{children}</ServiceSelectionContext.Provider>;
}

export function useServiceSelection(fallback: Product): Selection {
  const shared = useContext(ServiceSelectionContext);
  const local = useState<Product>(fallback);
  return shared ?? local;
}

/** Mostra o conteúdo só quando o serviço escolhido é `product`. */
export function ForService({ product, children }: { product: Product; children: ReactNode }) {
  const [active] = useServiceSelection("rentacar");
  return active === product ? <>{children}</> : null;
}
