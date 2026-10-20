import { redirect } from "next/navigation";

/** O painel é um só: o estado da candidatura aparece na visão geral de /minha-conta. */
export default function TvdeDashboard() {
  redirect("/minha-conta");
}
