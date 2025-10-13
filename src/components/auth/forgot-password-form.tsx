"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const forgotPasswordSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
})

type TForgotPassword = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordForm = () => {
  const [isPending, setIsPending] = useState(false)

  const form = useForm<TForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values: TForgotPassword) => {
    await authClient.requestPasswordReset(
      {
        email: values.email,
        redirectTo: "/auth/reset-password",
      },
      {
        onRequest: () => {
          setIsPending(true)
        },
        onResponse: () => {
          setIsPending(false)
          toast.success("If that email is registered, you'll receive a reset link shortly.")
        },
        onError: (ctx) => {
          console.error("Reset error:", ctx.error)
          toast.error("Something went wrong sending the reset email. Please try again.")
        },
      }
    )
  }
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Card>
        <CardHeader className="items-center justify-center">
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to request a new password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Requesting..." : "Request"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
