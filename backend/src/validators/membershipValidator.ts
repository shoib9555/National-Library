import { z } from "zod";

export const createMembershipSchema = z.object({
    studentCode: z
        .string()
        .trim()
        .regex(/^STU\d{3}$/, "Invalid student code"),

    startDate: z
        .string()
        .datetime({ offset: true }),

    accessHours: z
        .union([
            z.literal(24),
            z.literal(12),
            z.literal(6),
            z.literal(4),
        ]),
});

export const renewMembershipSchema = z.object({
    studentCode: z
        .string()
        .trim()
        .regex(/^STU\d{3}$/, "Invalid student code"),

    paymentDate: z
        .string()
        .datetime({ offset: true }),
});