import React, { Fragment } from "react"

import { lowlight } from "@/lib/tiptap/lowlight"

type JSONNode = {
  type?: string
  text?: string
  marks?: { type: string; attrs?: any }[]
  attrs?: Record<string, any>
  content?: JSONNode[]
}

function wrapWithMarks(children: React.ReactNode, marks?: JSONNode["marks"]) {
  if (!marks || marks.length === 0) return children
  return marks.reduceRight((acc, mark, i) => {
    switch (mark.type) {
      case "bold":
        return <strong key={`mk-${i}`}>{acc}</strong>
      case "italic":
        return <em key={`mk-${i}`}>{acc}</em>
      case "underline":
        return <u key={`mk-${i}`}>{acc}</u>
      case "code":
        return (
          <code key={`mk-${i}`} className="whitespace-pre-wrap">
            {acc}
          </code>
        )
      case "link": {
        const href = mark.attrs?.href ?? "#"
        const rel = "noopener noreferrer"
        const target = "_blank"
        return (
          <a key={`mk-${i}`} href={href} rel={rel} target={target}>
            {acc}
          </a>
        )
      }
      default:
        return <Fragment key={`mk-${i}`}>{acc}</Fragment>
    }
  }, children)
}

// Turn a lowlight HAST tree into React nodes (safely)
function renderHast(node: any, key?: React.Key): React.ReactNode {
  if (typeof node === "string") return node
  const { type, value, tagName, properties, children } = node

  if (type === "text") return value
  if (type === "element") {
    const Tag: any = tagName || "span"
    const props: Record<string, any> = {}
    if (properties) {
      for (const [k, v] of Object.entries(properties)) {
        if (k === "className" && Array.isArray(v)) props.className = v.join(" ")
        else props[k] = v
      }
    }
    return (
      <Tag key={key} {...props}>
        {Array.isArray(children) ? children.map((c: any, i: number) => renderHast(c, i)) : null}
      </Tag>
    )
  }
  if (Array.isArray(node)) return node.map((n, i) => renderHast(n, i))
  return null
}

function renderText(node: JSONNode, key: React.Key) {
  const text = node.text ?? ""
  return <Fragment key={key}>{wrapWithMarks(text, node.marks)}</Fragment>
}

function renderInlineNodes(nodes: JSONNode[] = []) {
  return nodes.map((n, i) => {
    if (n.type === "text") return renderText(n, i)
    // Inline hardBreak
    if (n.type === "hardBreak") return <br key={`br-${i}`} />
    // If you ever add images as inline nodes, render here
    return <Fragment key={`inline-${i}`}>{renderNode(n, i)}</Fragment>
  })
}

function styleFromTextAlign(attrs?: Record<string, any>) {
  const a = attrs || {}
  if (a.textAlign && ["left", "center", "right", "justify"].includes(a.textAlign)) {
    return { style: { textAlign: a.textAlign } }
  }
  return {}
}

function renderBlockChildren(nodes: JSONNode[] = []) {
  return nodes.map((n, i) => renderNode(n, i))
}

function renderCodeBlock(node: JSONNode, key: React.Key) {
  const language = node.attrs?.language
  const codeText = (node.content || [])
    .map((n) => (n.type === "text" && n.text ? n.text : ""))
    .join("")

  // Highlight with lowlight to HAST, then render to React safely
  let tree
  try {
    tree = language ? lowlight.highlight(language, codeText) : lowlight.highlightAuto(codeText)
  } catch {
    tree = [{ type: "text", value: codeText }]
  }

  return (
    <pre key={key}>
      <code>{renderHast({ type: "element", tagName: "span", children: tree })}</code>
    </pre>
  )
}

export function TipTapRenderer({ doc, className }: { doc: JSONNode; className?: string }) {
  const safeDoc =
    doc && typeof doc === "object" && (doc as any).type === "doc"
      ? doc
      : { type: "doc", content: [{ type: "paragraph" }] }

  return <div className={className}>{renderNode(safeDoc, "root")}</div>
}

function renderNode(node: JSONNode, key: React.Key): React.ReactNode {
  const t = node.type
  switch (t) {
    case "doc":
      return <div key={key}>{renderBlockChildren(node.content)}</div>

    case "paragraph":
      return (
        <p key={key} {...styleFromTextAlign(node.attrs)}>
          {renderInlineNodes(node.content)}
        </p>
      )

    case "heading": {
      const level = node.attrs?.level ?? 1
      const H: any = `h${Math.min(6, Math.max(1, level))}`
      return (
        <H key={key} {...styleFromTextAlign(node.attrs)}>
          {renderInlineNodes(node.content)}
        </H>
      )
    }

    case "blockquote":
      return <blockquote key={key}>{renderBlockChildren(node.content)}</blockquote>

    case "bulletList":
      return <ul key={key}>{renderBlockChildren(node.content)}</ul>

    case "orderedList":
      return <ol key={key}>{renderBlockChildren(node.content)}</ol>

    case "listItem":
      return <li key={key}>{renderBlockChildren(node.content)}</li>

    case "horizontalRule":
      return <hr key={key} />

    case "codeBlock":
      return renderCodeBlock(node, key)

    case "text":
      return renderText(node, key)

    case "hardBreak":
      return <br key={key} />

    default:
      // Fallback: render children
      return <div key={key}>{renderBlockChildren(node.content)}</div>
  }
}
