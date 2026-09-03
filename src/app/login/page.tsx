import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/documents");

  const users = await db.user.findMany({
    select: { email: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">CollabDocs</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sign in as a seeded account. There are no passwords — authentication is
          mocked so reviewers can switch users quickly and test sharing.
        </p>
        <LoginForm users={users} />
      </div>
    </main>
  );
}
