import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listDocumentsFor } from "@/lib/documents";
import { DashboardHeader } from "@/components/dashboard-header";
import { DocumentList } from "@/components/document-list";
import { NewDocumentActions } from "@/components/new-document-actions";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { owned, shared } = await listDocumentsFor(user.id);

  return (
    <div>
      <DashboardHeader user={user} />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <NewDocumentActions />

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            My documents
          </h2>
          <DocumentList
            documents={owned}
            emptyMessage="You haven't created any documents yet."
            showSharedWith
          />
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Shared with me
          </h2>
          <DocumentList
            documents={shared}
            emptyMessage="No one has shared a document with you yet."
          />
        </section>
      </main>
    </div>
  );
}
