"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/logo"
import { ThemeSwitcher } from "@/components/theme-switcher"

interface MenuItem {
  id: string
  label: string
  url: string
  children: MenuItem[]
}

interface Menu {
  id: string
  name: string
  items: MenuItem[]
}

export const Header = () => {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [menu, setMenu] = useState<Menu | null>(null)
  const { data: session, isPending } = authClient.useSession()

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in")
        },
      },
    })
  }

  const renderMenuItem = (item: MenuItem) => {
    if (item.children.length > 0) {
      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger className="flex items-center px-3 py-2 text-sm font-medium">
            {item.label}
            <ChevronDown className="ml-1 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {item.children.map((child) => (
              <DropdownMenuItem key={child.id}>
                <Link href={child.url} className="w-full">
                  {child.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <Link key={item.id} href={item.url} className="px-3 py-2 text-sm font-medium">
        <Button variant="outline" className="rounded">
          {item.label}
        </Button>
      </Link>
    )
  }

  return (
    <header className="border-b bg-gray-100 py-4 dark:bg-gray-800">
      <div className="container flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          <Logo />
        </Link>
        <nav className="flex items-center space-x-4">
          {menu && menu.items.map(renderMenuItem)}
          <Link href="/blog" className="px-3 py-2 text-sm font-medium">
            <Button variant="outline" className="rounded">
              Blog
            </Button>
          </Link>
          <Link href="/events" className="px-3 py-2 text-sm font-medium">
            <Button variant="outline" className="rounded">
              Events
            </Button>
          </Link>
          <ThemeSwitcher />

          {!isPending && session ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" className="rounded">
                  Dashboard
                </Button>
              </Link>

              <Button variant="outline" className="rounded" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <Button variant="outline" className="rounded">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline" className="rounded">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
