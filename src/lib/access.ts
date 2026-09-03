export type AccessLevel = "owner" | "editor" | "viewer" | "none";

/** The minimum shape access decisions need. Keeps this module pure and testable. */
export type AccessibleDocument = {
  ownerId: string;
  shares: { userId: string; role: "VIEWER" | "EDITOR" }[];
};

/**
 * Resolves what a user may do with a document.
 *
 * Owner beats any share row, so re-sharing a document to its own owner can
 * never downgrade them to a viewer.
 */
export function getAccessLevel(
  doc: AccessibleDocument,
  userId: string | null | undefined,
): AccessLevel {
  if (!userId) return "none";
  if (doc.ownerId === userId) return "owner";

  const share = doc.shares.find((s) => s.userId === userId);
  if (!share) return "none";
  return share.role === "EDITOR" ? "editor" : "viewer";
}

export function canView(doc: AccessibleDocument, userId?: string | null) {
  return getAccessLevel(doc, userId) !== "none";
}

export function canEdit(doc: AccessibleDocument, userId?: string | null) {
  const level = getAccessLevel(doc, userId);
  return level === "owner" || level === "editor";
}

/** Only the owner may share a document further, rename-delete it, or remove access. */
export function canManage(doc: AccessibleDocument, userId?: string | null) {
  return getAccessLevel(doc, userId) === "owner";
}
