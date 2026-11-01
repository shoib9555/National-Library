
import apiClient from "./client"

export interface NesoMessage {
    role: "user" | "model"
    text: string
}

export interface NesoChatRequest {
    message: string
    history: NesoMessage[]
}

interface NesoStreamChunk {
    text?: string
    message?: string
}

export async function sendNesoMessage(
    data: NesoChatRequest,
    onChunk: (text: string) => void
): Promise<void> {

    const response = await apiClient.post(
        "/neso/chat",
        data,
        {
            responseType: "stream",
            adapter: "fetch",
        }
    )

    if (
        !response.data ||
        typeof response.data.getReader !== "function"
    ) {
        throw new Error("Unable to read Neso streaming response")
    }

    const reader = response.data.getReader()
    const decoder = new TextDecoder()

    let buffer = ""
    let completed = false

    const processEvent = (event: string) => {
        const lines = event.split(/\r?\n/)

        let eventType = "message"
        const dataLines: string[] = []

        for (const line of lines) {
            if (line.startsWith("event:")) {
                eventType = line.slice(6).trim()
            }

            if (line.startsWith("data:")) {
                dataLines.push(line.slice(5).trimStart())
            }
        }

        if (dataLines.length === 0) return

        const payload = dataLines.join("\n")

        if (payload === "[DONE]") {
            completed = true
            return
        }

        let parsed: NesoStreamChunk

        try {
            parsed = JSON.parse(payload) as NesoStreamChunk
        } catch {
            throw new Error("Invalid response received from Neso")
        }

        if (eventType === "error") {
            throw new Error(
                parsed.message || "Neso AI encountered an error"
            )
        }

        if (parsed.text) {
            onChunk(parsed.text)
        }
    }

    try {
        while (true) {
            const { done, value } = await reader.read()

            if (done) break

            buffer += decoder.decode(value, { stream: true })

            const events = buffer.split(/\r?\n\r?\n/)
            buffer = events.pop() ?? ""

            for (const event of events) {
                processEvent(event)

                if (completed) return
            }
        }

        buffer += decoder.decode()

        if (buffer.trim()) {
            processEvent(buffer)
        }

        if (!completed) {
            throw new Error("Neso stream ended unexpectedly")
        }

    } finally {
        reader.releaseLock()
    }
}
