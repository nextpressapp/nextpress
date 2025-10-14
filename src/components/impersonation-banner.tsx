"use client"

import { useRouter } from "next/navigation"
import { AlertTriangle, X } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function ImpersonationBanner({ className }: { className?: string }) {
  const router = useRouter()
  const { data, isPending } = authClient.useSession()

  // Wait for the hook before deciding to render
  if (isPending) return null

  // data shape is { user, session }
  const isImpersonating = Boolean(data?.session?.impersonatedBy)

  if (!isImpersonating) return null

  // We usually only know the *current impersonated* identity on the client
  const impersonatedEmail = data?.user?.email ?? "user"
  const impersonatedName = data?.user?.name ?? null

  const stop = async () => {
    try {
      await authClient.admin.stopImpersonating()
      window.location.href = "/admin"
    } catch (e) {
      console.error(e)
      router.refresh()
    }
  }

  return (
    <div
      className={cn("z-50 w-full border-b border-amber-300 bg-amber-100 text-amber-900", className)}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-2 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>
            You are <strong>impersonating</strong>
            {impersonatedName ? (
              <>
                {" "}
                <strong>{impersonatedName}</strong> ({impersonatedEmail})
              </>
            ) : (
              <>
                {" "}
                <strong>{impersonatedEmail}</strong>
              </>
            )}
            .
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="destructive" onClick={stop}>
            Stop Impersonation
          </Button>
          <Button size="icon" variant="ghost" onClick={stop} aria-label="Stop impersonation">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
