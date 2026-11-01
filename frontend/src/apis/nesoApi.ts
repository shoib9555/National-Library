
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

    if (!response.data || typeof response.data.getReader !== "function") {
        throw new Error("Unable to read Neso streaming response")
    }

    const reader = response.data.getReader()
    const decoder = new TextDecoder()

    let buffer = ""

    try {
        while (true) {
            const { done, value } = await reader.read()

            if (done) break

            buffer += decoder.decode(value, { stream: true })

            const events = buffer.split("\n\n")
            buffer = events.pop() ?? ""

            for (const event of events) {
                const lines = event.split("\n")

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue

                    const payload = line.slice(6).trim()

                    if (payload === "[DONE]") {
                        return
                    }

                    const chunk = JSON.parse(payload) as NesoStreamChunk

                    if (chunk.text) {
                        onChunk(chunk.text)
                    }
                }
            }
        }

        buffer += decoder.decode()

        if (buffer.trim()) {
            throw new Error("Incomplete Neso streaming response")
        }
    } finally {
        reader.releaseLock()
    }
}
