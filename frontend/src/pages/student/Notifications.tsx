import { useEffect, useState } from "react"
import {
  getMyNotifications,
  type Notification,
} from "../../apis/notificationApi"

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getMyNotifications()
        setNotifications(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const getChannelStyle = (channel: string) => {
    switch (channel) {
      case "WEBSITE":
        return "bg-blue-100 text-blue-700"

      case "EMAIL":
        return "bg-purple-100 text-purple-700"

      case "WHATSAPP":
        return "bg-emerald-100 text-emerald-700"

      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "PAYMENT_SUCCESS":
        return {
          background: "bg-emerald-50",
          iconBackground: "bg-emerald-100",
          iconColor: "text-emerald-600",
        }

      case "MEMBERSHIP_RENEWED":
        return {
          background: "bg-blue-50",
          iconBackground: "bg-blue-100",
          iconColor: "text-blue-600",
        }

      case "MEMBERSHIP_EXPIRING":
        return {
          background: "bg-orange-50",
          iconBackground: "bg-orange-100",
          iconColor: "text-orange-600",
        }

      case "OVERDUE":
        return {
          background: "bg-red-50",
          iconBackground: "bg-red-100",
          iconColor: "text-red-600",
        }

      case "FEE_REMINDER":
        return {
          background: "bg-purple-50",
          iconBackground: "bg-purple-100",
          iconColor: "text-purple-600",
        }

      default:
        return {
          background: "bg-slate-50",
          iconBackground: "bg-slate-100",
          iconColor: "text-slate-600",
        }
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-84px)] items-center justify-center bg-[#f7faff]">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Loading notifications...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#f7faff] p-6 md:p-7">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
          <p className="font-medium text-red-600">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#f7faff] p-6 md:p-7">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <section className="relative mb-6 overflow-hidden rounded-[20px] bg-gradient-to-r from-[#eaf5ff] via-[#eef7ff] to-[#dceeff] px-7 py-7">

        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-blue-200/30" />

        <div className="pointer-events-none absolute -bottom-20 right-52 h-44 w-44 rounded-full bg-indigo-200/20" />

        <div className="relative z-10">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-500">
            Student Portal
          </p>

          <h1 className="text-[34px] font-bold tracking-[-0.8px] text-[#10203d]">
            Notifications
          </h1>

          <p className="mt-1.5 text-[17px] text-[#58708f]">
            Stay updated with your membership, payments and library
            activities.
          </p>
        </div>

        {/* Notification Icon */}
        <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 lg:flex">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/75 text-blue-500 shadow-sm">
            <svg
              className="h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
              />
              <path d="M10 21h4" />
            </svg>
          </div>
        </div>
      </section>

      {/* =====================================================
          SUMMARY
      ===================================================== */}
      {notifications.length > 0 && (
        <section className="mb-7">

          <div className="mb-4 flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-blue-500" />

            <h2 className="text-[22px] font-bold text-[#10203d]">
              Notification Center
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* Total */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[15px] text-[#657995]">
                    Total Notifications
                  </p>

                  <p className="mt-2 text-[28px] font-bold text-[#13213b]">
                    {notifications.length}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                    />
                    <path d="M10 21h4" />
                  </svg>
                </div>

              </div>
            </div>

            {/* Payment */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[15px] text-[#657995]">
                    Payment Updates
                  </p>

                  <p className="mt-2 text-[28px] font-bold text-emerald-600">
                    {
                      notifications.filter(
                        (notification) =>
                          notification.type === "PAYMENT_SUCCESS"
                      ).length
                    }
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 8v8" />
                    <path d="M15 10c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 2 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2" />
                  </svg>
                </div>

              </div>
            </div>

            {/* Membership */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[15px] text-[#657995]">
                    Membership Updates
                  </p>

                  <p className="mt-2 text-[28px] font-bold text-purple-600">
                    {
                      notifications.filter(
                        (notification) =>
                          notification.type === "MEMBERSHIP_RENEWED" ||
                          notification.type === "MEMBERSHIP_EXPIRING"
                      ).length
                    }
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="M7 9h10" />
                    <path d="M7 13h6" />
                  </svg>
                </div>

              </div>
            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          NOTIFICATION LIST
      ===================================================== */}
      <section>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-purple-500" />

          <h2 className="text-[22px] font-bold text-[#10203d]">
            Your Notifications
          </h2>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-[20px] border border-slate-200 bg-white p-8 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                  />
                  <path d="M10 21h4" />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#13213b]">
                  No Notifications
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  You don't have any notifications yet.
                </p>
              </div>

            </div>

          </div>
        ) : (
          <div className="space-y-4">

            {notifications.map((notification) => {

              const style = getNotificationStyle(
                notification.type
              )

              return (
                <div
                  key={notification.id}
                  className={`overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.05)] transition hover:-translate-y-0.5 hover:shadow-md`}
                >

                  <div className="p-6">

                    <div className="flex gap-5">

                      {/* Icon */}
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${style.iconBackground} ${style.iconColor}`}
                      >
                        <svg
                          className="h-7 w-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        >
                          {notification.type ===
                          "PAYMENT_SUCCESS" ? (
                            <>
                              <circle
                                cx="12"
                                cy="12"
                                r="8"
                              />
                              <path d="m8.5 12 2.2 2.2 4.8-5" />
                            </>
                          ) : notification.type ===
                            "MEMBERSHIP_EXPIRING" ? (
                            <>
                              <path d="M12 3 3 20h18L12 3Z" />
                              <path d="M12 9v5" />
                              <path d="M12 17h.01" />
                            </>
                          ) : (
                            <>
                              <path
                                d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                              />
                              <path d="M10 21h4" />
                            </>
                          )}
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

                          <div>
                            <h3 className="text-[18px] font-bold text-[#13213b]">
                              {notification.title}
                            </h3>

                            <p className="mt-2 text-[15px] leading-6 text-[#526987]">
                              {notification.message}
                            </p>
                          </div>

                          {/* Channel */}
                          <span
                            className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${getChannelStyle(
                              notification.channel
                            )}`}
                          >
                            {notification.channel}
                          </span>

                        </div>

                        {/* Bottom information */}
                        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">

                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            {notification.type}
                          </span>

                          <span className="text-xs text-slate-400">
                            {formatDate(notification.createdAt)}
                            {" · "}
                            {formatTime(notification.createdAt)}
                          </span>

                          {notification.status && (
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                notification.status === "SENT"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : notification.status ===
                                      "FAILED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {notification.status}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              )
            })}

          </div>
        )}

      </section>

    </div>
  )
}

export default Notifications