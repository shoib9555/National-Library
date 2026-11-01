
import { useState } from "react"
import { sendNesoMessage, type NesoMessage } from "../../apis/nesoApi"

function NesoFloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
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
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-4 flex h-[520px] w-[calc(100vw-40px)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-700 px-4 py-3 text-white">
            <div>
              <h3 className="font-semibold">Neso AI</h3>
              <p className="text-xs text-blue-100">
                Your learning assistant
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-2 py-1 text-xl hover:bg-white/10"
              aria-label="Close Neso chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <div className="py-10 text-center">
                <h4 className="font-semibold text-slate-800">
                  Hello! I'm Neso.
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  What would you like to learn today?
                </p>
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
                  className={`max-w-[88%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-6 ${
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
              <p className="text-xs text-slate-500">
                Neso is thinking...
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="px-3 pb-2 text-xs text-red-600">
              {error}
            </p>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void handleSend()
                  }
                }}
                placeholder="Ask Neso..."
                rows={2}
                maxLength={4000}
                className="min-w-0 flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />

              <button
                onClick={() => void handleSend()}
                disabled={!input.trim() || loading}
                className="rounded-xl bg-blue-700 px-3 py-2 text-sm text-white hover:bg-blue-800 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-800 to-indigo-700 text-white shadow-xl transition hover:scale-105"
          aria-label={isOpen ? "Close Neso AI" : "Open Neso AI"}
        >
          {isOpen ? (
            <span className="text-2xl">×</span>
          ) : (
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M8 10h8M8 14h5m-9 6 1.5-4.5A8 8 0 1 1 20 17.5L21 20l-5-1"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default NesoFloatingChat
