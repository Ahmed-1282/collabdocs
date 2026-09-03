/** Small hand-rolled validators. A schema library would be overkill for this surface. */

export const MAX_TITLE_LENGTH = 200;
export const MAX_UPLOAD_BYTES = 1024 * 1024; // 1 MB

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function parseTitle(value: unknown): string {
  if (typeof value !== "string") throw new ValidationError("Title must be a string.");
  const title = value.trim();
  if (!title) throw new ValidationError("Title cannot be empty.");
  if (title.length > MAX_TITLE_LENGTH)
    throw new ValidationError(`Title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
  return title;
}

export function parseEmail(value: unknown): string {
  if (typeof value !== "string") throw new ValidationError("Email must be a string.");
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ValidationError("Enter a valid email address.");
  return email;
}

export function parseRole(value: unknown): "VIEWER" | "EDITOR" {
  if (value === "VIEWER" || value === "EDITOR") return value;
  throw new ValidationError("Role must be VIEWER or EDITOR.");
}

/**
 * TipTap emits a ProseMirror doc node. We check the shape rather than the full
 * tree: the editor is the only writer, and a deep schema check would drift.
 */
export function parseContent(value: unknown): object {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ValidationError("Content must be a document object.");
  if ((value as { type?: unknown }).type !== "doc")
    throw new ValidationError("Content must be a ProseMirror document.");
  return value as object;
}
