"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CalendarIcon,
  FileTextIcon,
  Shield,
  ShieldOff,
  StickyNoteIcon,
  UserMinus2,
  UserPlus2,
  UsersIcon,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

interface UserRow {
  id: string
  name: string | null
  email: string
  role: string | null
  banned?: boolean
  banReason?: string | null
  banExpiresAt?: string | null
}

interface Stats {
  users: number
  posts: number
  pages: number
  events: number
}

const roleOptions = ["admin", "manager", "editor", "support", "user"] as const

const createSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(roleOptions),
})
type TCreate = z.infer<typeof createSchema>

const editSchema = z.object({
  name: z.string().optional(),
  role: z.enum(roleOptions),
})
type TEdit = z.infer<typeof editSchema>

const banSchema = z.object({
  reason: z.string().min(1, "Please provide a reason"),
  days: z.number("Days must be a number").int().min(0).max(365),
})
type TBan = z.infer<typeof banSchema>

export const AdminDashboard = ({ stats, users }: { stats: Stats; users: UserRow[] }) => {
  const { data: session } = authClient.useSession()
  const [rows, setRows] = useState<UserRow[]>(users)

  // Dialog state
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openBan, setOpenBan] = useState(false)
  const [selected, setSelected] = useState<UserRow | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Forms
  const createForm = useForm<TCreate>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", email: "", password: "", role: "user" },
  })
  const editForm = useForm<TEdit>({
    resolver: zodResolver(editSchema),
    values: selected
      ? { name: selected.name ?? "", role: (selected.role as any) || "user" }
      : { name: "", role: "user" },
  })
  const banForm = useForm<TBan>({
    resolver: zodResolver(banSchema),
    defaultValues: { reason: "", days: 0 },
  })

  const cards = useMemo(
    () => [
      { title: "Users", value: stats.users, icon: UsersIcon },
      { title: "Posts", value: stats.posts, icon: StickyNoteIcon },
      { title: "Pages", value: stats.pages, icon: FileTextIcon },
      { title: "Events", value: stats.events, icon: CalendarIcon },
    ],
    [stats]
  )

  // Handlers
  const openCreateDialog = () => {
    createForm.reset({ name: "", email: "", password: "", role: "user" })
    setOpenCreate(true)
  }

  const handleEdit = (user: UserRow) => {
    setSelected(user)
    editForm.reset({ name: user.name ?? "", role: (user.role as any) || "user" })
    setOpenEdit(true)
  }

  const handleDelete = (user: UserRow) => {
    setSelected(user)
    setOpenDelete(true)
  }

  const handleBan = (user: UserRow) => {
    setSelected(user)
    banForm.reset({ reason: "", days: 0 })
    setOpenBan(true)
  }

  const submitCreate = async (values: TCreate) => {
    try {
      const res = await authClient.admin.createUser(values as any)
      if (res?.error) throw new Error(res.error.message)
      toast.success("User created")
      setOpenCreate(false)
      setRows((prev) => [res.data as any, ...prev])
    } catch (e: any) {
      toast.error(e?.message ?? "Could not create user")
    }
  }

  const submitEdit = async (values: TEdit) => {
    if (!selected) return
    setBusyId(selected.id)

    // Normalize empties so comparisons are stable
    const prevRole = (selected.role ?? "user") as TEdit["role"]
    const nextRole = values.role
    const roleChanged = nextRole !== prevRole

    const prevName = selected.name ?? ""
    const nextName = values.name ?? ""
    const nameChanged = nextName !== prevName

    try {
      // 1) Update role if changed
      if (roleChanged) {
        const r = await authClient.admin.setRole({
          userId: selected.id,
          role: nextRole,
        } as any)
        if (r?.error) throw new Error(r.error.message)
      }

      // 2) Update other fields (name) if changed
      if (nameChanged) {
        const r2 = await authClient.admin.updateUser({
          id: selected.id,
          name: nextName,
        } as any)
        if (r2?.error) throw new Error(r2.error.message)
      }

      if (!roleChanged && !nameChanged) {
        toast.message("No changes to save")
      } else {
        toast.success("User updated")
        // Optimistic table update
        setRows((prev) =>
          prev.map((r) => (r.id === selected.id ? { ...r, name: nextName, role: nextRole } : r))
        )
      }

      setOpenEdit(false)
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update user")
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!selected) return
    setBusyId(selected.id)
    try {
      const res = await authClient.admin.removeUser({ id: selected.id } as any)
      if (res?.error) throw new Error(res.error.message)
      toast.success("User deleted")
      setOpenDelete(false)
      setRows((prev) => prev.filter((r) => r.id !== selected.id))
    } catch (e: any) {
      toast.error(e?.message ?? "Could not delete user")
    } finally {
      setBusyId(null)
    }
  }

  const submitBan = async (values: TBan) => {
    if (!selected) return
    setBusyId(selected.id)
    try {
      const expiresAt =
        values.days > 0
          ? new Date(Date.now() + values.days * 24 * 60 * 60 * 1000).toISOString()
          : null
      const res = await authClient.admin.banUser({
        id: selected.id,
        reason: values.reason,
        ...(expiresAt ? { expiresAt } : {}),
      } as any)
      if (res?.error) throw new Error(res.error.message)
      toast.success("User banned")
      setOpenBan(false)
      setRows((prev) =>
        prev.map((r) =>
          r.id === selected.id
            ? { ...r, banned: true, banReason: values.reason, banExpiresAt: expiresAt }
            : r
        )
      )
    } catch (e: any) {
      toast.error(e?.message ?? "Could not ban user")
    } finally {
      setBusyId(null)
    }
  }

  const clickUnban = async (user: UserRow) => {
    setBusyId(user.id)
    try {
      const res = await authClient.admin.unbanUser({ id: user.id } as any)
      if (res?.error) throw new Error(res.error.message)
      toast.success("User unbanned")
      setRows((prev) =>
        prev.map((r) =>
          r.id === user.id ? { ...r, banned: false, banReason: null, banExpiresAt: null } : r
        )
      )
    } catch (e: any) {
      toast.error(e?.message ?? "Could not unban user")
    } finally {
      setBusyId(null)
    }
  }

  const handleImpersonate = async (userId: string) => {
    try {
      const res = await authClient.admin.impersonateUser({ userId } as any)
      if (res?.error) throw new Error(res.error.message)
      toast.success("Impersonation started")
      // Usually you want to bounce to the app home (or user detail)
      window.location.href = "/dashboard"
    } catch (e: any) {
      toast.error(e?.message ?? "Could not impersonate user")
    }
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-semibold">Admin Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={openCreateDialog} className="mb-4">
        Create New User
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((user) => {
            const isSelf = session?.user.email === user.email
            return (
              <TableRow key={user.id}>
                <TableCell>{user.name || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role || "user"}</TableCell>
                <TableCell>
                  {user.banned ? (
                    <span className="text-destructive inline-flex items-center gap-1">
                      <ShieldOff className="h-4 w-4" />
                      Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <Shield className="h-4 w-4" />
                      Active
                    </span>
                  )}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button onClick={() => handleEdit(user)} variant="outline">
                    Edit
                  </Button>

                  {!isSelf && (
                    <>
                      {user.banned ? (
                        <Button
                          variant="secondary"
                          onClick={() => clickUnban(user)}
                          disabled={busyId === user.id}
                        >
                          <UserPlus2 className="mr-1 h-4 w-4" />
                          Unban
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => handleBan(user)}
                          disabled={busyId === user.id}
                        >
                          <UserMinus2 className="mr-1 h-4 w-4" />
                          Ban
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        onClick={() => handleImpersonate(user.id)}
                        title="Impersonate"
                      >
                        Impersonate
                      </Button>

                      <Button
                        onClick={() => handleDelete(user)}
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* CREATE */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>
              Set a temporary password and role (can be changed later).
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(submitCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporary password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min 8 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(submitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
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
                  Save
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
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The user will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={!!busyId && busyId === selected?.id}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BAN */}
      <Dialog open={openBan} onOpenChange={setOpenBan}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ban user</DialogTitle>
            <DialogDescription>
              Optionally set an expiration (in days). 0 means a permanent ban.
            </DialogDescription>
          </DialogHeader>
          <Form {...banForm}>
            <form onSubmit={banForm.handleSubmit(submitBan)} className="space-y-4">
              <FormField
                control={banForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Why is this account being banned?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={banForm.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires in (days)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        value={String(field.value)}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "")
                          field.onChange(v === "" ? 0 : parseInt(v))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="secondary" onClick={() => setOpenBan(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!!busyId && busyId === selected?.id}>
                  Ban
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
