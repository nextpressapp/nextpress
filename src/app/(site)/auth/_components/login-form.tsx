"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  token: z.string().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function LoginForm() {
  const [mfaRequired, setMfaRequired] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] =
    useState(false);
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      token: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      token: mfaRequired ? data.token : undefined,
      redirect: false,
    });

    if (result?.error === "MFA_REQUIRED") {
      setMfaRequired(true);
      toast({
        title: "MFA Required",
        description: "Please enter your MFA token to continue.",
      });
    } else if (result?.error === "EMAIL_NOT_VERIFIED") {
      toast({
        title: "Email not verified",
        description: "Please verify your email address before signing in.",
        variant: "destructive",
      });
    } else if (result?.error) {
      toast({
        title: "Sign in failed",
        description: result.error,
        variant: "destructive",
      });
    } else if (result?.ok) {
      router.push("/dashboard");
    }
  };

  const requestVerificationEmail = async () => {
    setIsRequestingVerification(true);
    try {
      const response = await fetch("/api/auth/request-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: form.getValues("email") }),
      });

      if (response.ok) {
        toast({
          title: "Verification email sent",
          description: "Please check your email for the verification link.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to send verification email");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setIsRequestingVerification(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card>
        <CardHeader className="justify-center items-center">
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mfaRequired && (
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MFA Token</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="MFA Token" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password">
              <Button variant="outline" className="text-sm hover:underline">
                Forgot Password?
              </Button>
            </Link>
          </div>
          <div className="mt-2 text-center">
            <Button
              variant="outline"
              onClick={requestVerificationEmail}
              disabled={isRequestingVerification}
              className="text-sm hover:underline"
            >
              {isRequestingVerification
                ? "Sending..."
                : "Resend verification email"}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full text-muted-foreground">
            Don&#39;t have an account?{" "}
          </p>
          <Link href="/auth/register">
            <Button variant="outline">Register here</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
