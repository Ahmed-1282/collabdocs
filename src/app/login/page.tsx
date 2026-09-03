import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LoginForm } from "@/components/login-form";
import { DocumentIcon } from "@/components/icons";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/documents");

  const users = await db.user.findMany({
    select: { email: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
            <DocumentIcon className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-bold tracking-tight">CollabDocs</h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Create, edit, and share documents with your team.
          </p>
        </div>

        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)]">
          <h2 className="text-sm font-semibold">Choose a demo account</h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            No passwords — authentication is mocked so you can switch users and
            test the sharing model quickly.
          </p>
          <LoginForm users={users} />
        </div>

        <p className="mt-5 text-center text-xs text-[var(--text-subtle)]">
          Sign in as two different users in separate windows to see sharing work.
        </p>
      </div>
    </main>
  );
}
