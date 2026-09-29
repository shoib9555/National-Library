import { z } from "zod";

const optionalIndianPhone = z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number").optional()
);

export const createStudentSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters"),

    phone: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),

    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    aadhaarNumber: z.preprocess(
        (value) => value === "" ? undefined : value,
        z.string()
            .trim()
            .min(4, "Invalid Aadhaar/ID proof")
            .optional()
    ),

    address: z
        .string()
        .trim()
        .min(5, "Address must be at least 5 characters"),

    emergencyContactName: z.preprocess(
        (value) => value === "" ? undefined : value,
        z.string()
            .trim()
            .min(2, "Emergency contact name is required")
            .optional()
    ),

    emergencyContactPhone: optionalIndianPhone,

    joiningDate: z
        .string()
        .datetime({
            offset: true
        })
});

export const updateStudentSchema =
    createStudentSchema.partial();