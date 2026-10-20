import { redirect } from "next/navigation";

/** Os dados pessoais são um só ecrã no painel (/minha-conta/perfil); a ficha do motorista é a candidatura. */
export default function TvdeProfilePage() {
  redirect("/minha-conta/perfil");
}
