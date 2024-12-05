import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckEmail() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Check your email</CardTitle>
                    <CardDescription>We've sent you a verification link.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <p className="text-center mb-4">
                        A verification link has been sent to your email address. Please click the link to verify your account.
                    </p>
                    <p className="text-center mb-4">
                        If you don't see the email, check your spam folder.
                    </p>
                    <Link href="/">
                        <Button variant="outline">Return to home page</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}

