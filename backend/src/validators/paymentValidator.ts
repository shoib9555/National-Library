import { z } from "zod"

export const studentCodeSchema = z.object({
  studentCode: z
    .string()
    .trim()
    .regex(/^STU\d{3}$/, "Invalid student code"),
})