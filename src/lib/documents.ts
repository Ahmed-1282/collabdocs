import type { JSONContent } from "@tiptap/core";
import { db } from "./db";
import { canEdit, canView, getAccessLevel, type AccessLevel } from "./access";

const documentWithShares = {
  shares: { include: { user: { select: { id: true, email: true, name: true } } } },
  owner: { select: { id: true, email: true, name: true } },
} as const;

export const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

/** Documents the user owns, plus documents shared with them, newest first. */
export async function listDocumentsFor(userId: string) {
  const [owned, shared] = await Promise.all([
    db.document.findMany({
      where: { ownerId: userId },
      include: documentWithShares,
      orderBy: { updatedAt: "desc" },
    }),
    db.document.findMany({
      where: { shares: { some: { userId } } },
      include: documentWithShares,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    owned: owned.map((doc) => serialize(doc, "owner")),
    shared: shared.map((doc) => serialize(doc, getAccessLevel(doc, userId))),
  };
}

/**
 * Loads a document only if the user may see it.
 *
 * Returns null for both "missing" and "not allowed" so callers answer 404 in
 * either case — a 403 would confirm that a document id exists.
 */
export async function getDocumentFor(documentId: string, userId: string) {
  const doc = await db.document.findUnique({
    where: { id: documentId },
    include: documentWithShares,
  });
  if (!doc || !canView(doc, userId)) return null;
  return {
    ...serialize(doc, getAccessLevel(doc, userId)),
    // Prisma types Json columns as JsonValue; the column only ever holds
    // TipTap document JSON, written through parseContent().
    content: doc.content as JSONContent,
  };
}

/** Loads a document for writing. Distinguishes "not found" from "read-only". */
export async function getWritableDocument(documentId: string, userId: string) {
  const doc = await db.document.findUnique({
    where: { id: documentId },
    include: { shares: true },
  });
  if (!doc || !canView(doc, userId)) return { doc: null, readOnly: false };
  if (!canEdit(doc, userId)) return { doc, readOnly: true };
  return { doc, readOnly: false };
}

type SerializableDoc = {
  id: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
  owner: { id: string; email: string; name: string };
  shares: { role: string; user: { id: string; email: string; name: string } }[];
};

function serialize(doc: SerializableDoc, accessLevel: AccessLevel = "owner") {
  return {
    id: doc.id,
    title: doc.title,
    updatedAt: doc.updatedAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    owner: doc.owner,
    accessLevel,
    shares: doc.shares.map((s) => ({ role: s.role, user: s.user })),
  };
}
