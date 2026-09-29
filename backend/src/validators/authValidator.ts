import {z} from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
    studentCode: z
        .string()
        .trim()
        .regex(/^STU\d{3}$/, "Invalid student code"),

    otp: z
        .string()
        .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export const resendOtpSchema = z.object({
    studentCode: z
        .string()
        .regex(/^STU\d{3}$/, "Invalid student code"),
});

export const setStudentPasswordSchema = z.object({
    setupToken: z.string().min(1, "Setup token is required"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character",
        ),
});