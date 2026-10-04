import { useEffect, useState } from "react"

import { getUnreadLibrarianNotifications } from "../apis/librarianNotificationApi"

import { NavLink, Outlet, useNavigate } from "react-router-dom"

import { getCurrentUser } from "../apis/authApi"

import nationalLibraryLogo from "../assets/national-library-logo.png"

import { dailyQuotes } from "../data/dailyQuotes"



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



function LibrarianLayout() {



  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)



  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)

  const [showProfilePhoto, setShowProfilePhoto] = useState(false)



  const loadUnreadNotificationCount = async () => {

    try {

      const notifications = await getUnreadLibrarianNotifications()

      setUnreadNotificationCount(notifications.length)

    } catch (error) {

      console.error("Failed to load notification count:", error)

    }

  }



  useEffect(() => {

    loadUnreadNotificationCount()



    const interval = window.setInterval(() => {

      loadUnreadNotificationCount()

    }, 5000)



    return () => {

      window.clearInterval(interval)

    }

  }, [])



  useEffect(() => {

    const handleNotificationUpdate = () => {

      loadUnreadNotificationCount()

    }



    window.addEventListener(

      "librarian-notifications-updated",

      handleNotificationUpdate

    )



    return () => {

      window.removeEventListener(

        "librarian-notifications-updated",

        handleNotificationUpdate

      )

    }

  }, [])



  useEffect(() => {

    const loadLibrarianProfile = async () => {

      try {

        const response = await getCurrentUser()

        setProfilePhotoUrl(response.user.profilePhotoUrl ?? null)

      } catch (error) {

        console.error("Failed to load librarian profile:", error)

      }

    }



    loadLibrarianProfile()

  }, [])





  const navigate = useNavigate()



  const handleLogout = () => {

    sessionStorage.removeItem("token")

    sessionStorage.removeItem("role")

    navigate("/login")

  }







  const navItems = [

    {

      label: "Dashboard",

      path: "/librarian",

      icon: (

        <svg

          className="h-5 w-5"

          fill="none"

          stroke="currentColor"

          viewBox="0 0 24 24"

        >

          <rect

            x="3"

            y="3"

            width="7"

            height="7"

            rx="1"

            strokeWidth="1.8"

          />

          <rect

            x="14"

            y="3"

            width="7"

            height="7"

            rx="1"

            strokeWidth="1.8"

          />

          <rect

            x="3"

            y="14"

            width="7"

            height="7"

            rx="1"

            strokeWidth="1.8"

          />

          <rect

            x="14"

            y="14"

            width="7"

            height="7"

            rx="1"

            strokeWidth="1.8"

          />

        </svg>

      ),

    },

    {

      label: "Students",

      path: "/librarian/students",

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

            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"

          />

          <circle

            cx="9"

            cy="7"

            r="4"

            strokeWidth="1.8"

          />

          <path

            strokeLinecap="round"

            strokeLinejoin="round"

            strokeWidth="1.8"

            d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"

          />

        </svg>

      ),

    },

    {

      label: "Seats",

      path: "/librarian/seats",

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

            d="M5 11V5a2 2 0 012-2h10a2 2 0 012 2v6"

          />

          <path

            strokeLinecap="round"

            strokeLinejoin="round"

            strokeWidth="1.8"

            d="M4 11h16v7H4z"

          />

          <path

            strokeLinecap="round"

            strokeLinejoin="round"

            strokeWidth="1.8"

            d="M6 18v3M18 18v3"

          />

        </svg>

      ),

    },

    {

      label: "Memberships",

      path: "/librarian/memberships",

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

      label: "Payments",

      path: "/librarian/payments",

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

            d="M3 10h18M7 15h3"

          />

        </svg>

      ),

    },

    {

      label: "Attendance",

      path: "/librarian/attendance",

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

            strokeWidth="1.8"

            d="M8 2v4M16 2v4M4 9h16M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"

          />

        </svg>

      ),

    },

    {

      label: "Notifications",

      path: "/librarian/notifications",

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

            d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"

          />

          <path

            strokeLinecap="round"

            strokeLinejoin="round"

            strokeWidth="1.8"

            d="M10 21h4"

          />

        </svg>

      ),

    },



    {

      label: "Settings",

      path: "/librarian/settings",

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

            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"

          />

          <path

            strokeLinecap="round"

            strokeLinejoin="round"

            strokeWidth="1.8"

            d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 1.8-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.54v-.1a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.8-1.8.06-.06A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.56-1.03H6.4v-2.54h.14A1.7 1.7 0 0 0 8.1 10.4a1.7 1.7 0 0 0-.34-1.88L7.7 8.46l1.8-1.8.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5.4h2.54v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.8 1.8-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.14v2.54h-.14A1.7 1.7 0 0 0 19.4 15Z"

          />

        </svg>

      ),

    },

  ]



  return (

    <div className="min-h-screen bg-slate-50">



      {/* Sidebar */}

      <aside className="group/sidebar peer fixed inset-y-0 left-0 z-40 hidden w-20 overflow-hidden bg-[#10284a] text-white transition-all duration-300 ease-in-out lg:flex lg:flex-col hover:w-72">



        {/* Logo */}

        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-4 transition-all duration-300 group-hover/sidebar:px-6">



          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">

            <img

              src={nationalLibraryLogo}

              alt="National Library"

              className="h-full w-full object-contain p-1"

            />

          </div>



          <div className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100">

            <h1 className="text-lg font-bold tracking-tight">

              The National Library

            </h1>



            <p className="text-xs text-blue-200">

              Knowledge for a Better Tomorrow

            </p>

          </div>



        </div>



        {/* Navigation */}

        <nav className="flex-1 space-y-2 px-2 py-7 transition-all duration-300 group-hover/sidebar:px-4">



          {navItems.map((item) => (

            <NavLink

              key={item.label}

              to={item.path}

              end={item.path === "/librarian"}

              className={({ isActive }) =>

                `flex items-center justify-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition group-hover/sidebar:justify-start ${isActive

                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"

                  : "text-blue-100 hover:bg-white/10 hover:text-white"

                }`

              }

            >

              {item.icon}



              <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100">

                {item.label}

              </span>

            </NavLink>

          ))}



        </nav>



        {/* Bottom portal card */}

        <div className="p-2 transition-all duration-300 group-hover/sidebar:p-4">



          <div className="rounded-xl border border-blue-300/20 bg-white/5 p-3 transition-all duration-300 group-hover/sidebar:p-4">



            <div className="flex items-center gap-3">



              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />



              <div className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100">

                <p className="text-sm font-semibold">

                  Librarian Portal

                </p>



                <p className="mt-1 text-xs text-blue-200">

                  Online · 24 × 7

                </p>

              </div>



            </div>



          </div>



        </div>



      </aside>

      {mobileMenuOpen && (

        <>

          <div

            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"

            onClick={() => setMobileMenuOpen(false)}

          />



          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden bg-[#10284a] text-white shadow-2xl lg:hidden">

            <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">

                  <img

                    src={nationalLibraryLogo}

                    alt="National Library"

                    className="h-full w-full object-contain p-1"

                  />

                </div>



                <div className="min-w-0">

                  <h1 className="truncate text-base font-bold">

                    The National Library

                  </h1>

                  <p className="text-xs text-blue-200">

                    Librarian Portal

                  </p>

                </div>

              </div>



              <button

                type="button"

                onClick={() => setMobileMenuOpen(false)}

                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-100 transition hover:bg-white/10 hover:text-white"

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

                    strokeWidth="2"

                    d="M6 6l12 12M18 6L6 18"

                  />

                </svg>

              </button>

            </div>



            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">

              {navItems.map((item) => (

                <NavLink

                  key={item.label}

                  to={item.path}

                  end={item.path === "/librarian"}

                  onClick={() => setMobileMenuOpen(false)}

                  className={({ isActive }) =>

                    `flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${isActive

                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"

                      : "text-blue-100 hover:bg-white/10 hover:text-white"

                    }`

                  }

                >

                  {item.icon}

                  <span>{item.label}</span>

                </NavLink>

              ))}

            </nav>



            <div className="shrink-0 border-t border-white/10 p-4">

              <button

                type="button"

                onClick={() => {

                  setMobileMenuOpen(false)

                  handleLogout()

                }}

                className="flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"

              >

                Logout

              </button>

            </div>

          </aside>

        </>

      )}

      {/* Main area */}

      <div className="lg:ml-20 transition-all duration-300 peer-hover:ml-72">



        {/* Top Header */}

        <header className="sticky top-0 z-30 h-20 border-b border-slate-200 bg-white/95 backdrop-blur">

          <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden"
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
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

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

            <div className="ml-auto flex items-center gap-3 sm:gap-5">
              {/* Notification */}
              <button
                type="button"
                onClick={() => navigate("/librarian/notifications")}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
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
                    d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M10 21h4"
                  />
                </svg>

                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              {/* Profile */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (profilePhotoUrl) {
                      setShowProfilePhoto(true)
                    }
                  }}
                  className="h-10 w-10 overflow-hidden rounded-full border-2 border-slate-200 bg-[#10284a]"
                >
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt="Librarian profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      L
                    </div>
                  )}
                </button>

                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    Librarian
                  </p>
                  <p className="text-xs text-slate-500">
                    Admin
                  </p>
                </div>

                <svg
                  className="hidden h-4 w-4 text-slate-500 sm:block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 9l6 6 6-6"
                  />
                </svg>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </header>



          {/* Page Content + Footer */}
      <div className="flex min-h-[calc(100vh-5rem)] flex-col">
        <main className="flex-1 bg-slate-50 p-5 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-[#0f1f3d] via-[#164b91] to-[#1769e8] text-white">
          <div className="flex min-h-[150px] flex-col items-center justify-center px-6 py-7 text-center">
            {/* Logo + Name */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
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
                  Librarian Portal
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
              Librarian Portal • National Library Management System
            </p>
          </div>
        </footer>
      </div>
    </div>

    {showProfilePhoto && profilePhotoUrl && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6"
        onClick={() => setShowProfilePhoto(false)}
      >
        <div
          className="relative max-h-[90vh] max-w-[90vw]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setShowProfilePhoto(false)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80"
          >
            ×
          </button>

          <img
            src={profilePhotoUrl}
            alt="Librarian profile"
            className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      </div>
    )}
  </div>
)
}



export default LibrarianLayout