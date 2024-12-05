'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react'

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

export default function Header() {
  const { data: session, status } = useSession()
  const [menu, setMenu] = useState<Menu | null>(null)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menus/header')
        if (response.ok) {
          const data = await response.json()
          setMenu(data)
        }
      } catch (error) {
        console.error('Error fetching header menu:', error)
      }
    }

    fetchMenu()
  }, [])

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
          {item.label}
        </Link>
    )
  }

  return (
      <header className="py-4 border-b">
        <div className="container flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            NextPress
          </Link>
          <nav className="flex items-center space-x-4">
            {menu && menu.items.map(renderMenuItem)}
            {/*
            <Link href="/events" className="px-3 py-2 text-sm font-medium">Events</Link>
            */}
            <ThemeSwitcher />
            {status === 'authenticated' && session?.user ? (
                <>
                  {session.user.role === 'ADMIN' && (
                      <Link href="/admin">
                        <Button variant="outline">Admin Dashboard</Button>
                      </Link>
                  )}
                  {(session.user.role === 'ADMIN' || session.user.role === 'EDITOR') && (
                      <Link href="/editor">
                        <Button variant="outline">Editor Dashboard</Button>
                      </Link>
                  )}
                  <Link href="/dashboard">Dashboard</Link>
                  <Button variant="outline" onClick={() => signOut()}>Sign out</Button>
                </>
            ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline">Sign in</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Register</Button>
                  </Link>
                </>
            )}
          </nav>
        </div>
      </header>
  )
}

