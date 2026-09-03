import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listDocumentsFor } from "@/lib/documents";
import { DashboardHeader } from "@/components/dashboard-header";
import { DocumentList } from "@/components/document-list";
import { NewDocumentActions } from "@/components/new-document-actions";
import { DocumentIcon, UsersIcon } from "@/components/icons";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { owned, shared } = await listDocumentsFor(user.id);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen">
      <DashboardHeader user={user} />

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle(owned.length, shared.length)}</p>
          </div>
          <NewDocumentActions />
        </div>

        <Section
          title="My documents"
          count={owned.length}
          icon={<DocumentIcon className="h-3.5 w-3.5" />}
        >
          <DocumentList
            documents={owned}
            emptyMessage="You haven't created any documents yet."
            showSharedWith
          />
        </Section>

        <Section
          title="Shared with me"
          count={shared.length}
          icon={<UsersIcon className="h-3.5 w-3.5" />}
        >
          <DocumentList
            documents={shared}
            emptyMessage="No one has shared a document with you yet."
          />
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  count,
  icon,
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-9">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-[var(--text-subtle)]">{icon}</span>
        {title}
        <span className="rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--text-muted)] tabular-nums">
          {count}
        </span>
      </h2>
      {children}
    </section>
  );
}

function subtitle(owned: number, shared: number) {
  if (owned + shared === 0) return "Create your first document to get started.";
  if (shared === 0) return `You have ${count(owned, "document")}.`;
  if (owned === 0) return `${count(shared, "document")} shared with you.`;
  return `${count(owned, "document")}, plus ${shared} shared with you.`;
}

function count(value: number, noun: string) {
  return `${value} ${noun}${value === 1 ? "" : "s"}`;
}
