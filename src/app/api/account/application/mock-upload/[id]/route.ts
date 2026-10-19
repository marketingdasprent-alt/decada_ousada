import { accountApplicationMock } from "@/services/account-application";
import { receiveMockUpload } from "@/services/account-application/mock";

/** Só em WEGEST_MODE=mock: faz de storage do upload_url (na API real o envio vai ao Supabase). */
export async function PUT(request: Request, { params }: RouteContext<"/api/account/application/mock-upload/[id]">) {
  if (!accountApplicationMock()) return new Response(null, { status: 404 });
  const { id } = await params;
  const status = receiveMockUpload(id, new Uint8Array(await request.arrayBuffer()));
  return new Response(null, { status, headers: { "Cache-Control": "private, no-store" } });
}
