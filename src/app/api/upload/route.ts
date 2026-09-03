import { NextResponse } from "next/server";
import { generateJSON } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { handle, jsonError } from "@/lib/api";
import { fileToHtml } from "@/lib/import";
import { parseTitle } from "@/lib/validation";

/**
 * Uploads a .txt/.md/.docx file and turns it into a new editable document.
 * The extension list must match the one the editor itself uses, or imported
 * formatting would be silently dropped on the first save.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return jsonError("Sign in to upload a file.", 401);

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return jsonError("Choose a file to upload.", 400);

    const { title, html } = await fileToHtml(file);
    const content = generateJSON(html, [StarterKit, Underline, Placeholder]);

    const document = await db.document.create({
      data: { title: parseTitle(title), content, ownerId: user.id },
    });

    return NextResponse.json({ id: document.id, title: document.title }, { status: 201 });
  });
}
