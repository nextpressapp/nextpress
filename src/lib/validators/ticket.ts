import { z } from "zod"

export const ticketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  // matches your Postgres enum values
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
})

export const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
})

export type TicketInput = z.infer<typeof ticketSchema>
export type TCommentInput = z.infer<typeof commentSchema>
