"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="py-4 border-b bg-gray-100 dark:bg-gray-800 ">
      <div className="container flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          NextPress
        </Link>
        <nav className="flex items-center space-x-4">
          menuItems
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
          {status === "authenticated" && session?.user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" className="rounded">
                  Dashboard
                </Button>
              </Link>
              <Link
                href="/auth/signout"
                className="px-3 py-2 text-sm font-medium"
              >
                <Button variant="outline" className="rounded">
                  Sign Out
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" className="rounded">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="rounded">
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
