"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function HeaderClient({ siteName }: { siteName: string }) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/auth/sign-in"),
      },
    })
  }

  return (
    <header className="border-b bg-gray-100 py-4 dark:bg-gray-800">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo siteName={siteName} />
        </Link>

        <nav className="flex items-center space-x-4">
          <Link href="/blog">
            <Button variant="outline" className="rounded">
              Blog
            </Button>
          </Link>
          <Link href="/events">
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
