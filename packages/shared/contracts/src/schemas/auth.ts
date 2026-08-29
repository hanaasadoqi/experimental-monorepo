import { z } from "zod"

/**
 * Schema for login form inputs
 */
export const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type LoginForm = z.infer<typeof loginFormSchema>
