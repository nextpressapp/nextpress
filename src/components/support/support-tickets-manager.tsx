"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  MessageSquareMore,
  Pencil,
  Play,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { commentSchema, TicketInput, ticketSchema } from "@/lib/validators/ticket"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

type Author = { id: string; name: string | null; email: string | null }
type TicketComment = {
  id: string
  ticketId: string
  content: string
  createdAt: string | Date
  updatedAt: string | Date
  userId: string
  author: Author
}
type TicketRow = {
  id: string
  title: string
  description: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: Author
  comments: TicketComment[]
}

const STATUS_LABELS: Record<TicketRow["status"], string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
}

const STATUS_CLASSES: Record<TicketRow["status"], string> = {
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-sky-50 text-sky-700 border-sky-200",
  CLOSED: "bg-zinc-50 text-zinc-700 border-zinc-200",
}

const PRIORITY_CLASSES: Record<TicketRow["priority"], string> = {
  LOW: "bg-zinc-50 text-zinc-700 border-zinc-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-red-50 text-red-700 border-red-200",
}

type Action = {
  label: string
  to: TicketRow["status"]
  icon: React.ComponentType<{ className?: string }>
  variant?: "default" | "secondary" | "outline" | "destructive" | null | undefined
}

function getPrimaryAction(status: TicketRow["status"]): Action {
  switch (status) {
    case "OPEN":
      return { label: "Start progress", to: "IN_PROGRESS", icon: Play, variant: "secondary" }
    case "IN_PROGRESS":
      return { label: "Resolve", to: "RESOLVED", icon: CheckCircle2, variant: "default" }
    case "RESOLVED":
      return { label: "Close", to: "CLOSED", icon: Archive, variant: "secondary" }
    case "CLOSED":
      return { label: "Reopen", to: "OPEN", icon: RefreshCcw, variant: "default" }
  }
}

function getSecondaryActions(status: TicketRow["status"]): Action[] {
  switch (status) {
    case "OPEN":
      return [
        { label: "Resolve", to: "RESOLVED", icon: CheckCircle2 },
        { label: "Close", to: "CLOSED", icon: Archive },
      ]
    case "IN_PROGRESS":
      return [{ label: "Close", to: "CLOSED", icon: Archive }]
    case "RESOLVED":
      return [{ label: "Reopen", to: "OPEN", icon: RefreshCcw }]
    case "CLOSED":
      return []
  }
}

export function SupportTicketsManager({ initialTickets }: { initialTickets: TicketRow[] }) {
  const [rows, setRows] = useState<TicketRow[]>(initialTickets)
  const [openEdit, setOpenEdit] = useState(false)
  const [openComments, setOpenComments] = useState(false)
  const [selected, setSelected] = useState<TicketRow | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Filters
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | TicketRow["status"]>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | TicketRow["priority"]>("ALL")

  // Forms
  const editForm = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    values: selected
      ? { title: selected.title, description: selected.description, priority: selected.priority }
      : { title: "", description: "", priority: "MEDIUM" },
  })

  const commentForm = useForm<{ body: string }>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  })

  // API helpers (agent actions against same endpoints)
  const api = {
    update: async (id: string, values: TicketInput) => {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as TicketRow
    },
    remove: async (id: string) => {
      const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      return true
    },
    addComment: async (id: string, body: string) => {
      const res = await fetch(`/api/tickets/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as TicketComment
    },
    setStatus: async (id: string, status: TicketRow["status"]) => {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as TicketRow
    },
  }

  // Open dialogs
  const openEditDialog = (t: TicketRow) => {
    setSelected(t)
    editForm.reset({
      title: t.title,
      description: t.description,
      priority: t.priority,
    })
    setOpenEdit(true)
  }

  const openCommentsDialog = (t: TicketRow) => {
    setSelected(t)
    commentForm.reset({ body: "" })
    setOpenComments(true)
  }

  // Submitters
  const submitEdit = async (values: TicketInput) => {
    if (!selected) return
    setBusyId(selected.id)
    try {
      const updated = await api.update(selected.id, values)
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      setOpenEdit(false)
      toast.success("Ticket updated")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update ticket")
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async (t: TicketRow) => {
    setBusyId(t.id)
    try {
      await api.remove(t.id)
      setRows((prev) => prev.filter((r) => r.id !== t.id))
      toast.success("Ticket deleted")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete ticket")
    } finally {
      setBusyId(null)
    }
  }

  const addComment = async (values: { body: string }) => {
    if (!selected) return
    setBusyId(selected.id)
    try {
      const newComment = await api.addComment(selected.id, values.body)
      setRows((prev) =>
        prev.map((r) =>
          r.id === selected.id ? { ...r, comments: [newComment, ...r.comments] } : r
        )
      )
      commentForm.reset({ body: "" })
      toast.success("Comment added")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add comment")
    } finally {
      setBusyId(null)
    }
  }

  // Filtering
  const filtered = rows.filter((t) => {
    const matchesQ =
      !q ||
      t.title.toLowerCase().includes(q.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(q.toLowerCase()) ||
      (t.createdBy.email || "").toLowerCase().includes(q.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter
    return matchesQ && matchesStatus && matchesPriority
  })

  // Summary
  const counts = useMemo(() => {
    const total = filtered.length
    const byStatus = filtered.reduce<Record<TicketRow["status"], number>>(
      (acc, t) => ((acc[t.status] = (acc[t.status] || 0) + 1), acc),
      { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 } as any
    )
    return { total, byStatus }
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* Summary row (own grid, full width) */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs">Total</CardTitle>
            <CardDescription className="text-xs">Filtered</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.total}</CardContent>
        </Card>

        {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as TicketRow["status"][]).map((s) => (
          <Card key={s}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs">{STATUS_LABELS[s]}</CardTitle>
              <CardDescription className="text-xs">Tickets</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{counts.byStatus[s] || 0}</CardContent>
          </Card>
        ))}
      </section>

      {/* Filters row */}
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            className="pl-8"
            placeholder="Search title, description, requester…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => {
              const primary = getPrimaryAction(t.status)
              const secondary = getSecondaryActions(t.status)

              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="text-sm">
                    {t.createdBy.name || t.createdBy.email || "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${PRIORITY_CLASSES[t.priority]}`}
                    >
                      {t.priority.charAt(0) + t.priority.slice(1).toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[t.status]}`}
                    >
                      {STATUS_LABELS[t.status]}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(t.updatedAt), "PPp")}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(t)}>
                      <Pencil className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openCommentsDialog(t)}>
                      <MessageSquareMore className="mr-1 h-4 w-4" /> Comments
                    </Button>

                    {/* State-aware actions */}
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant={primary.variant ?? "default"}
                        size="sm"
                        onClick={async () => {
                          setBusyId(t.id)
                          try {
                            const updated = await api.setStatus(t.id, primary.to)
                            setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
                            toast.success(`${STATUS_LABELS[updated.status]} ✓`)
                          } catch (e: any) {
                            toast.error(e?.message ?? "Failed to update status")
                          } finally {
                            setBusyId(null)
                          }
                        }}
                        disabled={busyId === t.id}
                      >
                        <primary.icon className="mr-1 h-4 w-4" />
                        {primary.label}
                      </Button>

                      {secondary.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busyId === t.id}
                              aria-label="More actions"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {secondary.map((a) => (
                              <DropdownMenuItem
                                key={a.to}
                                onClick={async () => {
                                  setBusyId(t.id)
                                  try {
                                    const updated = await api.setStatus(t.id, a.to)
                                    setRows((prev) =>
                                      prev.map((r) => (r.id === updated.id ? updated : r))
                                    )
                                    toast.success(`${STATUS_LABELS[updated.status]} ✓`)
                                  } catch (e: any) {
                                    toast.error(e?.message ?? "Failed to update status")
                                  } finally {
                                    setBusyId(null)
                                  }
                                }}
                              >
                                <a.icon className="mr-2 h-4 w-4" />
                                {a.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => confirmDelete(t)}
                      disabled={busyId === t.id}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                  No tickets match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* EDIT (agents can update title/description/priority) */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit ticket</DialogTitle>
            <DialogDescription>Update ticket details</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(submitEdit)} className="space-y-4" noValidate>
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Short summary of the issue" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="Describe the problem in detail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger aria-label="Priority">
                          <SelectValue placeholder="Choose a priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
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

      {/* COMMENTS */}
      <Dialog open={openComments} onOpenChange={setOpenComments}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>Discuss the ticket with the requester</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">{selected.title}</div>
                <div className="text-muted-foreground text-sm">{selected.description}</div>
              </div>

              <Separator />

              <div className="max-h-80 space-y-3 overflow-auto pr-1">
                {selected.comments.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No comments yet.</div>
                ) : (
                  selected.comments.map((c) => (
                    <div key={c.id} className="rounded-md border p-2">
                      <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                        <span>{c.author.name || c.author.email}</span>
                        <span>{format(new Date(c.createdAt), "PPp")}</span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{c.content}</div>
                    </div>
                  ))
                )}
              </div>

              <Form {...commentForm}>
                <form
                  onSubmit={commentForm.handleSubmit(async (vals) => {
                    await addComment(vals)
                    // also update the selected dialog copy so newly added comment shows immediately
                    const latest = rows.find((r) => r.id === selected.id)
                    if (latest) setSelected(latest)
                  })}
                  className="space-y-3"
                >
                  <FormField
                    control={commentForm.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Add a comment</FormLabel>
                        <FormControl>
                          <Textarea rows={4} placeholder="Write your reply…" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setOpenComments(false)}
                    >
                      Close
                    </Button>
                    <Button type="submit" disabled={!!busyId && busyId === selected?.id}>
                      Post comment
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
