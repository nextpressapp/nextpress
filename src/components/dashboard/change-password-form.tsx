"use client"

import { useReducer, useState } from "react"
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

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
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

type TChangePassword = z.infer<typeof changePasswordSchema>

export const ChangePasswordForm = () => {
  const [seePassword, toggleSeePassword] = useReducer((state) => !state, false)
  const [seeConfirmPassword, toggleSeeConfirmPassword] = useReducer((state) => !state, false)
  const [seeCurrentPassword, toggleSeeCurrentPassword] = useReducer((state) => !state, false)
  const [loading, setLoading] = useState(false)

  const form = useForm<TChangePassword>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      currentPassword: "",
    },
  })

  const onSubmit = async (values: TChangePassword) => {
    await authClient.changePassword(
      {
        newPassword: values.password,
        currentPassword: values.currentPassword,
        revokeOtherSessions: true,
      },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onSuccess: () => {
          toast.success("Password changed successfully.")
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
        },
      }
    )
  }

  return (
    <div className="mx-auto w-full">
      <Card>
        <CardHeader className="w-full items-center justify-center">
          <CardTitle className="text-lg md:text-xl">Change your password</CardTitle>
          <CardDescription className="text-xs md:text-sm">Update your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-1.5">
                        <Input
                          disabled={loading}
                          type={seeCurrentPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={toggleSeeCurrentPassword}
                        >
                          {seeCurrentPassword ? (
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
                {loading ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
