import { marked } from "marked";
import mammoth from "mammoth";
import { ValidationError, MAX_UPLOAD_BYTES } from "./validation";

export const ACCEPTED_EXTENSIONS = [".txt", ".md", ".docx"] as const;

/**
 * Converts an uploaded file to HTML that TipTap can parse.
 *
 * Files are parsed in memory and discarded — only the resulting document is
 * persisted. That removes the need for blob storage entirely, which is the
 * right trade at this scope (see ARCHITECTURE.md).
 */
export async function fileToHtml(file: File): Promise<{ title: string; html: string }> {
  if (file.size === 0) throw new ValidationError("That file is empty.");
  if (file.size > MAX_UPLOAD_BYTES)
    throw new ValidationError(
      `Files must be under ${MAX_UPLOAD_BYTES / 1024 / 1024} MB. That one is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
    );

  const name = file.name ?? "";
  const extension = name.slice(name.lastIndexOf(".")).toLowerCase();
  const title = (name.slice(0, name.lastIndexOf(".")) || "Imported document").trim();

  if (extension === ".docx") {
    const { value } = await mammoth.convertToHtml({
      buffer: Buffer.from(await file.arrayBuffer()),
    });
    return { title, html: value || "<p></p>" };
  }

  if (extension === ".md") {
    return { title, html: await marked.parse(await file.text()) };
  }

  if (extension === ".txt") {
    const paragraphs = (await file.text())
      .split(/\r?\n\r?\n/)
      .map((block) => `<p>${escapeHtml(block.trim()).replace(/\r?\n/g, "<br>")}</p>`);
    return { title, html: paragraphs.join("") || "<p></p>" };
  }

  throw new ValidationError(
    `Unsupported file type "${extension || name}". Upload a ${ACCEPTED_EXTENSIONS.join(", ")} file.`,
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
