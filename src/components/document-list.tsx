import Link from "next/link";
import { Avatar } from "./avatar";
import { DocumentIcon, EyeIcon, LockIcon, PencilIcon, UsersIcon } from "./icons";

type DocumentSummary = {
  id: string;
  title: string;
  updatedAt: string;
  accessLevel: string;
  owner: { name: string; email: string };
  shares: { role: string; user: { id: string; name: string; email: string } }[];
};

/** Access is conveyed by icon + text, never colour alone. */
const BADGE = {
  owner: { label: "Owner", Icon: PencilIcon, className: "bg-[var(--surface-muted)] text-[var(--text-muted)]" },
  editor: { label: "Can edit", Icon: PencilIcon, className: "bg-[var(--primary-soft)] text-[var(--primary)]" },
  viewer: { label: "View only", Icon: EyeIcon, className: "bg-[var(--surface-muted)] text-[var(--text-muted)]" },
} as const;

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
      <div className="mt-3 flex flex-col items-center rounded-[12px] border border-dashed border-[var(--border-strong)] px-6 py-10 text-center">
        <DocumentIcon className="h-6 w-6 text-[var(--text-subtle)]" />
        <p className="mt-2.5 text-sm text-[var(--text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => {
        const badge = BADGE[doc.accessLevel as keyof typeof BADGE] ?? BADGE.viewer;

        return (
          <li key={doc.id}>
            <Link
              href={`/documents/${doc.id}`}
              className="group flex h-full flex-col rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-muted)] transition-colors duration-150 group-hover:bg-[var(--primary-soft)] group-hover:text-[var(--primary)]">
                  <DocumentIcon className="h-4 w-4" />
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${badge.className}`}
                >
                  <badge.Icon className="h-3 w-3" />
                  {badge.label}
                </span>
              </div>

              <h3 className="mt-3 line-clamp-2 text-sm leading-snug font-semibold text-balance">
                {doc.title}
              </h3>

              <div className="mt-auto pt-3">
                {showSharedWith ? (
                  <SharedWith shares={doc.shares} />
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Avatar name={doc.owner.name} email={doc.owner.email} size="sm" />
                    <span className="truncate">{doc.owner.name}</span>
                  </span>
                )}
                <p className="mt-2 text-[11px] text-[var(--text-subtle)]">
                  Updated {formatDate(doc.updatedAt)}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SharedWith({ shares }: { shares: DocumentSummary["shares"] }) {
  if (shares.length === 0) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
        <LockIcon className="h-3.5 w-3.5" />
        Private to you
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <UsersIcon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex -space-x-1.5">
        {shares.slice(0, 3).map((share) => (
          <span key={share.user.id} className="ring-2 ring-[var(--surface)] rounded-full">
            <Avatar name={share.user.name} email={share.user.email} size="sm" />
          </span>
        ))}
      </span>
      <span className="truncate">
        {shares.length === 1 ? shares[0].user.name : `${shares.length} people`}
      </span>
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  const dayMs = 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - date.getTime();

  if (elapsed < dayMs && date.toDateString() === new Date().toDateString())
    return `today at ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
  if (elapsed < 2 * dayMs) return "yesterday";
  if (elapsed < 7 * dayMs) return `${Math.floor(elapsed / dayMs)} days ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
