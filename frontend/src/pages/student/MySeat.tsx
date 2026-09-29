import { useEffect, useState } from "react"
import {
  getMyStudentProfile,
  type MyStudentProfileResponse,
} from "../../apis/studentApi"

function MySeat() {
  const [student, setStudent] =
    useState<MyStudentProfileResponse["student"] | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSeat = async () => {
      try {
        const response = await getMyStudentProfile()
        setStudent(response.student)
      } catch (err) {
        console.error(err)
        setError("Failed to load seat information")
      } finally {
        setLoading(false)
      }
    }

    fetchSeat()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-84px)] items-center justify-center bg-[#f7faff]">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Loading seat information...
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

  if (!student) {
    return (
      <div className="min-h-full bg-[#f7faff] p-6 md:p-7">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
          <p className="font-medium text-slate-500">
            Student profile not found.
          </p>
        </div>
      </div>
    )
  }

  const hasSeat = Boolean(student.seatNumber)

  return (
    <div className="min-h-full bg-[#f7faff] p-6 md:p-7">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <section className="relative mb-6 overflow-hidden rounded-[20px] bg-gradient-to-r from-[#eaf5ff] via-[#eef7ff] to-[#dceeff] px-7 py-7">

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-blue-200/30" />

        <div className="pointer-events-none absolute -bottom-20 right-48 h-44 w-44 rounded-full bg-indigo-200/20" />

        <div className="relative z-10">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-500">
            Student Portal
          </p>

          <h1 className="text-[34px] font-bold tracking-[-0.8px] text-[#10203d]">
            My Seat
          </h1>

          <p className="mt-1.5 text-[17px] text-[#58708f]">
            View your assigned library seat and seat status.
          </p>
        </div>

        {/* Seat icon */}
        <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 lg:flex">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/75 text-blue-500 shadow-sm">
            <svg
              className="h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M6 5v8" />
              <path d="M18 5v8" />
              <path d="M6 13h12" />
              <path d="M8 13v6" />
              <path d="M16 13v6" />
              <path d="M5 19h14" />
            </svg>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEAT OVERVIEW
      ===================================================== */}
      <section className="mb-6">

        <div className="mb-4 flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-blue-500" />

          <h2 className="text-[22px] font-bold text-[#10203d]">
            Seat Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Student Code */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[15px] text-[#657995]">
                  Student Code
                </p>

                <p className="mt-2 text-[24px] font-bold text-[#13213b]">
                  {student.studentCode}
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
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="2"
                  />
                  <path d="M8 9h8" />
                  <path d="M8 13h5" />
                </svg>
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Your registered student identification
            </p>
          </div>

          {/* Seat Number */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[15px] text-[#657995]">
                  Assigned Seat
                </p>

                <p className="mt-2 text-[28px] font-bold text-[#13213b]">
                  {hasSeat
                    ? `Seat ${student.seatNumber}`
                    : "Not Assigned"}
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
                  <path d="M6 5v8" />
                  <path d="M18 5v8" />
                  <path d="M6 13h12" />
                  <path d="M8 13v6" />
                  <path d="M16 13v6" />
                  <path d="M5 19h14" />
                </svg>
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              {hasSeat
                ? "Your dedicated library study seat"
                : "No seat has been assigned yet"}
            </p>
          </div>

          {/* Seat Status */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[15px] text-[#657995]">
                  Seat Status
                </p>

                <p
                  className={`mt-2 text-[24px] font-bold ${
                    student.seatStatus === "OCCUPIED"
                      ? "text-blue-600"
                      : student.seatStatus === "AVAILABLE"
                        ? "text-emerald-600"
                        : "text-slate-700"
                  }`}
                >
                  {student.seatStatus ?? "Not Assigned"}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  student.seatStatus === "OCCUPIED"
                    ? "bg-blue-50 text-blue-500"
                    : student.seatStatus === "AVAILABLE"
                      ? "bg-emerald-50 text-emerald-500"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="8" />
                  <path d="M8.5 12l2.2 2.2L15.5 9" />
                </svg>
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Current status of your assigned seat
            </p>
          </div>

        </div>
      </section>

      {/* =====================================================
          ASSIGNED SEAT CARD
      ===================================================== */}
      <section className="mb-6 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

        {/* Card Header */}
        <div className="flex flex-col gap-4 bg-gradient-to-r from-[#eef6ff] to-[#f7fbff] px-7 py-6 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcecff] text-blue-500">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M6 5v8" />
                <path d="M18 5v8" />
                <path d="M6 13h12" />
                <path d="M8 13v6" />
                <path d="M16 13v6" />
                <path d="M5 19h14" />
              </svg>
            </div>

            <div>
              <h2 className="text-[24px] font-bold text-[#10203d]">
                Your Library Seat
              </h2>

              <p className="mt-1 text-[16px] text-[#647995]">
                Your currently assigned seat in the National Library.
              </p>
            </div>

          </div>

          {hasSeat && (
            <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
              ASSIGNED
            </span>
          )}
        </div>

        {/* Seat Details */}
        <div className="p-7">

          {hasSeat ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Seat Number */}
              <div className="rounded-2xl bg-gradient-to-br from-[#eef6ff] to-[#f8fbff] p-6">

                <p className="text-sm font-medium text-[#71839d]">
                  Seat Number
                </p>

                <div className="mt-3 flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <span className="text-xl font-bold">
                      {student.seatNumber}
                    </span>
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-[#13213b]">
                      Seat {student.seatNumber}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Your dedicated study seat
                    </p>
                  </div>

                </div>
              </div>

              {/* Status */}
              <div className="rounded-2xl bg-gradient-to-br from-[#effbf6] to-[#f9fffc] p-6">

                <p className="text-sm font-medium text-[#71839d]">
                  Current Status
                </p>

                <div className="mt-3 flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <svg
                      className="h-7 w-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M5 12l4 4L19 6" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {student.seatStatus ?? "OCCUPIED"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Seat allocation is active
                    </p>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-7">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3 3 20h18L12 3Z" />
                    <path d="M12 9v5" />
                    <path d="M12 17h.01" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-orange-800">
                    No Seat Assigned
                  </h3>

                  <p className="mt-1 text-sm text-orange-700">
                    Please contact the librarian to get a study seat
                    assigned to your account.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          INFORMATION
      ===================================================== */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.04)]">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5" />
              <path d="M12 8h.01" />
            </svg>
          </div>

          <div>
            <h3 className="text-[17px] font-bold text-[#13213b]">
              Seat Information
            </h3>

            <p className="mt-1 text-sm leading-6 text-[#71839d]">
              Your seat is assigned by the National Library librarian.
              If you need to change your seat, please contact the
              librarian.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}

export default MySeat