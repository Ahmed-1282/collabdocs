"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "./use-mounted";
import { useRouter } from "next/navigation";
import { Avatar } from "./avatar";
import {
  AlertIcon,
  CloseIcon,
  EyeIcon,
  LockIcon,
  PencilIcon,
  ShareIcon,
  SpinnerIcon,
} from "./icons";

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
  const [revoking, setRevoking] = useState<string | null>(null);

  const mounted = useMounted();

  const dialogRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Modal behaviour: focus moves in on open and returns to the trigger on close,
  // Escape dismisses, Tab is trapped, and the page behind cannot scroll.
  useEffect(() => {
    if (!open) return;

    emailRef.current?.focus({ preventScroll: true });
    // Captured now so cleanup restores focus to the element that opened the
    // dialog, even if the ref has since changed.
    const trigger = triggerRef.current;
    const { overflow } = window.document.body.style;
    window.document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, input, select, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = window.document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.document.addEventListener("keydown", onKeyDown);
    return () => {
      window.document.removeEventListener("keydown", onKeyDown);
      window.document.body.style.overflow = overflow;
      trigger?.focus();
    };
  }, [open]);

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
    emailRef.current?.focus({ preventScroll: true });
    router.refresh();
  }

  async function revoke(userId: string) {
    setRevoking(userId);
    await fetch(`/api/documents/${documentId}/share?userId=${userId}`, {
      method: "DELETE",
    });
    setRevoking(null);
    router.refresh();
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius)] bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--primary-hover)]"
      >
        <ShareIcon className="h-3.5 w-3.5" />
        Share
        {shares.length > 0 && (
          <span className="rounded-full bg-white/25 px-1.5 text-[11px] tabular-nums">
            {shares.length}
          </span>
        )}
      </button>

      {open && mounted && createPortal(
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 sm:items-center sm:p-6"
          onClick={(event) => event.target === event.currentTarget && setOpen(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-heading"
            className="animate-scale-in flex max-h-[88vh] w-full max-w-md flex-col overflow-y-auto overscroll-contain rounded-t-[16px] bg-[var(--surface)] p-5 shadow-[var(--shadow-lg)] sm:rounded-[16px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="share-heading" className="text-base font-semibold">
                  Share this document
                </h2>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Demo accounts: alice@, bob@, carol@example.com
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close share dialog"
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={share} className="mt-4 flex gap-2">
              <input
                ref={emailRef}
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-[var(--radius)] border border-[var(--border)] px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] focus:border-[var(--primary)]"
              />
              <select
                value={role}
                aria-label="Permission level"
                onChange={(event) => setRole(event.target.value as "VIEWER" | "EDITOR")}
                className="cursor-pointer rounded-[var(--radius)] border border-[var(--border)] px-2 py-2 text-sm outline-none transition-colors duration-150 hover:border-[var(--border-strong)] focus:border-[var(--primary)]"
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
              <button
                type="submit"
                disabled={pending}
                className="flex cursor-pointer items-center gap-1.5 rounded-[var(--radius)] bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--primary-hover)] disabled:cursor-wait disabled:opacity-60"
              >
                {pending && <SpinnerIcon className="h-3.5 w-3.5" />}
                Share
              </button>
            </form>

            {error && (
              <p
                role="alert"
                className="mt-2 flex items-start gap-1.5 rounded-[var(--radius)] bg-[var(--danger-soft)] px-2.5 py-2 text-xs text-[var(--danger)]"
              >
                <AlertIcon className="mt-px h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}

            <div className="mt-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                People with access
              </h3>

              {shares.length === 0 ? (
                <p className="mt-2.5 flex items-center gap-2 rounded-[var(--radius)] bg-[var(--surface-muted)] px-3 py-2.5 text-xs text-[var(--text-muted)]">
                  <LockIcon className="h-3.5 w-3.5 shrink-0" />
                  Only you can see this document.
                </p>
              ) : (
                <ul className="mt-1.5 max-h-56 space-y-0.5 overflow-y-auto">
                  {shares.map((share) => (
                    <li
                      key={share.user.id}
                      className="flex items-center gap-2.5 rounded-[var(--radius)] px-2 py-2 transition-colors duration-150 hover:bg-[var(--surface-muted)]"
                    >
                      <Avatar name={share.user.name} email={share.user.email} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {share.user.name}
                        </span>
                        <span className="block truncate text-xs text-[var(--text-muted)]">
                          {share.user.email}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--text-muted)]">
                        {share.role === "EDITOR" ? (
                          <PencilIcon className="h-3 w-3" />
                        ) : (
                          <EyeIcon className="h-3 w-3" />
                        )}
                        {share.role === "EDITOR" ? "Can edit" : "View only"}
                      </span>
                      <button
                        onClick={() => revoke(share.user.id)}
                        disabled={revoking === share.user.id}
                        aria-label={`Remove access for ${share.user.name}`}
                        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-subtle)] transition-colors duration-150 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                      >
                        {revoking === share.user.id ? (
                          <SpinnerIcon className="h-3.5 w-3.5" />
                        ) : (
                          <CloseIcon className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full cursor-pointer rounded-[var(--radius)] border border-[var(--border)] py-2 text-sm font-medium transition-colors duration-150 hover:bg-[var(--surface-muted)]"
            >
              Done
            </button>
          </div>
        </div>,
        window.document.body,
      )}
    </>
  );
}
