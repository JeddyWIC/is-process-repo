"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { useCallback, useState } from "react";

interface MeetingEditorProps {
  content: string;
  onChange: (html: string) => void;
}

type EditorType = ReturnType<typeof useEditor>;

function MenuBar({ editor }: { editor: EditorType }) {
  if (!editor) return null;

  const [showTableControls, setShowTableControls] = useState(false);

  const addTable = useCallback(() => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 4, withHeaderRow: true })
      .run();
    setShowTableControls(true);
  }, [editor]);

  const insertStatus = useCallback(
    (color: "green" | "yellow" | "red") => {
      const label = color.charAt(0).toUpperCase() + color.slice(1);
      const colorClass = `status-${color}`;
      editor
        .chain()
        .focus()
        .insertContent(
          `<span class="${colorClass}">${label}</span>&nbsp;`
        )
        .run();
    },
    [editor]
  );

  const btnClass = (active: boolean) =>
    `px-2 py-1 rounded text-sm font-medium transition-colors ${
      active
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
    }`;

  const isInTable = editor.isActive("table");

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-t-lg sticky top-16 z-40">
      {/* Text formatting */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))}>
        B
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))}>
        I
      </button>
      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Headings */}
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))}>
        H2
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive("heading", { level: 3 }))}>
        H3
      </button>
      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Lists & Checkboxes */}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))}>
        &bull; List
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))}>
        1. List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive("taskList")
            ? "bg-blue-600 text-white"
            : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 border border-green-300 dark:border-green-700"
        }`}
      >
        &#9745; To-Do
      </button>
      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Table controls */}
      <button type="button" onClick={addTable} className={btnClass(false)}>
        + Table
      </button>
      {(isInTable || showTableControls) && (
        <>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className={btnClass(false)}>
            +Row
          </button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className={btnClass(false)}>
            +Col
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className={btnClass(false)}>
            -Row
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className={btnClass(false)}>
            -Col
          </button>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().deleteTable().run();
              setShowTableControls(false);
            }}
            className="px-2 py-1 rounded text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            Del Table
          </button>
        </>
      )}
      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Status colors */}
      <button
        type="button"
        onClick={() => insertStatus("green")}
        className="px-2 py-1 rounded text-sm font-bold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400"
      >
        Green
      </button>
      <button
        type="button"
        onClick={() => insertStatus("yellow")}
        className="px-2 py-1 rounded text-sm font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400"
      >
        Yellow
      </button>
      <button
        type="button"
        onClick={() => insertStatus("red")}
        className="px-2 py-1 rounded text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400"
      >
        Red
      </button>
      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Other */}
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))}>
        Quote
      </button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)}>
        &mdash;
      </button>
    </div>
  );
}

export default function MeetingEditor({ content, onChange }: MeetingEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none p-4 min-h-[500px] focus:outline-none dark:prose-invert",
      },
    },
  });

  if (!editor) {
    return <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900 min-h-[500px]" />;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
