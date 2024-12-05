'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export function EmailVerificationForm() {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [email, setEmail] = useState('')
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

  const handleResendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Verification email sent",
          description: "Please check your email for the verification link.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "An error occurred while resending the verification email.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      toast({
        title: "Error",
        description: "An error occurred while resending the verification email.",
        variant: "destructive",
      })
    }
  }

  return (
      <>
        {verificationStatus === 'verifying' && <p>Verifying your email...</p>}
        {verificationStatus === 'success' && (
            <>
              <p className="text-center mb-4">
                Your email has been verified! You can now sign in to your account.
              </p>
              <Link href="/auth/signin">
                <Button className="w-full">Sign In</Button>
              </Link>
            </>
        )}
        {verificationStatus === 'error' && (
            <>
              <p className="text-center mb-4">
                There was an error verifying your email. You can try again or request a new verification email.
              </p>
              <div className="space-y-4">
                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleResendVerification} className="w-full">
                  Resend Verification Email
                </Button>
              </div>
              <Link href="/" className="mt-4 block">
                <Button variant="outline" className="w-full">Return to home page</Button>
              </Link>
            </>
        )}
      </>
  )
}

