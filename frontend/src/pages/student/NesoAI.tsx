
import { useState } from "react"
import { sendNesoMessage, type NesoMessage } from "../../apis/nesoApi"

function NesoAI() {
  const [messages, setMessages] = useState<NesoMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSend = async () => {
    const message = input.trim()

    if (!message || loading) return

    const previousMessages = messages

    setMessages((prev) => [
      ...prev,
      { role: "user", text: message },
    ])
    setInput("")
    setError("")
    setLoading(true)

    try {
      const response = await sendNesoMessage({
        message,
        history: previousMessages,
      })

      setMessages((prev) => [
        ...prev,
        { role: "model", text: response.answer },
      ])
    } catch {
      setError("Neso is temporarily unavailable. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-700 p-6 text-white">
          <h1 className="text-2xl font-bold">Neso AI</h1>
          <p className="mt-2 text-sm text-blue-100">
            Your personal learning assistant for SSC, Banking, NDA and other competitive exams.
          </p>
        </div>

        <div className="flex min-h-[65vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="py-12 text-center">
                <h2 className="text-xl font-semibold text-slate-800">
                  Hello! I'm Neso.
                </h2>
                <p className="mt-2 text-slate-500">
                  What would you like to learn today?
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "Explain percentages for SSC CGL",
                    "Give me reasoning practice questions",
                    "Teach me English grammar",
                    "Explain banking awareness",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="rounded-full border border-blue-200 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                    item.role === "user"
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-sm text-slate-500">
                Neso is thinking...
              </div>
            )}
          </div>

          {error && (
            <p className="px-5 text-sm text-red-600">{error}</p>
          )}

          <div className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void handleSend()
                  }
                }}
                placeholder="Ask Neso anything..."
                rows={2}
                maxLength={4000}
                className="min-w-0 flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <button
                onClick={() => void handleSend()}
                disabled={!input.trim() || loading}
                className="self-end rounded-xl bg-blue-700 px-5 py-3 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Press Enter to send · Shift + Enter for a new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NesoAI
