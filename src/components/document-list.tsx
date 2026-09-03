import Link from "next/link";

type DocumentSummary = {
  id: string;
  title: string;
  updatedAt: string;
  accessLevel: string;
  owner: { name: string; email: string };
  shares: { role: string; user: { id: string; name: string } }[];
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  editor: "Can edit",
  viewer: "View only",
};

export function DocumentList({
  documents,
  emptyMessage,
  showSharedWith = false,
}: {
  documents: DocumentSummary[];
  emptyMessage: string;
  showSharedWith?: boolean;
}) {
  if (documents.length === 0) {
    return (
      <p className="mt-3 rounded-lg border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      {documents.map((doc) => (
        <li key={doc.id}>
          <Link
            href={`/documents/${doc.id}`}
            className="flex items-center gap-4 px-4 py-3 transition hover:bg-gray-50"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{doc.title}</span>
              <span className="block text-xs text-[var(--muted)]">
                {showSharedWith
                  ? sharedWithLabel(doc.shares)
                  : `Owned by ${doc.owner.name}`}
                {" · "}
                Updated {formatDate(doc.updatedAt)}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-[var(--muted)]">
              {ROLE_LABEL[doc.accessLevel] ?? doc.accessLevel}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function sharedWithLabel(shares: DocumentSummary["shares"]) {
  if (shares.length === 0) return "Private to you";
  if (shares.length === 1) return `Shared with ${shares[0].user.name}`;
  return `Shared with ${shares.length} people`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
