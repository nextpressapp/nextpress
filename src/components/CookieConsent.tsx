"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent === null) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50">
      <CardHeader>
        <CardTitle>Cookie Consent</CardTitle>
        <CardDescription>We use cookies to enhance your browsing experience and analyze our traffic.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          By clicking &quot;Accept&quot;, you agree to the use of cookies on this website. You can change your settings
          at any time by visiting our <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleReject}>
          Reject
        </Button>
        <Button onClick={handleAccept}>Accept</Button>
      </CardFooter>
    </Card>
  );
}
