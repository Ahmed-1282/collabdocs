"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SeededUser = { email: string; name: string };

export function LoginForm({ users }: { users: SeededUser[] }) {
  const router = useRouter();
  const [email, setEmail] = useState(users[0]?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signIn(value: string) {
    setPending(true);
    setError(null);

    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Could not sign in.");
      setPending(false);
      return;
    }

    router.push("/documents");
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="space-y-2">
        {users.map((user) => (
          <button
            key={user.email}
            onClick={() => signIn(user.email)}
            disabled={pending}
            className="flex w-full items-center gap-3 rounded-lg border border-[var(--border)] px-4 py-3 text-left transition hover:border-[var(--accent)] hover:bg-blue-50 disabled:opacity-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-medium text-white">
              {user.name.charAt(0)}
            </span>
            <span>
              <span className="block text-sm font-medium">{user.name}</span>
              <span className="block text-xs text-[var(--muted)]">{user.email}</span>
            </span>
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          signIn(email);
        }}
        className="space-y-2 border-t border-[var(--border)] pt-5"
      >
        <label htmlFor="email" className="block text-xs font-medium text-[var(--muted)]">
          Or enter an email
        </label>
        <div className="flex gap-2">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            placeholder="alice@example.com"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Sign in
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
