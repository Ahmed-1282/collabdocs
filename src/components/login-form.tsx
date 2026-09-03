"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./avatar";
import { AlertIcon, ChevronLeftIcon, SpinnerIcon } from "./icons";

type SeededUser = { email: string; name: string };

export function LoginForm({ users }: { users: SeededUser[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  async function signIn(value: string) {
    setPendingEmail(value);
    setError(null);

    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Could not sign in.");
      setPendingEmail(null);
      return;
    }

    router.push("/documents");
    router.refresh();
  }

  const busy = pendingEmail !== null;

  return (
    <div className="mt-4 space-y-4">
      <ul className="space-y-1.5">
        {users.map((user) => (
          <li key={user.email}>
            <button
              onClick={() => signIn(user.email)}
              disabled={busy}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] px-3 py-2.5 text-left transition-colors duration-150 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] disabled:cursor-wait disabled:opacity-60"
            >
              <Avatar name={user.name} email={user.email} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{user.name}</span>
                <span className="block truncate text-xs text-[var(--text-muted)]">
                  {user.email}
                </span>
              </span>
              {pendingEmail === user.email ? (
                <SpinnerIcon className="h-4 w-4 text-[var(--primary)]" />
              ) : (
                <ChevronLeftIcon className="h-4 w-4 rotate-180 text-[var(--text-subtle)] transition-transform duration-150 group-hover:translate-x-0.5" />
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-subtle)]">
          or
        </span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          signIn(email);
        }}
        className="space-y-1.5"
      >
        <label htmlFor="email" className="block text-xs font-medium text-[var(--text-muted)]">
          Sign in with an email
        </label>
        <div className="flex gap-2">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-w-0 flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-[var(--text-subtle)] hover:border-[var(--border-strong)] focus:border-[var(--primary)]"
            placeholder="alice@example.com"
          />
          <button
            type="submit"
            disabled={busy}
            className="cursor-pointer rounded-[var(--radius)] bg-[var(--primary)] px-3.5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--primary-hover)] disabled:cursor-wait disabled:opacity-60"
          >
            Sign in
          </button>
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius)] bg-[var(--danger-soft)] px-3 py-2 text-xs text-[var(--danger)]"
        >
          <AlertIcon className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
