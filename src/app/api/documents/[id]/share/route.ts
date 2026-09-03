import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { handle, jsonError } from "@/lib/api";
import { canManage } from "@/lib/access";
import { parseEmail, parseRole } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

/** Loads the document only if the signed-in user owns it. */
async function requireOwnedDocument(documentId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: jsonError("Sign in to manage sharing.", 401) };

  const doc = await db.document.findUnique({
    where: { id: documentId },
    include: { shares: true },
  });
  // Non-owners get 404, not 403: a collaborator should not learn who else has access.
  if (!doc || !canManage(doc, user.id)) return { error: jsonError("Document not found.", 404) };

  return { doc, user };
}

/** Grants access by email. Re-sharing the same person updates their role. */
export async function POST(request: Request, { params }: Params) {
  return handle(async () => {
    const { doc, user, error } = await requireOwnedDocument((await params).id);
    if (error) return error;

    const body = await request.json();
    const email = parseEmail(body.email);
    const role = parseRole(body.role ?? "VIEWER");

    if (email === user.email.toLowerCase())
      return jsonError("You already own this document.", 400);

    const recipient = await db.user.findUnique({ where: { email } });
    if (!recipient)
      return jsonError(
        "No account with that email. Seeded users: alice@, bob@, carol@example.com.",
        404,
      );

    const share = await db.share.upsert({
      where: { documentId_userId: { documentId: doc.id, userId: recipient.id } },
      update: { role },
      create: { documentId: doc.id, userId: recipient.id, role },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    return NextResponse.json({ role: share.role, user: share.user }, { status: 201 });
  });
}

/** Revokes access. */
export async function DELETE(request: Request, { params }: Params) {
  return handle(async () => {
    const { doc, error } = await requireOwnedDocument((await params).id);
    if (error) return error;

    const userId = new URL(request.url).searchParams.get("userId");
    if (!userId) return jsonError("A userId query parameter is required.", 400);

    await db.share.deleteMany({ where: { documentId: doc.id, userId } });
    return NextResponse.json({ ok: true });
  });
}
