"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Share = { role: string; user: { id: string; name: string; email: string } };

export function ShareDialog({
  documentId,
  shares,
}: {
  documentId: string;
  shares: Share[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function share(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch(`/api/documents/${documentId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    setPending(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Could not share the document.");
      return;
    }

    setEmail("");
    router.refresh();
  }

  async function revoke(userId: string) {
    await fetch(`/api/documents/${documentId}/share?userId=${userId}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Share
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Share document"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={(event) => event.target === event.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Share this document</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Seeded accounts: alice@, bob@, carol@example.com
            </p>

            <form onSubmit={share} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
              <select
                value={role}
                aria-label="Permission"
                onChange={(event) => setRole(event.target.value as "VIEWER" | "EDITOR")}
                className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm outline-none focus:border-[var(--accent)]"
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Share
              </button>
            </form>

            {error && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                People with access
              </h3>
              {shares.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Only you can see this document.
                </p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {shares.map((share) => (
                    <li
                      key={share.user.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{share.user.name}</span>
                        <span className="block truncate text-xs text-[var(--muted)]">
                          {share.user.email}
                        </span>
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {share.role === "EDITOR" ? "Can edit" : "View only"}
                      </span>
                      <button
                        onClick={() => revoke(share.user.id)}
                        aria-label={`Remove ${share.user.name}`}
                        className="rounded px-2 py-1 text-xs text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-lg border border-[var(--border)] py-2 text-sm transition hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
