import { useEffect, useState } from "react"
import {
  getMyAttendance,
  markEntry,
  markExit,
  type Attendance as AttendanceRecord,
} from "../../apis/attendanceApi"

function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())

  const fetchAttendance = async () => {
    try {
      const response = await getMyAttendance()
      setAttendance(response.attendance)
    } catch (err) {
      console.error(err)
      setError("Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const activeAttendance = attendance.find(
    (record) => record.exitTime === null
  )

  const handleEntry = async () => {
    try {
      setActionLoading(true)
      setError("")

      await markEntry()
      await fetchAttendance()
    } catch (err) {
      console.error(err)
      setError("Failed to mark entry")
    } finally {
      setActionLoading(false)
    }
  }

  const handleExit = async () => {
    try {
      setActionLoading(true)
      setError("")

      await markExit()
      await fetchAttendance()
    } catch (err) {
      console.error(err)
      setError("Failed to mark exit")
    } finally {
      setActionLoading(false)
    }
  }

  const formatDuration = (
    startTime: string,
    endTime: string
  ) => {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()

    const difference = Math.max(0, end - start)

    const totalSeconds = Math.floor(
      difference / 1000
    )

    const hours = Math.floor(totalSeconds / 3600)

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    )

    const seconds = totalSeconds % 60

    return `${hours}h ${minutes}m ${seconds}s`
  }

  const getCurrentStudyTime = () => {
    if (!activeAttendance) {
      return "0h 0m 0s"
    }

    return formatDuration(
      activeAttendance.entryTime,
      currentTime.toISOString()
    )
  }

  const getTotalStudyTime = (
    records: AttendanceRecord[],
    period: "today" | "month"
  ) => {
    let totalMilliseconds = 0

    const now = currentTime

    records.forEach((record) => {
      const entry = new Date(record.entryTime)

      const isSameDay =
        entry.getFullYear() === now.getFullYear() &&
        entry.getMonth() === now.getMonth() &&
        entry.getDate() === now.getDate()

      const isSameMonth =
        entry.getFullYear() === now.getFullYear() &&
        entry.getMonth() === now.getMonth()

      if (
        (period === "today" && !isSameDay) ||
        (period === "month" && !isSameMonth)
      ) {
        return
      }

      const end = record.exitTime
        ? new Date(record.exitTime)
        : now

      totalMilliseconds += Math.max(
        0,
        end.getTime() - entry.getTime()
      )
    })

    const totalSeconds = Math.floor(
      totalMilliseconds / 1000
    )

    const hours = Math.floor(totalSeconds / 3600)

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    )

    const seconds = totalSeconds % 60

    return `${hours}h ${minutes}m ${seconds}s`
  }

  const todayStudyTime = getTotalStudyTime(
    attendance,
    "today"
  )

  const monthStudyTime = getTotalStudyTime(
    attendance,
    "month"
  )

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
      second: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-84px)] items-center justify-center bg-[#f7faff]">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Loading attendance...
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
            My Attendance
          </h1>

          <p className="mt-1.5 text-[17px] text-[#58708f]">
            Track your library visits and study time.
          </p>
        </div>

        <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 lg:flex">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/75 text-blue-500 shadow-sm">
            <svg
              className="h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect
                x="4"
                y="3"
                width="16"
                height="18"
                rx="2"
              />
              <path d="M8 8h8" />
              <path d="M8 12h5" />
              <path d="m8 16 2 2 5-5" />
            </svg>
          </div>
        </div>
      </section>

      {/* =====================================================
          STUDY SUMMARY
      ===================================================== */}
      <section className="mb-7">

        <div className="mb-4 flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-blue-500" />

          <h2 className="text-[22px] font-bold text-[#10203d]">
            Study Summary
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* Today's Study Time */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[15px] text-[#657995]">
                  Today's Study Time
                </p>

                <p className="mt-2 text-[30px] font-bold text-[#13213b]">
                  {todayStudyTime}
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
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Total study time recorded today
            </p>
          </div>

          {/* This Month */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[15px] text-[#657995]">
                  This Month
                </p>

                <p className="mt-2 text-[30px] font-bold text-[#13213b]">
                  {monthStudyTime}
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
                    y="4"
                    width="18"
                    height="17"
                    rx="2"
                  />
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <path d="M3 9h18" />
                </svg>
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Total study time recorded this month
            </p>
          </div>

        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* =====================================================
          TODAY'S ATTENDANCE
      ===================================================== */}
      <section className="mb-7 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

        {/* Header */}
        <div
          className={`px-7 py-6 ${
            activeAttendance
              ? "bg-gradient-to-r from-[#edfff5] to-[#f7fffb]"
              : "bg-gradient-to-r from-[#eef6ff] to-[#f8fbff]"
          }`}
        >

          <div className="flex items-center gap-4">

            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                activeAttendance
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-blue-100 text-blue-500"
              }`}
            >
              {activeAttendance ? (
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M5 12l4 4L19 6" />
                </svg>
              ) : (
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 7v5l3 2" />
                </svg>
              )}
            </div>

            <div>
              <h2 className="text-[24px] font-bold text-[#10203d]">
                Today's Attendance
              </h2>

              <p className="mt-1 text-[15px] text-[#71839d]">
                {activeAttendance
                  ? "Your current library study session."
                  : "Start your study session when you enter the library."}
              </p>
            </div>

          </div>
        </div>

        {/* Body */}
        <div className="p-7">

          {activeAttendance ? (
            <div>

              {/* Current Status */}
              <div className="flex items-center gap-3">

                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>

                <p className="font-bold text-emerald-600">
                  Currently Studying
                </p>

              </div>

              {/* Session Details */}
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

                {/* Entry */}
                <div className="rounded-2xl bg-blue-50/70 p-5">

                  <p className="text-sm font-medium text-[#71839d]">
                    Entry Time
                  </p>

                  <p className="mt-2 text-xl font-bold text-[#13213b]">
                    {formatTime(activeAttendance.entryTime)}
                  </p>

                </div>

                {/* Current Time */}
                <div className="rounded-2xl bg-purple-50/70 p-5">

                  <p className="text-sm font-medium text-[#71839d]">
                    Current Study Time
                  </p>

                  <p className="mt-2 text-xl font-bold text-purple-600">
                    {getCurrentStudyTime()}
                  </p>

                </div>

                {/* Exit */}
                <div className="flex items-center">

                  <button
                    onClick={handleExit}
                    disabled={actionLoading}
                    className="w-full rounded-xl bg-red-500 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Processing..."
                      : "Mark Exit"}
                  </button>

                </div>

              </div>
            </div>
          ) : (
            <div>

              {/* Not Checked In */}
              <div className="flex items-center gap-3">

                <span className="h-3 w-3 rounded-full bg-slate-400" />

                <p className="font-bold text-slate-600">
                  Not Checked In
                </p>

              </div>

              <p className="mt-3 text-sm text-slate-500">
                You have not marked your entry for today's study session.
              </p>

              <button
                onClick={handleEntry}
                disabled={actionLoading}
                className="mt-6 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? "Processing..."
                  : "Mark Entry"}
              </button>

            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          ATTENDANCE HISTORY
      ===================================================== */}
      <section>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-purple-500" />

          <h2 className="text-[22px] font-bold text-[#10203d]">
            Attendance History
          </h2>
        </div>

        {attendance.length === 0 ? (
          <div className="rounded-[20px] border border-slate-200 bg-white p-8 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="4"
                    y="3"
                    width="16"
                    height="18"
                    rx="2"
                  />
                  <path d="M8 8h8" />
                  <path d="M8 12h5" />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#13213b]">
                  No Attendance Records
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your attendance history will appear here.
                </p>
              </div>

            </div>

          </div>
        ) : (
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px] text-left">

                <thead className="bg-[#f4f8fd]">

                  <tr className="border-b border-slate-200">

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Date
                    </th>

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Entry Time
                    </th>

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Exit Time
                    </th>

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Duration
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {attendance.map((record) => (
                    <tr
                      key={record.attendanceId}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >

                      <td className="px-6 py-5 text-sm font-medium text-[#13213b]">
                        {formatDate(record.entryTime)}
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-[#13213b]">
                        {formatTime(record.entryTime)}
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-[#13213b]">

                        {record.exitTime ? (
                          formatTime(record.exitTime)
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            Currently Inside
                          </span>
                        )}

                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[#13213b]">

                        {record.exitTime ? (
                          formatDuration(
                            record.entryTime,
                            record.exitTime
                          )
                        ) : (
                          <span className="text-blue-600">
                            In Progress
                          </span>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          </div>
        )}

      </section>

    </div>
  )
}

export default Attendance