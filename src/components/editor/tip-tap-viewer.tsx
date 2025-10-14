"use client"

import { useMemo } from "react"
import Blockquote from "@tiptap/extension-blockquote"
import BulletList from "@tiptap/extension-bullet-list"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Heading from "@tiptap/extension-heading"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Link from "@tiptap/extension-link"
import OrderedList from "@tiptap/extension-ordered-list"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

import { lowlight } from "@/lib/tiptap/lowlight"

type JSONDoc = Record<string, any>

// Tailwind v4 utility bundle that mimics “prose” for common TipTap output
const proseClasses =
  "max-w-none text-zinc-900 dark:text-zinc-100 " +
  // spacing
  "[&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:mt-7 [&_h2]:mb-3 [&_h3]:mt-6 [&_h3]:mb-2 " +
  "[&_p]:my-4 [&_ul]:my-4 [&_ol]:my-4 [&_blockquote]:my-4 " +
  // headings
  "[&_h1]:text-4xl [&_h1]:font-bold " +
  "[&_h2]:text-3xl [&_h2]:font-semibold " +
  "[&_h3]:text-2xl [&_h3]:font-semibold " +
  "[&_h4]:text-xl [&_h4]:font-medium " +
  // lists
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 " +
  // links
  "[&_a]:underline [&_a]:underline-offset-4 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 " +
  // code (inline)
  "[&_code]:rounded [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono " +
  // code blocks
  "[&_pre]:rounded-lg [&_pre]:border [&_pre]:border-zinc-200 dark:[&_pre]:border-zinc-800 " +
  "[&_pre]:bg-zinc-50 dark:[&_pre]:bg-zinc-900 [&_pre]:p-4 [&_pre_code]:bg-transparent " +
  // blockquote
  "[&_blockquote]:border-l-4 [&_blockquote]:border-zinc-300 dark:[&_blockquote]:border-zinc-700 [&_blockquote]:pl-4 [&_blockquote]:italic"

export function TipTapViewer({ json }: { json: JSONDoc }) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({ heading: false, codeBlock: false }),
      Heading.configure({ levels: [1, 2, 3, 4] }),
      BulletList,
      OrderedList,
      Blockquote,
      HorizontalRule,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: true, autolink: true }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    []
  )

  const editor = useEditor({
    extensions,
    editable: false,
    content: json ?? { type: "doc", content: [] },
    immediatelyRender: false, // important for Next.js SSR
  })

  if (!editor) return null

  return (
    <article className={proseClasses}>
      <EditorContent editor={editor} />
    </article>
  )
}
