import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailVerificationForm } from '@/components/EmailVerificationForm'

export default function VerifyEmailPage() {
  return (
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>Verifying your email address...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Suspense fallback={<div>Loading...</div>}>
              <EmailVerificationForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
  )
}

