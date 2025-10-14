// components/dashboard/passkey-manager.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Check, Fingerprint, KeyRound, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
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
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Passkey = {
  id: string
  name?: string | null
  createdAt?: string | Date
  lastUsedAt?: string | Date | null
  deviceType?: string | null
  // add any other fields your API returns; these are optional for rendering
}

const renameSchema = z.object({
  name: z.string().min(1, "Please enter a name"),
})
type TRename = z.infer<typeof renameSchema>

export function PasskeyManager() {
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [registering, setRegistering] = useState(false)

  // rename dialog
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<Passkey | null>(null)
  const renameForm = useForm<TRename>({
    resolver: zodResolver(renameSchema),
    defaultValues: { name: "" },
  })

  // delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Passkey | null>(null)

  const defaultNewName = useMemo(() => {
    const ua =
      typeof navigator !== "undefined"
        ? [navigator.platform, (navigator as any).userAgentData?.platform]
            .filter(Boolean)
            .join(" / ")
        : "Device"
    return `Passkey on ${ua || "this device"}`
  }, [])

  async function load() {
    setLoading(true)
    try {
      // List the user's passkeys
      const res = await authClient.passkey.listUserPasskeys()
      if (res?.error) throw new Error(res.error.message)
      setPasskeys((res?.data as Passkey[]) ?? [])
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load passkeys")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function registerPasskey() {
    setRegistering(true)
    try {
      const res = await authClient.passkey.addPasskey({
        name: defaultNewName,
      })
      if (res?.error) throw new Error(res.error.message)
      toast.success("Passkey added")
      await load()
    } catch (e: any) {
      // Users often cancel the browser sheet — make this a soft error
      toast.error(e?.message ?? "Passkey registration was cancelled")
    } finally {
      setRegistering(false)
    }
  }

  function openRename(pk: Passkey) {
    setRenameTarget(pk)
    renameForm.reset({ name: pk.name || "" })
    setRenameOpen(true)
  }

  async function submitRename(values: TRename) {
    if (!renameTarget?.id) return
    setBusyId(renameTarget.id)
    try {
      const res = await authClient.passkey.updatePasskey({
        id: renameTarget.id,
        name: values.name,
      })
      if (res?.error) throw new Error(res.error.message)
      toast.success("Passkey renamed")
      setRenameOpen(false)
      await load()
    } catch (e: any) {
      toast.error(e?.message ?? "Could not rename passkey")
    } finally {
      setBusyId(null)
    }
  }

  function openDelete(pk: Passkey) {
    setDeleteTarget(pk)
    setDeleteOpen(true)
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) return
    setBusyId(deleteTarget.id)
    try {
      const res = await authClient.passkey.deletePasskey({ id: deleteTarget.id })
      if (res?.error) throw new Error(res.error.message)
      toast.success("Passkey removed")
      setDeleteOpen(false)
      await load()
    } catch (e: any) {
      toast.error(e?.message ?? "Could not delete passkey")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="w-full items-center justify-center">
        <CardTitle className="text-lg md:text-xl">Passkeys</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Use passkeys (Face ID, Touch ID, Windows Hello) for fast, phishing-resistant sign-in.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Fingerprint className="h-4 w-4" />
            {passkeys.length ? (
              <span>{passkeys.length} registered</span>
            ) : (
              <span>No passkeys yet</span>
            )}
          </div>
          <Button onClick={registerPasskey} disabled={registering}>
            {registering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding…
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add passkey
              </>
            )}
          </Button>
        </div>

        <Separator />

        {loading ? (
          <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : passkeys.length === 0 ? (
          <div className="text-muted-foreground rounded-md border p-4 text-sm">
            No passkeys registered yet. Click <strong>Add passkey</strong> to create one on this
            device. You can rename or remove it anytime.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passkeys.map((pk) => {
                  const created = pk.createdAt ? format(new Date(pk.createdAt), "PP p") : "—"
                  const lastUsed = pk.lastUsedAt ? format(new Date(pk.lastUsedAt), "PP p") : "—"
                  return (
                    <TableRow key={pk.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <KeyRound className="text-muted-foreground h-4 w-4" />
                          <span>{pk.name || "Unnamed passkey"}</span>
                          {pk.deviceType && (
                            <Badge variant="secondary" className="ml-1">
                              {pk.deviceType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{created}</TableCell>
                      <TableCell>{lastUsed}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openRename(pk)}
                            disabled={busyId === pk.id}
                            title="Rename"
                          >
                            {busyId === pk.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Pencil className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => openDelete(pk)}
                            disabled={busyId === pk.id}
                            title="Delete"
                          >
                            {busyId === pk.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename passkey</DialogTitle>
          </DialogHeader>
          <Form {...renameForm}>
            <form onSubmit={renameForm.handleSubmit(submitRename)} className="space-y-4">
              <FormField
                control={renameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. MacBook Pro, iPhone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2">
                <Button type="button" variant="secondary" onClick={() => setRenameOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busyId === renameTarget?.id}>
                  {busyId === renameTarget?.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Save
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this passkey?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-muted-foreground text-sm">
            You will no longer be able to sign in with this passkey. You can add it again later.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={busyId === deleteTarget?.id}>
              {busyId === deleteTarget?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removing…
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
