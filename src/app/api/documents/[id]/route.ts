import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { handle, jsonError } from "@/lib/api";
import { getDocumentFor, getWritableDocument } from "@/lib/documents";
import { canManage } from "@/lib/access";
import { parseContent, parseTitle } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in to open this document.", 401);

  const document = await getDocumentFor((await params).id, user.id);
  if (!document) return jsonError("Document not found.", 404);
  return NextResponse.json(document);
}

/** Saves title and/or content. Viewers are rejected; strangers get a 404. */
export async function PATCH(request: Request, { params }: Params) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return jsonError("Sign in to edit this document.", 401);

    const { doc, readOnly } = await getWritableDocument((await params).id, user.id);
    if (!doc) return jsonError("Document not found.", 404);
    if (readOnly) return jsonError("You have view-only access to this document.", 403);

    const body = await request.json();
    const updated = await db.document.update({
      where: { id: doc.id },
      data: {
        ...(body.title !== undefined && { title: parseTitle(body.title) }),
        ...(body.content !== undefined && { content: parseContent(body.content) }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      updatedAt: updated.updatedAt.toISOString(),
    });
  });
}

/** Only the owner may delete. */
export async function DELETE(_request: Request, { params }: Params) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return jsonError("Sign in to delete this document.", 401);

    const doc = await db.document.findUnique({
      where: { id: (await params).id },
      include: { shares: true },
    });
    if (!doc || !canManage(doc, user.id)) return jsonError("Document not found.", 404);

    await db.document.delete({ where: { id: doc.id } });
    return NextResponse.json({ ok: true });
  });
}
