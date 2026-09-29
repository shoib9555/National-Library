import { useEffect, useMemo, useState } from "react"

import {
  getLibrarianNotifications,
  markAllLibrarianNotificationsAsRead,
  markLibrarianNotificationAsRead,
  type LibrarianNotification,
} from "../../apis/librarianNotificationApi"

function LibrarianNotifications() {
  const [notifications, setNotifications] = useState<
    LibrarianNotification[]
  >([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL")

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getLibrarianNotifications()

      setNotifications(data)
    } catch (error) {
      console.error(error)
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  )

  const filteredNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter(
        (notification) => !notification.isRead
      )
    }

    return notifications
  }, [notifications, filter])

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markLibrarianNotificationAsRead(notificationId)

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
              ...notification,
              isRead: true,
              readAt: new Date().toISOString(),
            }
            : notification
        )
      )

      window.dispatchEvent(
        new Event("librarian-notifications-updated")
      )
    } catch (error) {
      console.error(error)
      setError("Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllLibrarianNotificationsAsRead()

      const readTime = new Date().toISOString()

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? readTime,
        }))
      )
      window.dispatchEvent(
        new Event("librarian-notifications-updated")
      )
    } catch (error) {
      console.error(error)
      setError("Failed to mark all notifications as read")
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View important updates and notifications for the National Library.
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Mark All as Read
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Notifications
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Unread
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {unreadCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === "ALL"
            ? "bg-slate-900 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setFilter("UNREAD")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === "UNREAD"
            ? "bg-slate-900 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
          Unread
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Notifications */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
              🔔
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              No notifications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {filter === "UNREAD"
                ? "You have no unread notifications."
                : "There are no notifications available right now."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 transition ${notification.isRead
                  ? "bg-white"
                  : "bg-blue-50/40"
                  }`}
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg">
                    🔔
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {notification.title}
                          </h3>

                          {!notification.isRead && (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
                              NEW
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                          {notification.type}
                        </p>
                      </div>

                      <p className="text-xs text-slate-400">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>

                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkAsRead(notification.id)
                        }
                        className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LibrarianNotifications