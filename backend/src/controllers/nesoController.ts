
import { Response } from "express"
import { AuthenticatedRequest } from "../middleware/authMiddleware"
import {
    streamNeso,
    NesoMessage,
} from "../services/nesoService"

export async function askNesoController(
    req: AuthenticatedRequest,
    res: Response
) {
    // Verify authentication.
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required",
        })
    }

    try {
        // Validate incoming message.
        const { message, history } = req.body

        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                message: "A valid message is required",
            })
        }

        if (message.length > 4000) {
            return res.status(400).json({
                message: "Message cannot exceed 4000 characters",
            })
        }

        // Validate conversation history.
        if (history !== undefined && !Array.isArray(history)) {
            return res.status(400).json({
                message: "Invalid conversation history",
            })
        }

        const validatedHistory: NesoMessage[] = []

        if (Array.isArray(history)) {
            if (history.length > 10) {
                return res.status(400).json({
                    message: "Maximum 10 history messages are allowed",
                })
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
                    })
                }

                validatedHistory.push({
                    role: item.role,
                    text: item.text,
                })
            }
        }

        // Configure Server-Sent Events.
        res.status(200)
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache, no-transform")
        res.setHeader("Connection", "keep-alive")
        res.setHeader("X-Accel-Buffering", "no")

        res.flushHeaders()

        // Stream Neso's response.
        for await (const chunk of streamNeso(
            message,
            validatedHistory
        )) {
            if (res.destroyed) return

            res.write(
                `data: ${JSON.stringify({ text: chunk })}\n\n`
            )
        }

        // Signal that the response is complete.
        if (!res.destroyed) {
            res.write("data: [DONE]\n\n")
            res.end()
        }

    } catch (error) {
        console.error("Neso AI streaming error:", error)

        if (!res.headersSent) {
            return res.status(502).json({
                message: "Neso AI is temporarily unavailable. Please try again.",
            })
        }

        // Send an error event if streaming has already started.
        if (!res.destroyed) {
            res.write(
                `event: error\ndata: ${JSON.stringify({
                    message: "Neso AI is temporarily unavailable. Please try again.",
                })}\n\n`
            )
            res.end()
        }
    }
}
