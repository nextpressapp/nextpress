"use client"

import { useReducer, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, EyeIcon, EyeOffIcon } from "lucide-react"
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

  // 2FA dialog state
  const [showMfa, setShowMfa] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  const form = useForm<TSignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  const totpForm = useForm<TTOTP>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: "", trustDevice: true },
  })

  const onSubmit = async (values: TSignIn) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        // Better Auth will use this after the flow completes
        callbackURL: "/",
      },
      {
        onRequest: () => setIsPending(true),
        onResponse: () => setIsPending(false),
        onSuccess: async (ctx) => {
          // If user has 2FA enabled, Better Auth reports it here
          if ((ctx?.data as any)?.twoFactorRedirect) {
            setShowMfa(true)
            // don't redirect yet; finish TOTP first
            return
          }
          toast.success("Welcome to NextPress")
          router.refresh()
        },
        onError: async (ctx) => {
          toast.error(ctx.error.message)
        },
      }
    )
  }

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
      router.replace("/") // or use ctx.redirectURL if you store it
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message ?? "Invalid code, try again")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Card>
        <CardHeader className="items-center justify-center">
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
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

      {/* MFA dialog */}
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
