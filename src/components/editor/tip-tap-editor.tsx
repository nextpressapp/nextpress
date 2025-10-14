"use client"

import { useMemo } from "react"
import Blockquote from "@tiptap/extension-blockquote"
import BulletList from "@tiptap/extension-bullet-list"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Heading from "@tiptap/extension-heading"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Link from "@tiptap/extension-link"
import OrderedList from "@tiptap/extension-ordered-list"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

// ✅ use your lowlight instance
import { lowlight } from "@/lib/tiptap/lowlight"

type TipTapJSON = Record<string, any>

export function TipTapEditor({
  initialJson,
  onChangeJson,
  placeholder = "Write your content…",
  readOnly = false,
}: {
  initialJson?: TipTapJSON | null
  onChangeJson: (doc: TipTapJSON) => void
  placeholder?: string
  readOnly?: boolean
}) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: false, // use custom Heading config
        codeBlock: false, // replaced by lowlight version
      }),
      Heading.configure({ levels: [1, 2, 3, 4] }),
      BulletList,
      OrderedList,
      Blockquote,
      HorizontalRule,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        protocols: ["http", "https", "mailto"],
      }),
      CodeBlockLowlight.configure({ lowlight }), // ✅ fixed
      Placeholder.configure({ placeholder }),
    ],
    [placeholder]
  )

  const editor = useEditor({
    extensions,
    editable: !readOnly,
    content: initialJson ?? { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => onChangeJson(editor.getJSON()),
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <div className="rounded-md border">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 border-b p-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            Bold
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            Italic
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            Underline
          </ToolbarButton>
          <ToolbarDivider />
          {[1, 2, 3, 4].map((lvl) => (
            <ToolbarButton
              key={lvl}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: lvl as 1 | 2 | 3 | 4 })
                  .run()
              }
              active={editor.isActive("heading", { level: lvl })}
            >
              H{lvl}
            </ToolbarButton>
          ))}
          <ToolbarDivider />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            1. List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          >
            ❝ Quote
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            — HR
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
          >
            ⬅︎
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
          >
            ↔︎
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
          >
            ➡︎
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
          >
            {"</>"}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              const url = prompt("Enter URL")
              if (!url) return
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
            }}
            active={editor.isActive("link")}
          >
            Link
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
          >
            Unlink
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton onClick={() => editor.chain().undo().run()}>Undo</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().redo().run()}>Redo</ToolbarButton>
        </div>
      )}

      <div className="prose-wrapper p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded border px-2 py-1 text-xs ${
        disabled
          ? "opacity-50"
          : active
            ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
}
