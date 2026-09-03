"use client";

import type { Editor } from "@tiptap/react";
import {
  BoldIcon,
  BulletListIcon,
  ItalicIcon,
  OrderedListIcon,
  QuoteIcon,
  RedoIcon,
  UnderlineIcon,
  UndoIcon,
} from "./icons";

/**
 * Buttons prevent mousedown so the editor keeps its selection — without this,
 * clicking a toolbar button blurs the document and the formatting applies to
 * nothing.
 */
function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  shortcut,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  shortcut?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={shortcut ? `${label} (${shortcut})` : label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-1.5 text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--border)]" />;
}

export function EditorToolbar({
  editor,
  disabled,
}: {
  editor: Editor | null;
  disabled: boolean;
}) {
  if (!editor) return null;

  const blockValue = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : "p";

  function setBlock(value: string) {
    const chain = editor!.chain().focus();
    if (value === "p") chain.setParagraph().run();
    else chain.setHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 }).run();
  }

  return (
    <div className="sticky top-14 z-20 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
      <div
        role="toolbar"
        aria-label="Text formatting"
        aria-disabled={disabled}
        className="mx-auto flex max-w-3xl flex-wrap items-center gap-0.5 px-3 py-1.5"
      >
        <select
          aria-label="Text style"
          disabled={disabled}
          value={blockValue}
          onChange={(event) => setBlock(event.target.value)}
          className="mr-1 h-8 cursor-pointer rounded-md border border-transparent bg-transparent px-1.5 text-sm text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <option value="p">Body text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <Divider />

        <ToolbarButton
          label="Bold"
          shortcut="Ctrl+B"
          disabled={disabled}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          shortcut="Ctrl+I"
          disabled={disabled}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          shortcut="Ctrl+U"
          disabled={disabled}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Bulleted list"
          disabled={disabled}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <BulletListIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          disabled={disabled}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <OrderedListIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          disabled={disabled}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <QuoteIcon />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Undo"
          shortcut="Ctrl+Z"
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <UndoIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          shortcut="Ctrl+Shift+Z"
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <RedoIcon />
        </ToolbarButton>
      </div>
    </div>
  );
}
