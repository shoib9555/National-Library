import { useEffect, useState } from "react"
import { getSeats, assignSeat, changeSeat } from "../../apis/seatApi"
import type { Seat } from "../../apis/seatApi"
import { getStudents } from "../../apis/studentApi"
import type { Student } from "../../apis/studentApi"


function Seats() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [changeSeatMode, setChangeSeatMode] = useState(false)
  const [newSeatNumber, setNewSeatNumber] = useState("")
  const [changingSeat, setChangingSeat] = useState(false)
  const [selectedStudentCode, setSelectedStudentCode] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadSeats = async () => {
      try {
        setLoading(true)
        setError("")

        const [seatData, studentData] = await Promise.all([
          getSeats(),
          getStudents(),
        ])

        setSeats(seatData.seats)
        setStudents(studentData.students)
      } catch (error) {
        console.error("Failed to fetch seats:", error)
        setError("Failed to load seats")
      } finally {
        setLoading(false)
      }
    }

    loadSeats()
  }, [])

  const totalSeats = seats.length

  const availableSeats = seats.filter(
    (seat) => seat.status === "AVAILABLE"
  ).length

  const occupiedSeats = seats.filter(
    (seat) => seat.status === "OCCUPIED"
  ).length

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading seats...</p>
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
          Seats
        </span>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Seats
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            Manage National Library seat allocation.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Total */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Total Seats
              </p>

              <p className="mt-3 text-4xl font-bold text-slate-950">
                {totalSeats}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Library capacity
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
              <svg
                className="h-7 w-7 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 19V9a2 2 0 012-2h12a2 2 0 012 2v10M4 19h16M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Available */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Available
              </p>

              <p className="mt-3 text-4xl font-bold text-emerald-600">
                {availableSeats}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Ready for assignment
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
              <span className="h-4 w-4 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* Occupied */}
        <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Occupied
              </p>

              <p className="mt-3 text-4xl font-bold text-red-600">
                {occupiedSeats}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Currently assigned
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
              <span className="h-4 w-4 rounded-full bg-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Seat Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Seat Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a seat to manage its assignment.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">
                Available
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-slate-600">
                Occupied
              </span>
            </div>
          </div>
        </div>

        {/* Real Library Floor Layout */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100/70 p-5">
          {/* Front / Entrance */}
          <div className="mb-6 flex items-center justify-center">
            <div className="rounded-xl border border-slate-300 bg-white px-8 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
              Library Entrance
            </div>
          </div>

          {/* Seat Area */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-inner">
            <div className="mb-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Study Area
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
              {seats.map((seat) => {
                const isAvailable = seat.status === "AVAILABLE"

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => {
                      setSelectedSeat(seat)
                      setAssignError("")
                      setChangeSeatMode(false)
                      setNewSeatNumber("")
                      setSelectedStudentCode(
                        seat.student?.studentCode ?? ""
                      )
                    }}
                    className="group relative flex flex-col items-center focus:outline-none"
                  >
                    {/* Desk */}
                    <div
                      className={`relative h-24 w-full max-w-[150px] rounded-xl border-2 p-3 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg ${isAvailable
                          ? "border-emerald-200 bg-emerald-50 hover:border-emerald-400"
                          : "border-red-200 bg-red-50 hover:border-red-400"
                        }`}
                    >
                      {/* Seat Number */}
                      <div
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold shadow-sm ${isAvailable
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {String(seat.seatNumber).padStart(2, "0")}
                      </div>

                      {/* Status Light */}
                      <span
                        className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ${isAvailable
                            ? "bg-emerald-500"
                            : "bg-red-500"
                          }`}
                      />

                      {/* Student */}
                      {seat.student && (
                        <p className="mt-2 truncate text-center text-[10px] font-semibold text-slate-700">
                          {seat.student.name}
                        </p>
                      )}
                    </div>

                    {/* Desk Legs */}
                    <div className="flex w-[75%] justify-between">
                      <span
                        className={`h-3 w-1 rounded-b ${isAvailable
                            ? "bg-emerald-300"
                            : "bg-red-300"
                          }`}
                      />
                      <span
                        className={`h-3 w-1 rounded-b ${isAvailable
                            ? "bg-emerald-300"
                            : "bg-red-300"
                          }`}
                      />
                    </div>

                    {/* Chair */}
                    <div className="mt-1 flex flex-col items-center">
                      <div
                        className={`h-3 w-12 rounded-t-lg ${isAvailable
                            ? "bg-slate-300"
                            : "bg-slate-400"
                          }`}
                      />

                      <div
                        className={`h-3 w-1 ${isAvailable
                            ? "bg-slate-300"
                            : "bg-slate-400"
                          }`}
                      />
                    </div>

                    {/* Status */}
                    <p
                      className={`mt-2 text-xs font-semibold ${isAvailable
                          ? "text-emerald-700"
                          : "text-red-700"
                        }`}
                    >
                      {isAvailable ? "Available" : "Occupied"}
                    </p>

                    {seat.student && (
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {seat.student.studentCode}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Back / Reading Area */}
          <div className="mt-6 flex items-center justify-center">
            <div className="rounded-xl border border-slate-300 bg-white px-8 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 shadow-sm">
              Quiet Study Area
            </div>
          </div>
        </div>
        {selectedSeat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {selectedSeat.status === "AVAILABLE"
                      ? "Assign Seat"
                      : "Seat Details"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedSeat.status === "AVAILABLE"
                      ? `Assign seat ${String(selectedSeat.seatNumber).padStart(2, "0")} to a student.`
                      : `View and manage seat ${String(selectedSeat.seatNumber).padStart(2, "0")}.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSeat(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5 px-6 py-6">
                {/* Seat */}
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Selected Seat
                  </p>

                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    Seat {String(selectedSeat.seatNumber).padStart(2, "0")}
                  </p>
                </div>
                {/* Student / Change Seat */}
                {changeSeatMode ? (
                  <div className="space-y-5">
                    {/* Current Student */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Current Student
                      </p>

                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {selectedSeat?.student?.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedSeat?.student?.studentCode}
                      </p>
                    </div>

                    {/* New Seat */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Select New Seat
                      </label>

                      <select
                        value={newSeatNumber}
                        onChange={(e) => setNewSeatNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">
                          Select an available seat
                        </option>

                        {seats
                          .filter((seat) => seat.status === "AVAILABLE")
                          .map((seat) => (
                            <option
                              key={seat.id}
                              value={seat.seatNumber}
                            >
                              Seat {String(seat.seatNumber).padStart(2, "0")}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Student
                    </label>

                    {selectedSeat.student ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-lg font-bold text-slate-900">
                          {selectedSeat.student.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {selectedSeat.student.studentCode}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {selectedSeat.student.phone}
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedStudentCode}
                        onChange={(e) => setSelectedStudentCode(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">
                          Select a student
                        </option>

                        {students
                          .filter((student) => student.status === "ACTIVE")
                          .map((student) => (
                            <option
                              key={student.id}
                              value={student.studentCode}
                            >
                              {student.name} — {student.studentCode}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                )}

                {assignError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {assignError}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
                <button
                  type="button"
                  onClick={() => setSelectedSeat(null)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                {selectedSeat.status === "OCCUPIED" ? (
                  changeSeatMode ? (
                    <button
                      type="button"
                      disabled={!newSeatNumber || changingSeat}
                      onClick={async () => {
                        if (!selectedSeat?.student || !newSeatNumber) {
                          return
                        }

                        try {
                          setChangingSeat(true)
                          setAssignError("")

                          await changeSeat({
                            studentCode: selectedSeat.student.studentCode,
                            newSeatNumber: Number(newSeatNumber),
                          })

                          const data = await getSeats()

                          setSeats(data.seats)
                          setSelectedSeat(null)
                          setChangeSeatMode(false)
                          setNewSeatNumber("")
                        } catch (error) {
                          console.error("Failed to change seat:", error)
                          setAssignError("Failed to change seat")
                        } finally {
                          setChangingSeat(false)
                        }
                      }}
                      className="rounded-xl bg-[#10284a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173761] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {changingSeat ? "Changing..." : "Confirm Change"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setChangeSeatMode(true)}
                      className="rounded-xl bg-[#10284a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173761]"
                    >
                      Change Seat
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={!selectedStudentCode || assigning}
                    onClick={async () => {
                      if (!selectedSeat || !selectedStudentCode) {
                        return
                      }

                      try {
                        setAssigning(true)
                        setAssignError("")

                        await assignSeat({
                          studentCode: selectedStudentCode,
                          seatNumber: selectedSeat.seatNumber,
                        })

                        const data = await getSeats()

                        setSeats(data.seats)
                        setSelectedSeat(null)
                        setSelectedStudentCode("")
                      } catch (error) {
                        console.error("Failed to assign seat:", error)
                        setAssignError("Failed to assign seat")
                      } finally {
                        setAssigning(false)
                      }
                    }}
                    className="rounded-xl bg-[#10284a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173761] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assigning ? "Assigning..." : "Assign Seat"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {seats.length}
            </span>{" "}
            seats
          </p>

          <p className="text-sm text-slate-500">
            1 floor · 24 × 7
          </p>
        </div>
      </div>
    </div>
  )
}

export default Seats