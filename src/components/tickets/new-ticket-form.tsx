"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { TicketInput, ticketSchema } from "@/lib/validators/ticket"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export const NewTicketForm = () => {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  // Check current user's permission (client-safe, UI only)
  const canCreateTicket = authClient.admin.hasPermission({
    permissions: { ticket: ["create"] },
  })
  // ^ if you don’t have the hook, use the promise form once on mount.

  const form = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { title: "", description: "", priority: "MEDIUM" },
    mode: "onTouched",
  })

  const onSubmit = async (values: TicketInput) => {
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error((await res.text()) || "Failed to create ticket")

      const ticket = await res.json()
      toast.success("Created Ticket", { description: ticket.title })
      form.reset()
      router.push("/dashboard/tickets")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create ticket")
    }
  }

  if (isPending) return null // or a skeleton
  if (!session || !canCreateTicket) return null

  return (
    <div className="mx-auto w-full">
      <Card>
        <CardHeader className="w-full items-center justify-center">
          <CardTitle>New ticket</CardTitle>
          <CardDescription>Create a new support ticket</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="title">Title</FormLabel>
                    <FormControl>
                      <Input
                        id="title"
                        placeholder="Short summary of the issue"
                        autoComplete="off"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        placeholder="Describe the problem in detail"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger aria-label="Priority">
                          <SelectValue placeholder="Choose a priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating…" : "Create Ticket"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
