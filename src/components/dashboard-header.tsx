"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export function DashboardHeader({
  user,
  children,
}: {
  user: { name: string; email: string };
  children?: React.ReactNode;
}) {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3">
      <Link href="/documents" className="text-lg font-semibold whitespace-nowrap">
        CollabDocs
      </Link>

      <div className="min-w-0 flex-1">{children}</div>

      <div className="flex items-center gap-3">
        <span className="hidden text-right text-xs leading-tight sm:block">
          <span className="block font-medium">{user.name}</span>
          <span className="block text-[var(--muted)]">{user.email}</span>
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-medium text-white">
          {user.name.charAt(0)}
        </span>
        <button
          onClick={signOut}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm transition hover:bg-gray-50"
        >
          Switch user
        </button>
      </div>
    </header>
  );
}
