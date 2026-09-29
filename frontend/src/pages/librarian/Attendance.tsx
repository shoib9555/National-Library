import { useEffect, useState } from "react"
import { getAllAttendance } from "../../apis/attendanceApi"
import type { Attendance as AttendanceRecord } from "../../apis/attendanceApi"

function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getAllAttendance()

        setAttendance(data.attendance)
      } catch (error) {
        console.error("Failed to fetch attendance:", error)
        setError("Failed to load attendance")
      } finally {
        setLoading(false)
      }
    }

    loadAttendance()
  }, [])

  const filteredAttendance = attendance.filter((record) => {
    const search = searchTerm.toLowerCase().trim()

    const matchesSearch =
      !search ||
      record.studentName.toLowerCase().includes(search) ||
      record.studentCode.toLowerCase().includes(search)

    const matchesDate =
      !selectedDate ||
      new Date(record.entryTime).toISOString().slice(0, 10) === selectedDate

    return matchesSearch && matchesDate
  })

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading attendance...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>Dashboard</span>

        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>

        <span className="font-semibold text-slate-900">
          Attendance
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">
          Attendance
        </h1>

        <p className="mt-2 text-lg text-slate-500">
          View student entry and exit records.
        </p>
      </div>

      {/* Attendance Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Attendance Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {attendance.length} attendance record
            {attendance.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
            {/* Search */}
            <div className="w-full md:max-w-md">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Search Student
              </label>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or student code..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Date */}
            <div className="w-full md:w-56">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setSelectedDate("")
              }}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student Code
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Entry
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Exit
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duration
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => (
                  <tr
                    key={record.attendanceId}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {record.studentName}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {record.studentCode}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(record.entryTime).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.exitTime
                        ? new Date(record.exitTime).toLocaleString()
                        : (
                          <span className="font-semibold text-emerald-600">
                            Inside
                          </span>
                        )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.durationMinutes !== null
                        ? `${record.durationMinutes} min`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Attendance