"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { WeGestAccount } from "@/domain/customer/account";
import { accountFetch } from "@/lib/account-fetch";
import { signOutDriver } from "@/lib/driver-auth-client";

import { Notice } from "../shared/states";
import { Button, ButtonLink, Card, Skeleton } from "../shared/ui";

/**
 * Ficha de cliente da conta WeGest (GET /conta). Só leitura: a API não tem rota para a alterar. A ficha
 * nasce do registo; o NIF fica a aguardar confirmação da equipa (vem null até lá).
 */
export function WeGestProfile() {
  const [account, setAccount] = useState<WeGestAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    accountFetch("/api/account").then(async (response) => {
      const body = await response.json().catch(() => null);
      if (!active) return;
      if (response.status === 401) { await signOutDriver(); setExpired(true); return; }
      if (!response.ok || !body?.data) { setError("Não foi possível carregar os seus dados. Tente novamente."); return; }
      setAccount(body.data);
    }).catch(() => { if (active) setError("Sem ligação ao serviço de contas. Tente novamente."); });
    return () => { active = false; };
  }, [retry]);

  if (expired) return <Notice tone="warn">A sessão terminou. <ButtonLink href="/entrar?next=%2Fminha-conta%2Fperfil" size="sm" className="mt-3">Entrar novamente</ButtonLink></Notice>;
  if (error) return <Notice tone="danger">{error}<Button variant="outline" size="sm" className="mt-3" onClick={() => { setError(null); setRetry((value) => value + 1); }}>Tentar novamente</Button></Notice>;
  if (!account) return <div role="status" aria-label="A carregar os seus dados"><Skeleton className="h-64" /></div>;

  const contact = <Link href="/contactos" className="font-semibold underline underline-offset-2">contacte a equipa</Link>;
  if (!account.cliente) {
    return (
      <Notice tone="info" title="A ficha de cliente ainda não está ligada à conta">
        Depois de confirmar o email, a ficha liga-se com os dados do registo na primeira consulta. Volte a abrir esta página; se continuar sem dados, {contact}.
      </Notice>
    );
  }
  const rows: Array<[string, string]> = [
    ["Nome", account.cliente.nome],
    ["Email", account.email],
    ["Telefone", account.cliente.telefone ?? "Sem telefone na ficha"],
    ["NIF", account.cliente.nif ?? "A confirmar pela equipa ao balcão"],
  ];
  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <dl className="divide-y divide-line">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-1 gap-1 py-3 sm:grid-label-value sm:gap-4">
              <dt className="text-body-small text-copy-muted">{label}</dt>
              <dd className="break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <p className="text-body-small text-copy-secondary">Para corrigir algum dado, {contact}: a ficha é alterada no nosso sistema de gestão.</p>
    </div>
  );
}
