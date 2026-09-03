"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "./use-mounted";
import { useRouter } from "next/navigation";
import { AlertIcon, PlusIcon, SpinnerIcon, UploadIcon } from "./icons";

const ACCEPT = ".txt,.md,.docx";

export function NewDocumentActions() {
  const router = useRouter();
  const mounted = useMounted();

  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<"create" | "upload" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

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

  // Drag-and-drop anywhere on the page, with the window as the drop target so
  // users don't have to hit a small zone. The click path stays available.
  useEffect(() => {
    let depth = 0;

    const onDragEnter = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      depth++;
      setDragging(true);
    };
    const onDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    };
    const onDragLeave = () => {
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const onDrop = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      depth = 0;
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) upload(file);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
    // upload is stable for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full sm:w-auto sm:shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={createBlank}
          disabled={pending !== null}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius)] bg-[var(--primary)] px-3.5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--primary-hover)] disabled:cursor-wait disabled:opacity-60 sm:flex-none"
        >
          {pending === "create" ? <SpinnerIcon /> : <PlusIcon />}
          {pending === "create" ? "Creating…" : "New document"}
        </button>

        <button
          onClick={() => fileInput.current?.click()}
          disabled={pending !== null}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium transition-colors duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] disabled:cursor-wait disabled:opacity-60 sm:flex-none"
        >
          {pending === "upload" ? <SpinnerIcon /> : <UploadIcon />}
          {pending === "upload" ? "Importing…" : "Upload"}
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

      <p className="mt-1.5 text-[11px] text-[var(--text-subtle)] sm:text-right">
        Drop or upload .txt, .md, .docx — max 1 MB
      </p>

      {error && (
        <p
          role="alert"
          className="mt-2 flex items-start gap-1.5 rounded-[var(--radius)] bg-[var(--danger-soft)] px-2.5 py-2 text-xs text-[var(--danger)]"
        >
          <AlertIcon className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {dragging && mounted && createPortal(
        <div className="animate-fade-in pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[var(--primary-soft)]/85 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-[16px] border-2 border-dashed border-[var(--primary)] bg-[var(--surface)] px-10 py-8 shadow-[var(--shadow-lg)]">
            <UploadIcon className="h-7 w-7 text-[var(--primary)]" />
            <p className="mt-2.5 text-sm font-semibold">Drop to import</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              .txt, .md, or .docx — max 1 MB
            </p>
          </div>
        </div>,
        window.document.body,
      )}
    </div>
  );
}
