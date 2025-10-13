"use client"

import { useReducer, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import zxcvbn from "zxcvbn"

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

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, { message: "Please enter your password. It should be at least 8 characters long" })
      .refine(
        (data) => {
          const { score } = zxcvbn(data)
          if (score < 2) {
            return false
          }
          return data
        },
        { message: "Password is not strong enough" }
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type TReset = z.infer<typeof resetPasswordSchema>

export const ResetPasswordForm = () => {
  const router = useRouter()
  const [seePassword, toggleSeePassword] = useReducer((state) => !state, false)
  const [seeConfirmPassword, toggleSeeConfirmPassword] = useReducer((state) => !state, false)
  const [loading, setLoading] = useState(false)

  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const form = useForm<TReset>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  })
  const onSubmit = async (values: TReset) => {
    await authClient.resetPassword(
      {
        newPassword: values.password,
        token: values.token,
      },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onSuccess: () => {
          toast.success("Password reset successfully.")
          router.push("/auth/sign-in")
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
          router.push("/auth/forgot-password")
        },
      }
    )
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Password Reset</CardTitle>
          <CardDescription className="text-xs md:text-sm">Reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <input type="hidden" {...form.register("token")} />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-1.5">
                        <Input
                          disabled={loading}
                          type={seePassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={toggleSeePassword}
                        >
                          {seePassword ? (
                            <EyeOffIcon className="h-4 w-4 text-zinc-700" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-zinc-700" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-1.5">
                        <Input
                          disabled={loading}
                          type={seeConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={toggleSeeConfirmPassword}
                        >
                          {seeConfirmPassword ? (
                            <EyeOffIcon className="h-4 w-4 text-zinc-700" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-zinc-700" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
