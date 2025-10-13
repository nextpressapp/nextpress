"use client"

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

const profileSchema = z.object({
  name: z.string().min(1, { message: "Please enter your name" }),
  email: z.email({ message: "Please enter your email" }),
})
type TProfile = z.infer<typeof profileSchema>

export function ProfileForm({ initialValues }: { initialValues: TProfile }) {
  const form = useForm<TProfile>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues, // stable, set once
  })

  const onSubmit = async (values: TProfile) => {
    await authClient.updateUser({
      name: values.name,
    })
    if (values.email != initialValues.email) {
      await authClient.changeEmail(
        {
          newEmail: values.email,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            toast.success("Please check your inbox to verify the email change")
          },
        }
      )
    }
  }

  return (
    <div className="mx-auto w-full">
      <Card>
        <CardHeader className="w-full items-center justify-center">
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        autoComplete="name"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
