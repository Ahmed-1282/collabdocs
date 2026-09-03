"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ACCEPT = ".txt,.md,.docx";

export function NewDocumentActions() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<"create" | "upload" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createBlank() {
    setPending("create");
    setError(null);

    const response = await fetch("/api/documents", { method: "POST" });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(body.error ?? "Could not create the document.");
      setPending(null);
      return;
    }
    router.push(`/documents/${body.id}`);
  }

  async function upload(file: File) {
    setPending("upload");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const body = await response.json().catch(() => ({}));

    // Reset so re-picking the same file still fires a change event.
    if (fileInput.current) fileInput.current.value = "";

    if (!response.ok) {
      setError(body.error ?? "Could not import that file.");
      setPending(null);
      return;
    }
    router.push(`/documents/${body.id}`);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={createBlank}
          disabled={pending !== null}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {pending === "create" ? "Creating…" : "New document"}
        </button>

        <button
          onClick={() => fileInput.current?.click()}
          disabled={pending !== null}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
        >
          {pending === "upload" ? "Importing…" : "Upload a file"}
        </button>

        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>

      <p className="mt-2 text-xs text-[var(--muted)]">
        Uploads become new editable documents. Supported types: .txt, .md, .docx
        (max 1 MB).
      </p>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
