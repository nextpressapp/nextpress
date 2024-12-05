"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        if (response.ok) {
          setVerificationStatus("success");
        } else {
          setVerificationStatus("error");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {verificationStatus === "verifying" && "Verifying your email..."}
            {verificationStatus === "success" &&
              "Your email has been verified!"}
            {verificationStatus === "error" &&
              "There was an error verifying your email."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {verificationStatus === "success" && (
            <>
              <p className="text-center mb-4">
                You can now sign in to your account.
              </p>
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
            </>
          )}
          {verificationStatus === "error" && (
            <>
              <p className="text-center mb-4">
                Please try again or contact support if the problem persists.
              </p>
              <Link href="/">
                <Button variant="outline">Return to home page</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
