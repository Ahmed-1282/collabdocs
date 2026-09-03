import Link from "next/link";
import { DocumentIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-subtle)]">
          <DocumentIcon className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-lg font-semibold">Document not found</h1>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-[var(--text-muted)]">
          It may have been deleted, or it might not be shared with your account.
        </p>
        <Link
          href="/documents"
          className="mt-5 inline-block rounded-[var(--radius)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--primary-hover)]"
        >
          Back to my documents
        </Link>
      </div>
    </main>
  );
}
