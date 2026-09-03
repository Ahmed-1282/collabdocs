"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const RENAME_DEBOUNCE_MS = 600;

export function TitleInput({
  documentId,
  initialTitle,
  disabled,
  onSaveStateChange,
}: {
  documentId: string;
  initialTitle: string;
  disabled: boolean;
  onSaveStateChange: (state: "saved" | "saving" | "unsaved" | "error") => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function rename(value: string) {
    setTitle(value);
    if (timer.current) clearTimeout(timer.current);

    // An empty box is a valid intermediate state while typing; don't PATCH it.
    if (!value.trim()) return;

    onSaveStateChange("unsaved");
    timer.current = setTimeout(async () => {
      onSaveStateChange("saving");
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: value.trim() }),
      });
      onSaveStateChange(response.ok ? "saved" : "error");
      // Keep the dashboard's copy of the title in step.
      if (response.ok) router.refresh();
    }, RENAME_DEBOUNCE_MS);
  }

  return (
    <input
      value={title}
      disabled={disabled}
      aria-label="Document title"
      onChange={(event) => rename(event.target.value)}
      onBlur={() => !title.trim() && setTitle(initialTitle)}
      className="min-w-0 max-w-[20rem] flex-1 truncate rounded-md bg-transparent px-2 py-1 text-sm font-semibold outline-none ring-1 ring-transparent transition-[background-color,box-shadow] duration-150 hover:bg-[var(--surface-muted)] focus:bg-[var(--surface)] focus:ring-[var(--primary)] disabled:cursor-default disabled:hover:bg-transparent"
    />
  );
}
