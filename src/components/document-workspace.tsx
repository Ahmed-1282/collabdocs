"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { DashboardHeader } from "./dashboard-header";
import { EditorToolbar } from "./editor-toolbar";
import { ShareDialog } from "./share-dialog";
import { TitleInput } from "./title-input";

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
        setErrorMessage("You appear to be offline. Changes are not saved.");
        setSaveState("error");
      }
    },
    [document.id],
  );

  const editor = useEditor({
    // Next renders this component on the server first; TipTap must not.
    immediatelyRender: false,
    editable: canEdit,
    extensions: [StarterKit, Underline],
    content: document.content,
    editorProps: {
      attributes: {
        class: "tiptap min-h-[60vh] px-14 py-12 focus:outline-none",
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
    <div>
      <DashboardHeader user={user}>
        <div className="flex min-w-0 items-center gap-3">
          <TitleInput
            documentId={document.id}
            initialTitle={document.title}
            disabled={!canEdit}
            onSaveStateChange={setSaveState}
          />
          <SaveIndicator state={saveState} canEdit={canEdit} />
          {isOwner && <ShareDialog documentId={document.id} shares={document.shares} />}
        </div>
      </DashboardHeader>

      <EditorToolbar editor={editor} disabled={!canEdit} />

      {!canEdit && (
        <p className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-900">
          You have view-only access to this document. Ask{" "}
          {document.owner.name} for edit access to make changes.
        </p>
      )}

      {errorMessage && (
        <p role="alert" className="border-b border-red-200 bg-red-50 px-6 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <main className="mx-auto my-8 max-w-3xl rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <EditorContent editor={editor} />
      </main>
    </div>
  );
}

function SaveIndicator({ state, canEdit }: { state: SaveState; canEdit: boolean }) {
  if (!canEdit) return null;

  const label = {
    saved: "All changes saved",
    saving: "Saving…",
    unsaved: "Unsaved changes",
    error: "Save failed",
  }[state];

  return (
    <span
      role="status"
      aria-live="polite"
      className={`shrink-0 text-xs ${state === "error" ? "text-red-600" : "text-[var(--muted)]"}`}
    >
      {label}
    </span>
  );
}
