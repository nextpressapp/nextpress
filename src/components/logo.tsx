"use client"

import { Blocks } from "lucide-react"

import { cn } from "@/lib/utils"

export function Logo({
  siteName,
  showText = true,
  className,
}: {
  siteName: string
  showText?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
        <Blocks className="h-6 w-6" />
      </div>
      {showText && <span className="text-2xl font-bold">{siteName}</span>}
    </div>
  )
}
