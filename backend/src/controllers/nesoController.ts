
import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
    askNeso,
    NesoMessage,
} from "../services/nesoService";

export async function askNesoController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        // Verify authentication.
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        // Validate the incoming message.
        const { message, history } = req.body;

        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                message: "A valid message is required",
            });
        }

        if (message.length > 4000) {
            return res.status(400).json({
                message: "Message cannot exceed 4000 characters",
            });
        }

        // Validate conversation history.
        if (history !== undefined && !Array.isArray(history)) {
            return res.status(400).json({
                message: "Invalid conversation history",
            });
        }

        const validatedHistory: NesoMessage[] = [];

        if (Array.isArray(history)) {
            if (history.length > 10) {
                return res.status(400).json({
                    message: "Maximum 10 history messages are allowed",
                });
            }

            for (const item of history) {
                if (
                    !item ||
                    !["user", "model"].includes(item.role) ||
                    typeof item.text !== "string" ||
                    !item.text.trim() ||
                    item.text.length > 4000
                ) {
                    return res.status(400).json({
                        message: "Invalid conversation history format",
                    });
                }

                validatedHistory.push({
                    role: item.role,
                    text: item.text,
                });
            }
        }

        // Ask Neso AI.
        const answer = await askNeso(
            message,
            validatedHistory
        );

        return res.status(200).json({
            message: "Neso AI response generated successfully",
            answer,
        });

    } catch (error) {
        console.error("Neso AI controller error:", error);

        if (error instanceof Error) {
            // Avoid exposing internal Gemini/API errors to students.
            return res.status(502).json({
                message: "Neso AI is temporarily unavailable. Please try again.",
            });
        }

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
}
