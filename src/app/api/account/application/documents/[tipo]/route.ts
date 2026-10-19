import { isApplicationDocType } from "@/domain/customer/account";
import { fail } from "@/lib/api";
import { confirmSchema, handleApplication, readBody, uploadSchema } from "@/services/account-application";

/**
 * Documentos da candidatura, em três passos: POST pede o envio (devolve o upload_url assinado),
 * o browser envia os bytes direto ao storage, PUT confirma. DELETE remove.
 * O upload_url só passa para o browser: nunca é escrito em logs.
 */
async function docType(params: Promise<{ tipo: string }>) {
  const { tipo } = await params;
  return isApplicationDocType(tipo) ? tipo : null;
}

const unknownType = () => {
  const response = fail("not_found", "Tipo de documento desconhecido.", 404);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
};

export async function POST(request: Request, { params }: RouteContext<"/api/account/application/documents/[tipo]">) {
  const tipo = await docType(params);
  if (!tipo) return unknownType();
  const body = await readBody(request, uploadSchema);
  if ("response" in body) return body.response;
  return handleApplication(request, "upload", (backend) => backend.requestUpload(tipo, body.data));
}

export async function PUT(request: Request, { params }: RouteContext<"/api/account/application/documents/[tipo]">) {
  const tipo = await docType(params);
  if (!tipo) return unknownType();
  const body = await readBody(request, confirmSchema);
  if ("response" in body) return body.response;
  return handleApplication(request, "confirm", (backend) => backend.confirmUpload(tipo, body.data.caminho));
}

export async function DELETE(request: Request, { params }: RouteContext<"/api/account/application/documents/[tipo]">) {
  const tipo = await docType(params);
  if (!tipo) return unknownType();
  return handleApplication(request, "remove", (backend) => backend.remove(tipo));
}
