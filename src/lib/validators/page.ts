import z from "zod"

export const pageSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and dashes only")
    .max(120),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().optional().default(""),
  published: z.boolean().default(false),
})

export type PageInput = z.infer<typeof pageSchema>
