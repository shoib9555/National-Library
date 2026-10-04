import { useEffect, useState } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import apiClient from "../apis/client"
import { getMyStudentProfile } from "../apis/studentApi"
import { dailyQuotes } from "../data/dailyQuotes"
import nationalLibraryLogo from "../assets/national-library-logo.png"

function getDailyQuote() {
  const now = new Date()

  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  const dayNumber =
    Math.floor(
      (startOfToday.getTime() - startOfYear.getTime()) /
      (1000 * 60 * 60 * 24),
    )

  return dailyQuotes[dayNumber % dailyQuotes.length]
}

function StudentLayout() {
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [studentName, setStudentName] = useState("")

  useEffect(() => {
    const loadStudentProfile = async () => {
      try {
        const response = await getMyStudentProfile()

        setProfilePhotoUrl(response.student.profilePhotoUrl ?? null)
        setStudentName(response.student.name)
      } catch (error) {
        console.error("Failed to load student profile photo:", error)
      }
    }

    loadStudentProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout")
    } catch (error) {
      console.error("Logout attendance update failed:", error)
    } finally {
      sessionStorage.removeItem("token")
      sessionStorage.removeItem("role")
      navigate("/login")
    }
  }

  const navItems = [
    {
      label: "Dashboard",
      path: "/student",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5M9 21v-6h6v6"
          />
        </svg>
      ),
    },

    {
      label: "My Profile",
      path: "/student/profile",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="8"
            r="4"
            strokeWidth="1.8"
          />
          <path
            strokeLinecap="round"
            strokeWidth="1.8"
            d="M4 21c0-4 3.5-7 8-7s8 3 8 7"
          />
        </svg>
      ),
    },

    {
      label: "My Seat",
      path: "/student/seat",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M5 11V6a2 2 0 012-2h10a2 2 0 012 2v5"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M4 11h16v6H4zM7 17v3M17 17v3"
          />
        </svg>
      ),
    },

    {
      label: "Membership",
      path: "/student/membership",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            strokeWidth="1.8"
          />
          <path
            strokeLinecap="round"
            strokeWidth="1.8"
            d="M3 10h18M7 15h4"
          />
        </svg>
      ),
    },

    {
      label: "Attendance",
      path: "/student/attendance",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="17"
            rx="2"
            strokeWidth="1.8"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M8 2v4M16 2v4M4 9h16M8 13l1.5 1.5L12 12M8 17h.01M12 17h.01"
          />
        </svg>
      ),
    },

    {
      label: "To-Do List",
      path: "/student/todos",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M9 6h11M9 12h11M9 18h11"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M4 6h.01M4 12h.01M4 18h.01"
          />
        </svg>
      ),
    },

    {
      label: "My Notes",
      path: "/student/notes",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M6 3h9l3 3v15H6a2 2 0 01-2-2V5a2 2 0 012-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M9 10h6M9 14h6M9 18h4"
          />
        </svg>
      ),
    },

    {
      label: "Payments",
      path: "/student/payments",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M12 2v20M17 6.5c-.8-1-2.1-1.5-3.8-1.5h-1.1C9.3 5 7 6.8 7 9s2.3 4 5.1 4h.8c2.8 0 5.1 1.8 5.1 4s-2.3 4-5.1 4h-1.1c-1.7 0-3-.5-3.8-1.5"
          />
        </svg>
      ),
    },

    {
      label: "Settings",
      path: "/student/settings",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 00-1.88-.34 1.7 1.7 0 00-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 00-1.03-1.56 1.7 1.7 0 00-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 008.46 15a1.7 1.7 0 00-1.56-1.03H6v-2.4h.9A1.7 1.7 0 008.46 10a1.7 1.7 0 00-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 001.88.34A1.7 1.7 0 0012.73 5.2V5h2.4v.2a1.7 1.7 0 001.03 1.56 1.7 1.7 0 001.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0019.4 10a1.7 1.7 0 001.56 1.03h.04v2.4h-.04A1.7 1.7 0 0019.4 15z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="group/sidebar peer fixed inset-y-0 left-0 z-40 hidden w-20 overflow-hidden bg-gradient-to-b from-[#c7ddff] via-[#dbeafe] to-[#b8d4ff] text-slate-700 shadow-sm transition-all duration-300 ease-in-out lg:flex lg:flex-col hover:w-72">

        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-blue-100 bg-white/60 px-4 backdrop-blur-sm transition-all duration-300 group-hover/sidebar:px-6">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
            <img
              src={nationalLibraryLogo}
              alt="National Library"
              className="h-full w-full object-contain p-1"
            />
          </div>

          <div className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100">
            <h1 className="text-lg font-bold tracking-tight text-[#10284a]">
              The National Library
            </h1>

            <p className="text-xs text-slate-500">
              Student Portal
            </p>
          </div>

        </div>

        {/* Student Menu */}
        <div className="px-4 pt-6">

          <p className="mb-5 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="opacity-0 transition-all duration-300 group-hover/sidebar:opacity-100">
              Student Menu
            </span>
          </p>

        </div>

        {/* Navigation */}
        <nav className="student-sidebar-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-4 transition-all duration-300 group-hover/sidebar:px-4">

          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="group/item flex items-center justify-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 group-hover/sidebar:justify-start"
            >

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-500 transition-all duration-200 group-hover/item:bg-blue-100 group-hover/item:text-blue-600">
                {item.icon}
              </span>

              <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100">
                {item.label}
              </span>

            </Link>
          ))}

        </nav>

        {/* Bottom Study Tip */}
        <div className="mt-auto p-2 transition-all duration-300 group-hover/sidebar:p-4">
          <div className="rounded-xl border border-blue-100 bg-white/60 p-3 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover/sidebar:p-4">

            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                    d="M12 18h.01M9.5 9a3 3 0 115 2.2c-.9.6-1.5 1.1-1.5 2.3"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                    d="M12 3a9 9 0 100 18 9 9 0 000-18z"
                  />
                </svg>
              </div>

              {/* Text */}
              <div className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100">
                <p className="text-sm font-semibold text-slate-700">
                  Study Tip
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Stay consistent with your goals.
                </p>
              </div>
            </div>

          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden bg-gradient-to-b from-[#c7ddff] via-[#dbeafe] to-[#b8d4ff] text-slate-700 shadow-xl lg:hidden">
            {/* Mobile Header */}
            <div className="flex h-20 items-center justify-between border-b border-blue-100 bg-white/60 px-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                  <img
                    src={nationalLibraryLogo}
                    alt="National Library"
                    className="h-full w-full object-contain p-1"
                  />
                </div>

                <div>
                  <h1 className="text-base font-bold tracking-tight text-[#10284a]">
                    The National Library
                  </h1>

                  <p className="text-xs text-slate-500">
                    Student Portal
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-700"
                aria-label="Close menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="student-sidebar-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-6">
              <p className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Student Menu
              </p>

              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-500">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Logout */}
            <div className="border-t border-blue-100 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </aside>
        </>
      )}

      {/* =====================================================
          MAIN AREA
      ===================================================== */}
      <div className="min-h-screen transition-[margin-left] duration-300 ease-in-out lg:ml-20 lg:peer-hover:ml-72">

        {/* =================================================
            NAVBAR
        ================================================= */}
        <header className="sticky top-0 z-30 h-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">

          <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 lg:hidden"
              aria-label="Open menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="min-w-0 flex-1 sm:hidden">
              <p className="truncate text-sm font-bold text-[#164b91]">
                The National Library
              </p>
              <p className="truncate text-[10px] font-medium text-slate-500">
                Student Portal
              </p>
            </div>

            {/* ================================
        LEFT SIDE - SEARCH
    ================================= */}
            <div className="hidden min-w-0 flex-1 items-center sm:flex">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  ✦ The National Library Motivational Quotes
                </p>

                <div className="daily-quote-marquee mt-1 max-w-4xl">
                  <p className="daily-quote-marquee-text text-xl font-bold leading-tight text-[#164b91] lg:text-2xl">
                    “{getDailyQuote()}”
                  </p>
                </div>
              </div>
            </div>


            {/* ================================
        RIGHT SIDE
    ================================= */}
            <div className="ml-6 flex shrink-0 items-center gap-4">

              {/* Notification */}
              <button
                type="button"
                onClick={() => navigate("/student/notifications")}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                title="Notifications"
              >

                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M10 21h4"
                  />
                </svg>

              </button>


              {/* Divider */}
              <div className="h-8 w-px bg-slate-200" />


              {/* Student */}
              <div className="flex items-center gap-3">

                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-blue-100 bg-blue-50">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt="Student profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-blue-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="8"
                          r="4"
                          strokeWidth="1.8"
                        />

                        <path
                          strokeLinecap="round"
                          strokeWidth="1.8"
                          d="M4 21c0-4 3.5-7 8-7s8 3 8 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="hidden sm:block">

                  <p className="text-sm font-semibold text-slate-900">
                    Student
                  </p>

                  <p className="text-xs font-medium text-slate-700">
                    {studentName || "Student"}
                  </p>

                </div>

              </div>


              {/* Divider */}
              <div className="h-8 w-px bg-slate-200" />


              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700"
              >
                <span className="hidden sm:inline">
                  Logout
                </span>

                <span className="sm:hidden">
                  ↪
                </span>
              </button>

            </div>

          </div>

        </header>

        {/* Page Content */}
        <div className="flex min-h-[calc(100vh-5rem)] flex-col">

          <main className="flex-1 bg-slate-50">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-[#0f1f3d] via-[#164b91] to-[#1769e8] text-white">

            <div className="flex min-h-[150px] flex-col items-center justify-center px-6 py-7 text-center">

              {/* Logo + Name */}
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md">
                  <img
                    src={nationalLibraryLogo}
                    alt="National Library"
                    className="h-full w-full object-contain p-1"
                  />
                </div>

                <div className="text-left">
                  <h2 className="text-lg font-bold">
                    The National Library
                  </h2>

                  <p className="text-xs text-blue-200">
                    Student Portal
                  </p>
                </div>

              </div>

              {/* Divider */}
              <div className="mt-5 h-px w-full max-w-3xl bg-white/20" />

              {/* Copyright */}
              <p className="mt-5 text-sm text-blue-100">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-white">
                  National Library Private Limited
                </span>
                . All rights reserved.
              </p>

              {/* Subtitle */}
              <p className="mt-1 text-xs text-blue-200">
                Student Portal • National Library Management System
              </p>

            </div>

          </footer>

        </div>

      </div>

    </div>
  )
}

export default StudentLayout