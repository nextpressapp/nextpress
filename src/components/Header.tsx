'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button } from '@/components/ui/button'

export default function Header() {
    const { data: session, status } = useSession()
    return (
        <header className="py-4 border-b">
            <div className="container flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    NextPress
                </Link>
                <nav className="flex items-center space-x-4">
                    <Link href="/about">About</Link>
                    <Link href="/blog">Blog</Link>
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

