"use client"

import { useEffect, useReducer, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Copy, Download, EyeIcon, EyeOffIcon, ShieldCheck, ShieldOff } from "lucide-react"
import { useForm } from "react-hook-form"
import QRCode from "react-qr-code"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Separator } from "@/components/ui/separator"

const twoFactorSchema = z.object({
  password: z.string().min(1, { message: "Please enter your password" }),
})

const verifySchema = z.object({
  code: z
    .string()
    .min(6, { message: "Enter the 6-digit code" })
    .max(6, { message: "Enter the 6-digit code" })
    .regex(/^\d{6}$/, { message: "Code must be 6 digits" }),
  trustDevice: z.boolean().optional(),
})

const disableSchema = z.object({
  password: z.string().min(1, { message: "Please confirm your password to disable 2FA" }),
})

type TEnable = z.infer<typeof twoFactorSchema>
type TVerify = z.infer<typeof verifySchema>
type TDisable = z.infer<typeof disableSchema>

type EnableResponse = {
  totpURI: string
  backupCodes: string[]
}

export const TwoFactorForm = () => {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const [seePassword, toggleSeePassword] = useReducer((s) => !s, false)
  const [loading, setLoading] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [enableData, setEnableData] = useState<EnableResponse | null>(null)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [copied, setCopied] = useState(false)

  // Disable flow dialog
  const [disableOpen, setDisableOpen] = useState(false)
  const [disabling, setDisabling] = useState(false)
  const [seeDisablePassword, toggleSeeDisablePassword] = useReducer((s) => !s, false)

  const isEnabled = !!session?.user?.twoFactorEnabled

  // Enable (password confirm) form
  const enableForm = useForm<TEnable>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { password: "" },
  })

  // Verify TOTP form
  const verifyForm = useForm<TVerify>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "", trustDevice: true },
  })

  // Disable (password confirm) form
  const disableForm = useForm<TDisable>({
    resolver: zodResolver(disableSchema),
    defaultValues: { password: "" },
  })

  const handleEnable = async (values: TEnable) => {
    setLoading(true)
    try {
      const res = await authClient.twoFactor.enable({ password: values.password })
      if (res.error) throw new Error(res.error.message)
      const data = res.data as EnableResponse
      setEnableData(data)
      setDialogOpen(true)
      toast.success("Two-factor setup started. Scan the code and verify.")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to start 2FA setup")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUri = async () => {
    if (!enableData?.totpURI) return
    await navigator.clipboard.writeText(enableData.totpURI)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const downloadBackupCodes = () => {
    if (!enableData?.backupCodes?.length) return
    const content =
      `Backup codes for your account\n` +
      `Keep these codes in a safe place. Each code can be used once.\n\n` +
      enableData.backupCodes.join("\n") +
      "\n"
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "backup-codes.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleVerify = async (values: TVerify) => {
    if (!enableData?.totpURI) {
      toast.error("No TOTP session found. Restart setup.")
      return
    }
    setVerifyLoading(true)
    try {
      const res = await authClient.twoFactor.verifyTotp({
        code: values.code,
        trustDevice: !!values.trustDevice,
      })
      if (res.error) throw new Error(res.error.message)
      setVerified(true)
      toast.success("Two-factor enabled!")
      setDialogOpen(false)
      // refresh session to reflect twoFactorEnabled = true
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message ?? "Invalid code, try again")
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleDisable = async (values: TDisable) => {
    setDisabling(true)
    try {
      const res = await authClient.twoFactor.disable({ password: values.password })
      if (res.error) throw new Error(res.error.message)
      toast.success("Two-factor disabled.")
      setDisableOpen(false)
      disableForm.reset({ password: "" })
      // refresh session to reflect twoFactorEnabled = false
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message ?? "Could not disable 2FA")
    } finally {
      setDisabling(false)
    }
  }

  // Clear verify state if the dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      setEnableData(null)
      setVerified(false)
      verifyForm.reset({ code: "", trustDevice: true })
      enableForm.reset({ password: "" })
    }
  }, [dialogOpen, enableForm, verifyForm])

  return (
    <div className="mx-auto w-full">
      <Card>
        <CardHeader className="w-full items-center justify-center">
          <CardTitle className="text-lg md:text-xl">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Add an extra layer of security to your account.
          </CardDescription>

          <div className="mt-3 flex items-center gap-2">
            {isEnabled ? (
              <Badge variant="default" className="gap-1">
                <ShieldCheck className="h-4 w-4" /> Enabled
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <ShieldOff className="h-4 w-4" /> Disabled
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEnabled ? (
            <>
              <p className="text-muted-foreground text-sm">
                Two-factor authentication is currently enabled on your account. You can disable it
                below after confirming your password.
              </p>

              <Button variant="destructive" className="w-full" onClick={() => setDisableOpen(true)}>
                Disable 2FA
              </Button>
            </>
          ) : (
            <>
              {/* Enable flow (password confirm) */}
              <Form {...enableForm}>
                <form onSubmit={enableForm.handleSubmit(handleEnable)} className="space-y-6">
                  <FormField
                    control={enableForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm your password</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-1.5">
                            <Input
                              disabled={loading}
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

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Starting…" : "Enable 2FA"}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>

      {/* Enable dialog: QR + URI + verify + backup codes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan the code</DialogTitle>
            <DialogDescription>
              Scan this QR with your authenticator app. Then enter the 6-digit code to verify.
            </DialogDescription>
          </DialogHeader>

          {/* QR + URI */}
          <div className="flex flex-col items-center gap-4">
            {enableData?.totpURI ? (
              <>
                <div className="rounded-md border p-4">
                  <QRCode value={enableData.totpURI} />
                </div>
                <div className="w-full">
                  <label className="mb-1 block text-sm font-medium">TOTP URI</label>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={enableData.totpURI} />
                    <Button type="button" variant="outline" onClick={handleCopyUri}>
                      {copied ? (
                        <>
                          <Check className="mr-1 h-4 w-4" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-4 w-4" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Paste into a password manager that supports adding TOTP by URI.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Generating QR…</p>
            )}
          </div>

          <Separator className="my-2" />

          {/* Verify code */}
          <Form {...verifyForm}>
            <form onSubmit={verifyForm.handleSubmit(handleVerify)} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                <FormField
                  control={verifyForm.control}
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
                  control={verifyForm.control}
                  name="trustDevice"
                  render={({ field }) => (
                    <FormItem className="mt-6 flex items-center gap-2">
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
              </div>

              <Button type="submit" className="w-full" disabled={verifyLoading || verified}>
                {verifyLoading ? "Verifying…" : verified ? "Verified" : "Verify"}
              </Button>
            </form>
          </Form>

          {/* Backup codes */}
          {!!enableData?.backupCodes?.length && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Backup codes</h4>
                  <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Save these in a secure place. Each code can be used once.
                </p>
                <div className="grid grid-cols-2 gap-2 rounded-md border p-3 font-mono text-sm">
                  {enableData.backupCodes.map((code) => (
                    <div key={code} className="bg-muted rounded px-2 py-1 text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <DialogFooter className="mt-2">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable dialog */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable two-factor authentication</DialogTitle>
            <DialogDescription>
              Confirm your password to disable 2FA on this account.
            </DialogDescription>
          </DialogHeader>

          <Form {...disableForm}>
            <form onSubmit={disableForm.handleSubmit(handleDisable)} className="space-y-4">
              <FormField
                control={disableForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-1.5">
                        <Input
                          disabled={disabling}
                          type={seeDisablePassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={toggleSeeDisablePassword}
                        >
                          {seeDisablePassword ? (
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

              <DialogFooter className="gap-2">
                <Button type="button" variant="secondary" onClick={() => setDisableOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={disabling}>
                  {disabling ? "Disabling…" : "Disable 2FA"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
