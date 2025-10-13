import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <CardTitle>404 - Page Not Found</CardTitle>
          </div>
          <CardDescription>
            Oops! The page you&#39;re looking for doesn&#39;t exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            It seems you&#39;ve ventured into uncharted territory. Don&#39;t worry, it happens to
            the best of us!
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
