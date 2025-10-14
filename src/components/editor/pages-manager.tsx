"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { EyeIcon, Pencil, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TipTapEditor } from "@/components/editor/tip-tap-editor"
import { TipTapViewer } from "@/components/editor/tip-tap-viewer"

type PageRow = {
  id: string
  slug: string
  title: string
  description: string
  content: string | null
  published: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

const pageSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and dashes"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  published: z.boolean(),
})
type PageInput = z.infer<typeof pageSchema>

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] }

export function PageManager({ initialPages }: { initialPages: PageRow[] }) {
  const [rows, setRows] = useState<PageRow[]>(initialPages)
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)
  const [selected, setSelected] = useState<PageRow | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // TipTap content state (JSON) for the editor
  const [editorJson, setEditorJson] = useState<any>(null)

  // JSON used by the viewer (preview)
  const [previewJson, setPreviewJson] = useState<any>(EMPTY_DOC)

  // Forms
  const createForm = useForm<PageInput>({
    resolver: zodResolver(pageSchema),
    defaultValues: { slug: "", title: "", description: "", published: false },
  })

  const editForm = useForm<PageInput>({
    resolver: zodResolver(pageSchema),
    values: selected
      ? {
          slug: selected.slug,
          title: selected.title,
          description: selected.description,
          published: !!selected.published,
        }
      : { slug: "", title: "", description: "", published: false },
  })

  // API helpers against /api/pages
  const api = {
    create: async (payload: any) => {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as PageRow
    },
    update: async (id: string, payload: any) => {
      const res = await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as PageRow
    },
    remove: async (id: string) => {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      return true
    },
  }

  // Open dialogs
  const openCreateDialog = () => {
    createForm.reset({ slug: "", title: "", description: "", published: false })
    setEditorJson(EMPTY_DOC)
    setOpenCreate(true)
  }

  const openEditDialog = (p: PageRow) => {
    setSelected(p)
    editForm.reset({
      slug: p.slug,
      title: p.title,
      description: p.description,
      published: !!p.published,
    })
    try {
      setEditorJson(p.content ? JSON.parse(p.content) : EMPTY_DOC)
    } catch {
      setEditorJson(EMPTY_DOC)
    }
    setOpenEdit(true)
  }

  const confirmDelete = (p: PageRow) => {
    setSelected(p)
    setOpenDelete(true)
  }

  const openRowPreview = (p: PageRow) => {
    setSelected(p)
    try {
      setPreviewJson(p.content ? JSON.parse(p.content) : EMPTY_DOC)
    } catch {
      setPreviewJson(EMPTY_DOC)
    }
    setOpenPreview(true)
  }

  // Submitters
  const submitCreate = async (values: PageInput) => {
    const payload = {
      ...values,
      content: JSON.stringify(editorJson ?? EMPTY_DOC),
    }
    try {
      const created = await api.create(payload)
      setRows((prev) => [created, ...prev])
      setOpenCreate(false)
      toast.success("Page created", { description: created.title })
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create page")
    }
  }

  const submitEdit = async (values: PageInput) => {
    if (!selected) return
    setBusyId(selected.id)
    const payload = {
      ...values,
      content: JSON.stringify(editorJson ?? EMPTY_DOC),
    }
    try {
      const updated = await api.update(selected.id, payload)
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      setOpenEdit(false)
      toast.success("Page updated")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update page")
    } finally {
      setBusyId(null)
    }
  }

  const doDelete = async () => {
    if (!selected) return
    setBusyId(selected.id)
    try {
      await api.remove(selected.id)
      setRows((prev) => prev.filter((r) => r.id !== selected.id))
      toast.success("Page deleted")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete page")
    } finally {
      setBusyId(null)
      setOpenDelete(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Page
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{p.slug}</TableCell>
                <TableCell>{p.published ? "Published" : "Draft"}</TableCell>
                <TableCell>{format(new Date(p.updatedAt), "PPp")}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button variant="outline" size="sm" onClick={() => openRowPreview(p)}>
                    <EyeIcon className="mr-1 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(p)}>
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => confirmDelete(p)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-10 text-center text-sm">
                  No pages yet. Create your first page.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* CREATE */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>New page</DialogTitle>
            <DialogDescription>Create a new page</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form className="space-y-4" onSubmit={createForm.handleSubmit(submitCreate)} noValidate>
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Page title" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={createForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="my-page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border p-3">
                      <FormLabel className="m-0">Published</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Short description (SEO, listings)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TipTap editor */}
              <div className="space-y-1">
                <div className="text-sm font-medium">Content</div>
                <TipTapEditor
                  initialJson={editorJson}
                  onChangeJson={setEditorJson}
                  placeholder="Write your page content…"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPreviewJson(editorJson ?? EMPTY_DOC)
                    setOpenPreview(true)
                  }}
                >
                  <EyeIcon className="mr-1 h-4 w-4" />
                  Preview
                </Button>
                <div className="flex-1" />
                <Button type="button" variant="secondary" onClick={() => setOpenCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* EDIT */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit page</DialogTitle>
            <DialogDescription>Update page details</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="space-y-4" onSubmit={editForm.handleSubmit(submitEdit)} noValidate>
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Page title" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="my-page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border p-3">
                      <FormLabel className="m-0">Published</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Short description (SEO, listings)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-1">
                <div className="text-sm font-medium">Content</div>
                <TipTapEditor
                  initialJson={editorJson}
                  onChangeJson={setEditorJson}
                  placeholder="Write your page content…"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPreviewJson(editorJson ?? EMPTY_DOC)
                    setOpenPreview(true)
                  }}
                >
                  <EyeIcon className="mr-1 h-4 w-4" />
                  Preview
                </Button>
                <div className="flex-1" />
                <Button type="button" variant="secondary" onClick={() => setOpenEdit(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!!busyId && busyId === selected?.id}>
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete page</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={doDelete}
              disabled={!!busyId && busyId === selected?.id}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PREVIEW (TipTapViewer) */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogDescription>This is how your page will render.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto">
            <TipTapViewer json={previewJson} />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
