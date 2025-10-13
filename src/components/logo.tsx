"use client"

import { Blocks } from "lucide-react"

export const Logo = () => {
  return (
    <div className={`flex flex-row items-center justify-center px-5`}>
      <div className="me-2 flex h-[40px] items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
        <Blocks className="h-10 w-10" />
      </div>
      <h5 className="text-foreground text-2xl leading-5 font-bold dark:text-white">Site Name</h5>
    </div>
  )
}
