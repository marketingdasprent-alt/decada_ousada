import { fail, fromError, ok } from "@/lib/api";
import { getOwnApplication } from "@/lib/ownership";
import { regionFromRequest } from "@/lib/region";
import { sendEmail } from "@/services/email";
import { getApplicationForm, uploadApplicationDocument } from "@/services/wegest";

const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];
// Assinaturas binárias: não confiar só no Content-Type enviado pelo browser
const MAGIC: Array<[string, number[]]> = [
  ["application/pdf", [0x25, 0x50, 0x44, 0x46]],
  ["image/png", [0x89, 0x50, 0x4e, 0x47]],
  ["image/jpeg", [0xff, 0xd8, 0xff]],
];

/**
 * POST /api/tvde/applications/:id/documents (multipart: doc_type, file).
 * O ficheiro segue diretamente para o WeGest; nunca é público, indexado nem registado em logs (doc §56–57).
 */
export async function POST(req: Request, { params }: RouteContext<"/api/tvde/applications/[id]/documents">) {
  const { id } = await params;
  try {
    const own = await getOwnApplication(id);
    if (!own) return fail("not_found", "Candidatura não encontrada.", 404);

    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    const docType = String(form?.get("doc_type") ?? "");
    if (!(file instanceof File) || !docType) return fail("validation", "Escolha um ficheiro.", 400);

    const definition = await getApplicationForm(regionFromRequest(req));
    const requirement = definition.documents.find((d) => d.type === docType);
    if (!requirement) return fail("validation", "Tipo de documento inválido.", 400);

    const accept = requirement.accept.length ? requirement.accept : ALLOWED;
    if (!accept.includes(file.type)) return fail("validation", "Formato não suportado. Use PDF, JPG ou PNG.", 415);
    if (file.size > requirement.maxSizeMb * 1024 * 1024) return fail("validation", `O ficheiro excede ${requirement.maxSizeMb} MB.`, 413);

    const content = await file.arrayBuffer();
    const head = new Uint8Array(content.slice(0, 4));
    const signature = MAGIC.find(([, bytes]) => bytes.every((b, i) => head[i] === b))?.[0];
    if (!signature || !accept.includes(signature)) return fail("validation", "O ficheiro não corresponde a um PDF, JPG ou PNG válido.", 415);

    const updated = await uploadApplicationDocument(id, {
      docType,
      fileName: file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120),
      mimeType: signature,
      content,
    });
    if (own.application.status === "additional_documents_required" && updated.status !== "additional_documents_required") {
      await sendEmail(own.session.user.email, "tvde.application_under_review", { reference: updated.reference });
    }
    return ok({ documents: updated.documents, status: updated.status });
  } catch (err) {
    return fromError(err);
  }
}
