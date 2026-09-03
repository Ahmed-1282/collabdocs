"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { DashboardHeader } from "./dashboard-header";
import { EditorToolbar } from "./editor-toolbar";
import { ShareDialog } from "./share-dialog";
import { TitleInput } from "./title-input";
import { AlertIcon, CheckIcon, ChevronLeftIcon, EyeIcon, SpinnerIcon } from "./icons";

const AUTOSAVE_DELAY_MS = 800;

type SaveState = "saved" | "saving" | "unsaved" | "error";

export type WorkspaceDocument = {
  id: string;
  title: string;
  content: JSONContent;
  accessLevel: string;
  owner: { id: string; name: string; email: string };
  shares: { role: string; user: { id: string; name: string; email: string } }[];
};

export function DocumentWorkspace({
  user,
  document,
}: {
  user: { id: string; name: string; email: string };
  document: WorkspaceDocument;
}) {
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canEdit = document.accessLevel === "owner" || document.accessLevel === "editor";
  const isOwner = document.accessLevel === "owner";

  const save = useCallback(
    async (payload: { title?: string; content?: JSONContent }) => {
      setSaveState("saving");
      try {
        const response = await fetch(`/api/documents/${document.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          setErrorMessage(body.error ?? "Could not save your changes.");
          setSaveState("error");
          return;
        }

        setErrorMessage(null);
        setSaveState("saved");
      } catch {
        setErrorMessage("You appear to be offline. Your recent changes are not saved.");
        setSaveState("error");
      }
    },
    [document.id],
  );

  const editor = useEditor({
    // Next renders this component on the server first; TipTap must not.
    immediatelyRender: false,
    editable: canEdit,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: document.content,
    editorProps: {
      attributes: {
        class: "tiptap min-h-[62vh] px-6 py-10 sm:px-14 sm:py-14 focus:outline-none",
        "aria-label": "Document body",
      },
    },
    onUpdate: ({ editor }) => {
      if (!canEdit) return;
      setSaveState("unsaved");

      // Debounced autosave: one PATCH per pause in typing, not per keystroke.
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(
        () => save({ content: editor.getJSON() }),
        AUTOSAVE_DELAY_MS,
      );
    },
  });

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  // Warn before losing an in-flight edit on refresh or navigation.
  useEffect(() => {
    if (saveState !== "unsaved" && saveState !== "saving") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  return (
    <div className="min-h-screen">
      <DashboardHeader user={user}>
        <div className="flex min-w-0 items-center gap-1.5">
          <Link
            href="/documents"
            aria-label="Back to all documents"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
          >
            <ChevronLeftIcon />
          </Link>

          <TitleInput
            documentId={document.id}
            initialTitle={document.title}
            disabled={!canEdit}
            onSaveStateChange={setSaveState}
          />

          <SaveIndicator state={saveState} canEdit={canEdit} />

          <div className="ml-auto shrink-0 pl-2">
            {isOwner ? (
              <ShareDialog documentId={document.id} shares={document.shares} />
            ) : (
              <span className="hidden items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--text-muted)] sm:inline-flex">
                <EyeIcon className="h-3.5 w-3.5" />
                {document.accessLevel === "editor" ? "Can edit" : "View only"}
              </span>
            )}
          </div>
        </div>
      </DashboardHeader>

      <EditorToolbar editor={editor} disabled={!canEdit} />

      {!canEdit && (
        <p className="flex items-center justify-center gap-2 border-b border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-2 text-center text-xs text-[var(--warning-text)]">
          <EyeIcon className="h-3.5 w-3.5 shrink-0" />
          View-only access. Ask {document.owner.name} for edit access to make changes.
        </p>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="flex items-center justify-center gap-2 border-b border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-2 text-center text-xs text-[var(--danger)]"
        >
          <AlertIcon className="h-3.5 w-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}

      <main className="px-3 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-3xl rounded-[12px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}

function SaveIndicator({ state, canEdit }: { state: SaveState; canEdit: boolean }) {
  if (!canEdit) return null;

  const { label, Icon, className } = {
    saved: { label: "Saved", Icon: CheckIcon, className: "text-[var(--success)]" },
    saving: { label: "Saving…", Icon: SpinnerIcon, className: "text-[var(--text-muted)]" },
    unsaved: { label: "Unsaved", Icon: null, className: "text-[var(--text-subtle)]" },
    error: { label: "Save failed", Icon: AlertIcon, className: "text-[var(--danger)]" },
  }[state];

  return (
    <span
      role="status"
      aria-live="polite"
      className={`hidden shrink-0 items-center gap-1 text-xs whitespace-nowrap sm:inline-flex ${className}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
