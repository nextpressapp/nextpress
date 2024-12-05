'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EmailVerificationForm() {
    const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setVerificationStatus('error')
                return
            }

            try {
                const response = await fetch(`/api/auth/verify?token=${token}`)
                if (response.ok) {
                    setVerificationStatus('success')
                } else {
                    setVerificationStatus('error')
                }
            } catch (error) {
                console.error('Verification error:', error)
                setVerificationStatus('error')
            }
        }

        verifyEmail()
    }, [token])

    return (
        <>
            {verificationStatus === 'verifying' && <p>Verifying your email...</p>}
            {verificationStatus === 'success' && (
                <>
                    <p className="text-center mb-4">
                        Your email has been verified! You can now sign in to your account.
                    </p>
                    <Link href="/auth/signin">
                        <Button>Sign In</Button>
                    </Link>
                </>
            )}
            {verificationStatus === 'error' && (
                <>
                    <p className="text-center mb-4">
                        There was an error verifying your email. Please try again or contact support if the problem persists.
                    </p>
                    <Link href="/">
                        <Button variant="outline">Return to home page</Button>
                    </Link>
                </>
            )}
        </>
    )
}

