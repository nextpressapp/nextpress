"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent")
    if (consent === null) {
      setShowBanner(true)
    }
  }, [])

  if (!showBanner) {
    return null
  }

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted")
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected")
    setShowBanner(false)
  }

  return (
    <Card className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Cookie Consent</CardTitle>
        <CardDescription>
          We use cookies to enhance your browsing experience and analyze our traffic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          By clicking &quot;Accept&quot;, you agree to the use of cookies on this website. You can
          change your settings at any time by visiting our{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleReject}>
          Reject
        </Button>
        <Button onClick={handleAccept}>Accept</Button>
      </CardFooter>
    </Card>
  )
}
