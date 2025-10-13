"use client"

import { useReducer, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const deleteSchema = z
  .object({
    // Password is optional; if omitted, Better Auth will rely on "fresh" session
    password: z.string().optional(),
    confirm: z
      .string()
      .min(1, { message: "Type DELETE to confirm" })
      .refine((val) => val.trim().toUpperCase() === "DELETE", {
        message: 'You must type "DELETE"',
      }),
  })
  .refine((data) => (data.password ?? "").length === 0 || (data.password ?? "").length >= 1, {
    message: "Password cannot be empty",
    path: ["password"],
  })

type TDelete = z.infer<typeof deleteSchema>

export function DeleteAccountForm({
  callbackURL = "/goodbye", // where to send the user after deletion (optional)
}: {
  callbackURL?: string
}) {
  const router = useRouter()
  const [seePassword, toggleSeePassword] = useReducer((s) => !s, false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<TDelete>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { password: "", confirm: "" },
  })

  const onSubmit = async () => {
    setConfirmOpen(true) // open final confirm dialog
  }

  const actuallyDelete = async () => {
    const { password, confirm } = form.getValues()
    if ((confirm ?? "").trim().toUpperCase() !== "DELETE") {
      form.setError("confirm", { message: 'You must type "DELETE"' })
      return
    }

    setLoading(true)
    try {
      // Call Better Auth delete; choose one of these shapes:
      // 1) With password (strongest)
      // 2) Fresh session / or email verification configured (no password)
      const { error } = await authClient.deleteUser({
        // Password is optional; include if user provided it
        ...(password ? { password } : {}),
        // If you’ve set up sendDeleteAccountVerification, you can omit password entirely
        // and Better Auth will send a verification email (or rely on fresh session).
        callbackURL, // server will redirect after deletion, if applicable
      })

      if (error) throw new Error(error.message)

      toast.success("Your account has been deleted.")
      // In most setups the server clears sessions; still ensure we leave this page:
      router.replace(callbackURL || "/")
      router.refresh()
    } catch (e: any) {
      // Common cases: not fresh session, wrong password, feature disabled
      toast.error(e?.message ?? "Unable to delete your account")
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div className="mx-auto w-full">
      <Card>
        <CardHeader className="w-full items-center justify-center">
          <CardTitle className="text-lg md:text-xl">Delete your account</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Permanently remove your account and all associated data.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="border-destructive/40 bg-destructive/5 mb-4 rounded-md border p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-destructive mt-0.5 h-4 w-4" />
              <p>
                This action is <span className="font-semibold">permanent</span>. You will lose
                access to your account, sessions will be revoked, and data may be irrecoverable.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-1.5">
                        <Input
                          type={seePassword ? "text" : "password"}
                          placeholder="Enter your password (recommended)"
                          autoComplete="current-password"
                          disabled={loading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={toggleSeePassword}
                          disabled={loading}
                        >
                          {seePassword ? (
                            <EyeOffIcon className="h-4 w-4 text-zinc-700" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-zinc-700" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <p className="text-muted-foreground text-xs">
                      If you omit the password, deletion requires a recent sign-in (fresh session)
                      or an email verification (if configured).
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type DELETE to confirm</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DELETE"
                        disabled={loading}
                        autoComplete="off"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" variant="destructive" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…
                  </>
                ) : (
                  "Delete my account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Final confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm account deletion</DialogTitle>
            <DialogDescription>
              Are you absolutely sure? This will permanently delete your account and sign you out.
            </DialogDescription>
          </DialogHeader>

          <div className="border-destructive/40 bg-destructive/5 rounded-md border p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-destructive mt-0.5 h-4 w-4" />
              <p>
                This action cannot be undone. If you haven’t saved any important data, please do so
                before continuing.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={actuallyDelete} disabled={loading}>
              {loading ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
