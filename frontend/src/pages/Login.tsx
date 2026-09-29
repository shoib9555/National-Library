import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../apis/authApi"

type Portal = "STUDENT" | "LIBRARIAN"

function Login() {
  const navigate = useNavigate()

  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      const data = await login({
        email,
        password,
      })

      sessionStorage.setItem("token", data.token)
      sessionStorage.setItem("role", data.user.role)

      if (data.user.role === "LIBRARIAN") {
        navigate("/librarian")
      } else {
        navigate("/student")
      }
    } catch (error) {
      console.error(error)
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2200&q=85')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-slate-950/75" />

      {/* Soft blue glow */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-start justify-center px-5 py-8">
        <div className="w-full max-w-6xl">

          {/* Branding */}
          <div className="mb-6 text-center text-white">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl">
              <span className="text-2xl font-black text-[#10284a]">
                NL
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              The National Library
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
              Your dedicated digital platform for a focused, organized and
              productive study experience.
            </p>

            <div className="mx-auto mt-5 h-px w-24 bg-blue-400" />
          </div>

          {/* Portal Selection */}
          {!selectedPortal ? (
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 text-center">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-300">
                  Choose your portal
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Welcome to the Library
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  Select the portal you want to access
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">

                {/* Student Portal */}
                <button
                  type="button"
                  onClick={() => setSelectedPortal("STUDENT")}
                  className="group rounded-3xl border border-white/20 bg-white/10 p-7 text-left shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-300/60 hover:bg-white/15"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300 ring-1 ring-blue-300/20">
                      <svg
                        className="h-7 w-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M5 12v5c0 1.5 3.1 3 7 3s7-1.5 7-3v-5"
                        />
                      </svg>
                    </div>

                    <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                      STUDENT
                    </span>
                  </div>

                  <h3 className="mt-7 text-2xl font-bold text-white">
                    Student Portal
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Access your personal library account, seat information,
                    attendance, membership, payments and notifications.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {["Seat", "Attendance", "Membership", "Payments"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-blue-300">
                    Enter Student Portal

                    <svg
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14M13 6l6 6-6 6"
                      />
                    </svg>
                  </div>
                </button>

                {/* Librarian Portal */}
                <button
                  type="button"
                  onClick={() => setSelectedPortal("LIBRARIAN")}
                  className="group rounded-3xl border border-white/20 bg-white/10 p-7 text-left shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-300/60 hover:bg-white/15"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-300/20">
                      <svg
                        className="h-7 w-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M9 12l2 2 4-4"
                        />
                      </svg>
                    </div>

                    <span className="rounded-full bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                      LIBRARIAN
                    </span>
                  </div>

                  <h3 className="mt-7 text-2xl font-bold text-white">
                    Librarian Portal
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Manage students, seats, memberships, payments,
                    attendance, notifications and library operations.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {["Students", "Seats", "Memberships", "Payments"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-indigo-300">
                    Enter Librarian Portal

                    <svg
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14M13 6l6 6-6 6"
                      />
                    </svg>
                  </div>
                </button>

              </div>

              <p className="mt-8 text-center text-xs text-slate-400">
                Secure access • National Library Management System
              </p>
            </div>
          ) : (
            /* Login Form */
            <div className="mx-auto max-w-md">
              <div className="rounded-3xl border border-white/20 bg-white/95 p-7 shadow-2xl backdrop-blur-xl sm:p-8">

                {/* Back */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPortal(null)
                    setError("")
                  }}
                  className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 12H5m7 6l-6-6 6-6"
                    />
                  </svg>

                  Change Portal
                </button>

                {/* Portal Header */}
                <div className="mb-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      {selectedPortal === "STUDENT" ? (
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                            d="M12 14l9-5-9-5-9 5 9 5z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                            d="M5 12v5c0 1.5 3.1 3 7 3s7-1.5 7-3v-5"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                            d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                            d="M9 12l2 2 4-4"
                          />
                        </svg>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                        {selectedPortal === "STUDENT"
                          ? "Student Portal"
                          : "Librarian Portal"}
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        Welcome back
                      </h2>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Sign in to continue to your National Library account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      required
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-xl bg-[#10284a] px-4 text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition hover:bg-[#163862] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                  <p className="text-xs text-slate-400">
                    Authorized access only • National Library
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} National Library Private Limited.
            All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login