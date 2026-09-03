import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { handle, jsonError } from "@/lib/api";
import { EMPTY_DOC, listDocumentsFor } from "@/lib/documents";
import { parseContent, parseTitle } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in to view your documents.", 401);
  return NextResponse.json(await listDocumentsFor(user.id));
}

export async function POST(request: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return jsonError("Sign in to create a document.", 401);

    const body = await request.json().catch(() => ({}));
    const document = await db.document.create({
      data: {
        title: body.title ? parseTitle(body.title) : "Untitled document",
        content: body.content ? parseContent(body.content) : EMPTY_DOC,
        ownerId: user.id,
      },
    });

    return NextResponse.json({ id: document.id, title: document.title }, { status: 201 });
  });
}
