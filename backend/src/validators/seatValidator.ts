import { z } from "zod";

export const assignSeatSchema = z.object({
    studentCode: z
        .string()
        .trim()
        .regex(/^STU\d{3}$/, "Invalid student code"),

    seatNumber: z.coerce
        .number()
        .int("Seat number must be an integer")
        .min(1, "Seat number must be at least 1")
        .max(70, "Seat number cannot be greater than 70"),
});

export const changeSeatSchema = z.object({
    studentCode: z
        .string()
        .trim()
        .regex(/^STU\d{3}$/, "Invalid student code"),

    newSeatNumber: z.coerce
        .number()
        .int("Seat number must be an integer")
        .min(1, "Seat number must be at least 1")
        .max(70, "Seat number cannot be greater than 70"),
});