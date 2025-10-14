"use client"

import { useEffect, useReducer, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, EyeIcon, EyeOffIcon, Fingerprint, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})
type TSignIn = z.infer<typeof signInSchema>

const totpSchema = z.object({
  code: z
    .string()
    .min(6, { message: "Enter the 6-digit code" })
    .max(6, { message: "Enter the 6-digit code" })
    .regex(/^\d{6}$/, { message: "Code must be 6 digits" }),
  trustDevice: z.boolean().optional(),
})
type TTOTP = z.infer<typeof totpSchema>

export const SignInForm = () => {
  const router = useRouter()
  const [seePassword, toggleSeePassword] = useReducer((state) => !state, false)
  const [isPending, setIsPending] = useState(false)

  // Passkey state
  const [pkPending, setPkPending] = useState(false)

  // 2FA dialog state
  const [showMfa, setShowMfa] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  // ensure conditional UI runs only once per mount
  const triedAutofillRef = useRef(false)

  const form = useForm<TSignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  const totpForm = useForm<TTOTP>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: "", trustDevice: true },
  })

  // ---------- PASSKEY: Conditional UI (autofill) ----------
  useEffect(() => {
    if (triedAutofillRef.current) return
    triedAutofillRef.current = true

    const canWebAuthn = typeof window !== "undefined" && "PublicKeyCredential" in window
    if (!canWebAuthn) return

    // experimental helper in some browsers
    // @ts-expect-error experimental
    const isConditional = window.PublicKeyCredential?.isConditionalMediationAvailable

    ;(async () => {
      try {
        if (!isConditional || (await isConditional())) {
          // Important: no callbackURL here; we'll redirect only if success
          const res = await authClient.signIn.passkey({ autoFill: true })
          if (res && !res.error) {
            // success -> go to dashboard
            window.location.href = "/dashboard"
          }
          // on error or cancel -> stay on page; do nothing
        }
      } catch {
        // NotAllowed/cancel during autofill: ignore silently
      }
    })()
  }, [])

  // ---------- EMAIL + PASSWORD ----------
  const onSubmit = async (values: TSignIn) => {
    await authClient.signIn.email(
      { email: values.email, password: values.password, callbackURL: "/dashboard" },
      {
        onRequest: () => setIsPending(true),
        onResponse: () => setIsPending(false),
        onSuccess: async (ctx) => {
          if ((ctx?.data as any)?.twoFactorRedirect) {
            setShowMfa(true)
            return
          }
          toast.success("Welcome to NextPress")
          // callbackURL will navigate; the refresh below is a no-op if we've already moved
          router.refresh()
        },
        onError: async (ctx) => {
          toast.error(ctx.error.message)
        },
      }
    )
  }

  // ---------- PASSKEY: Button flow (forced sheet) ----------
  const signInWithPasskey = async () => {
    setPkPending(true)
    try {
      const res = await authClient.signIn.passkey({
        autoFill: false, // force the platform sheet
      })
      if (res?.error) throw new Error(res.error.message)

      toast.success("Signed in with passkey")
      window.location.href = "/dashboard"
    } catch (e: any) {
      const name = e?.name || ""
      const msg = e?.message || ""
      if (name === "NotAllowedError") {
        toast.error("No matching passkey found or request was cancelled.")
      } else if (name === "InvalidStateError") {
        toast.error("This passkey can’t be used here. Try another or re-register it.")
      } else if (name === "SecurityError") {
        toast.error("Security error. Check domain and HTTPS (localhost is allowed).")
      } else {
        toast.error(msg || "Passkey sign-in failed")
      }

      console.error("webauthn signin error:", e)
    } finally {
      setPkPending(false)
    }
  }

  // ---------- 2FA VERIFY ----------
  const verifyTotp = async (values: TTOTP) => {
    setVerifying(true)
    try {
      const res = await authClient.twoFactor.verifyTotp(
        { code: values.code, trustDevice: !!values.trustDevice },
        {
          onError: (ctx) => {
            throw new Error(ctx.error.message)
          },
        }
      )
      if (res.error) throw new Error(res.error.message)

      setVerified(true)
      toast.success("Two-factor verified. Signing you in…")
      setShowMfa(false)
      window.location.href = "/dashboard"
    } catch (e: any) {
      toast.error(e?.message ?? "Invalid code, try again")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      {/* Hidden input improves Conditional UI matching in Chrome */}
      <input
        type="text"
        name="webauthn-username"
        autoComplete="username webauthn"
        className="sr-only"
      />

      <Card>
        <CardHeader className="items-center justify-center">
          <CardTitle>Login</CardTitle>
          <CardDescription>Use a passkey or your password to access your account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Passkey button */}
          <Button
            className="w-full"
            variant="outline"
            onClick={signInWithPasskey}
            disabled={pkPending}
          >
            {pkPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…
              </>
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" />
                Continue with Passkey
              </>
            )}
          </Button>

          <div className="text-muted-foreground text-center text-xs">or</div>

          {/* Email + password */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        disabled={isPending}
                        autoFocus
                        type="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="text-muted-foreground hover:text-primary text-xs transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="flex items-center space-x-1.5">
                        <Input
                          disabled={isPending}
                          type={seePassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={toggleSeePassword}
                        >
                          {seePassword ? (
                            <EyeOffIcon className="h-4 w-4 text-zinc-700" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-zinc-700" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing In…" : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter>
          <p className="text-muted-foreground text-sm">
            Don&#39;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* MFA dialog (for password-based sign-in when 2FA is enabled) */}
      <Dialog open={showMfa} onOpenChange={setShowMfa}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app to finish signing in.
            </DialogDescription>
          </DialogHeader>

          <Form {...totpForm}>
            <form onSubmit={totpForm.handleSubmit(verifyTotp)} className="space-y-4">
              <FormField
                control={totpForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authenticator code</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={totpForm.control}
                name="trustDevice"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <Checkbox
                      id="trust-device"
                      checked={!!field.value}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                    />
                    <label htmlFor="trust-device" className="text-sm leading-none">
                      Trust this device
                    </label>
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowMfa(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={verifying || verified}>
                  {verifying ? (
                    "Verifying…"
                  ) : verified ? (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Verified
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
