'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export default function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match.",
                variant: "destructive",
            })
            return
        }

        const response = await fetch('/api/user/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
        })

        if (response.ok) {
            toast({
                title: "Password changed",
                description: "Your password has been successfully changed.",
            })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
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
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <Button type="submit">Change Password</Button>
        </form>
    )
}

