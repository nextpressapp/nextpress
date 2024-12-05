'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export function ResetPasswordForm() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isValidToken, setIsValidToken] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                toast({
                    title: "Invalid token",
                    description: "The reset password link is invalid or has expired.",
                    variant: "destructive",
                })
                return
            }

            try {
                const response = await fetch(`/api/auth/verify-reset-token?token=${token}`)
                if (response.ok) {
                    setIsValidToken(true)
                } else {
                    toast({
                        title: "Invalid token",
                        description: "The reset password link is invalid or has expired.",
                        variant: "destructive",
                    })
                }
            } catch (error) {
                console.error('Token verification error:', error)
                toast({
                    title: "Error",
                    description: "An error occurred while verifying the token.",
                    variant: "destructive",
                })
            }
        }

        verifyToken()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "Please ensure both passwords are the same.",
                variant: "destructive",
            })
            return
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            if (response.ok) {
                toast({
                    title: "Password reset successful",
                    description: "Your password has been reset. You can now log in with your new password.",
                })
                router.push('/auth/signin')
            } else {
                const data = await response.json()
                toast({
                    title: "Error",
                    description: data.error || "An error occurred while resetting your password.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Password reset error:', error)
            toast({
                title: "Error",
                description: "An error occurred while resetting your password.",
                variant: "destructive",
            })
        }
    }

    if (!isValidToken) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
                <p>The password reset link is invalid or has expired.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" className="w-full">Reset Password</Button>
        </form>
    )
}

