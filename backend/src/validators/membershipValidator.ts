import { z } from "zod";

export const createMembershipSchema = z.object({
    studentCode: z
        .string()
        .trim()
        .regex(/^STU\d{3}$/, "Invalid student code"),

    startDate: z
        .string()
        .datetime({ offset: true }),
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