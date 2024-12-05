'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from 'next-auth/react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        pages: 0,
        events: 0,
    })

    const { data: session } = useSession()

    if (!session || session.user.role !== 'ADMIN') {
        return <div>Access Denied</div>
    }

    useEffect(() => {
        const fetchStats = async () => {
            // In a real application, you would fetch these stats from your API
            setStats({
                users: 10,
                posts: 25,
                pages: 5,
                events: 3,
            })
        }

        fetchStats()
    }, [])

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.users}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.posts}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.pages}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.events}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                <Link href="/admin/users">
                    <Button>Manage Users</Button>
                </Link>
                <Link href="/admin/posts">
                    <Button>Manage Posts</Button>
                </Link>
                <Link href="/admin/pages">
                    <Button>Manage Pages</Button>
                </Link>
                <Link href="/admin/events">
                    <Button>Manage Events</Button>
                </Link>
            </div>
        </div>
    )
}

