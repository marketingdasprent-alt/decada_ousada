import { draftSchema, handleApplication, readBody } from "@/services/account-application";

/**
 * Candidatura TVDE da conta: GET lê, PUT guarda o rascunho (parcial), POST submete.
 * O browser envia o token da conta em Authorization: Bearer (ver lib/account-fetch).
 */
export function GET(request: Request) {
  return handleApplication(request, "read", (backend) => backend.get());
}

export async function PUT(request: Request) {
  const body = await readBody(request, draftSchema);
  if ("response" in body) return body.response;
  return handleApplication(request, "save", (backend) => backend.save(body.data), body.data);
}

export function POST(request: Request) {
  return handleApplication(request, "submit", (backend) => backend.submit());
}
