"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "./avatar";
import { DocumentIcon } from "./icons";

export function DashboardHeader({
  user,
  children,
}: {
  user: { name: string; email: string };
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape, the two ways people expect to dismiss a menu.
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  async function signOut() {
    await fetch("/api/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-full items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Link
          href="/documents"
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <DocumentIcon className="h-3.5 w-3.5" />
          </span>
          <span className="hidden sm:inline">CollabDocs</span>
        </Link>

        <div className="min-w-0 flex-1">{children}</div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Account menu for ${user.name}`}
            className="flex cursor-pointer items-center gap-2 rounded-full p-0.5 transition-colors duration-150 hover:bg-[var(--surface-muted)]"
          >
            <Avatar name={user.name} email={user.email} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="animate-scale-in absolute right-0 top-full z-40 mt-2 w-60 origin-top-right overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
            >
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-3.5 py-3">
                <Avatar name={user.name} email={user.email} size="lg" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{user.name}</span>
                  <span className="block truncate text-xs text-[var(--text-muted)]">
                    {user.email}
                  </span>
                </span>
              </div>
              <button
                role="menuitem"
                onClick={signOut}
                className="w-full cursor-pointer px-3.5 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-[var(--surface-muted)]"
              >
                Switch user
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
