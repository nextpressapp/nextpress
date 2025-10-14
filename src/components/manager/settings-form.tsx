// components/manager/settings-form.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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

interface SiteSettings {
  id?: string
  siteName: string
  description: string
  homeTitle: string
  homeDescription: string
  aboutTitle: string
  aboutDescription: string
}

const formSchema = z.object({
  id: z.string().optional(),
  siteName: z.string().min(1, { message: "Site name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  homeTitle: z.string().min(1, { message: "Home page title is required" }),
  homeDescription: z.string().min(1, { message: "Home page description is required" }),
  aboutTitle: z.string().min(1, { message: "About page title is required" }),
  aboutDescription: z.string().min(1, { message: "About page description is required" }),
})

type FormValues = z.infer<typeof formSchema>

export const SettingsForm = ({ settings }: { settings?: SiteSettings }) => {
  const initial: SiteSettings = settings ?? {
    siteName: "NextPress",
    description: "A Next.js powered CMS",
    homeTitle: "Welcome to NextPress",
    homeDescription: "Your next-generation CMS",
    aboutTitle: "About NextPress",
    aboutDescription: "Learn more about our platform",
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial,
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("/api/manager/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to save settings")
      }
      const saved: SiteSettings = await res.json()

      // update form with latest DB values – no reload
      form.reset(saved)

      toast.success("Settings updated", {
        description: "Settings updated successfully",
      })
    } catch (e: any) {
      toast.error("Error", {
        description: e?.message ?? "Error updating settings",
      })
    }
  }

  const submitting = form.formState.isSubmitting

  return (
    <div className="mx-auto w-full">
      <Card>
        <CardHeader className="w-full items-center justify-center">
          <CardTitle className="text-lg md:text-xl">Site Settings</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Update your site&#39;s global and page-specific settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* hidden id keeps update vs create simple */}
              {form.getValues("id") && <input type="hidden" {...form.register("id")} />}

              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={submitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Description</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={submitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="homeTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Page Title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={submitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="homeDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Page Description</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={submitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aboutTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Page Title</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={submitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aboutDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Page Description</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={submitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Update Settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
