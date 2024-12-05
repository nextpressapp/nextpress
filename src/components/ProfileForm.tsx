'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {toast} from "@/hooks/use-toast";

export default function ProfileForm({ user }: { user: any }) {
    const [name, setName] = useState(user.name || '')
    const [email, setEmail] = useState(user.email || '')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const response = await fetch('/api/user/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email }),
        })

        if (response.ok) {
            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            })
            router.refresh()
        } else {
            const data = await response.json()
            toast({
                title: "Error",
                description: data.error,
                variant: "destructive",
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <Button type="submit">Update Profile</Button>
        </form>
    )
}

