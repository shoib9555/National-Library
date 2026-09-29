import { useEffect, useState } from "react"
import {
  getMyStudentProfile,
  type MyStudentProfileResponse,
} from "../apis/studentApi"
import {
  getMyAttendance,
  type Attendance as AttendanceRecord,
} from "../apis/attendanceApi"
import {
  getMyMemberships,
  type MyMembership,
} from "../apis/membershipApi"
import {
  getMyPayments,
  type Payment,
} from "../apis/paymentApi"

function StudentDashboard() {
  const [student, setStudent] =
    useState<MyStudentProfileResponse["student"] | null>(null)

  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>([])

  const [membership, setMembership] =
    useState<MyMembership | null>(null)

  const [payments, setPayments] = useState<Payment[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [
          profileResponse,
          attendanceResponse,
          membershipResponse,
          paymentsResponse,
        ] = await Promise.all([
          getMyStudentProfile(),
          getMyAttendance(),
          getMyMemberships(),
          getMyPayments(),
        ])

        setStudent(profileResponse.student)
        setAttendance(attendanceResponse.attendance)
        setPayments(paymentsResponse.payments)

        const memberships = membershipResponse.memberships

        const currentMembership =
          memberships.find(
            (item) => item.status === "ACTIVE"
          ) ??
          memberships.find(
            (item) => item.status === "EXPIRING_SOON"
          ) ??
          memberships.find(
            (item) => item.status === "UPCOMING"
          ) ??
          null

        setMembership(currentMembership)
      } catch (err) {
        console.error(err)
        setError("Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const latestPayment = payments.length > 0
    ? payments[0]
    : null

  const totalPaidAmount = payments
    .filter((payment) => payment.status === "PAID")
    .reduce((total, payment) => total + Number(payment.amount), 0)

  const activeAttendance = attendance.find(
    (record) => record.exitTime === null
  )

  const getTotalStudyTime = (
    records: AttendanceRecord[],
    period: "today" | "month"
  ) => {
    let totalMilliseconds = 0

    records.forEach((record) => {
      const entry = new Date(record.entryTime)

      const isSameDay =
        entry.getFullYear() === currentTime.getFullYear() &&
        entry.getMonth() === currentTime.getMonth() &&
        entry.getDate() === currentTime.getDate()

      const isSameMonth =
        entry.getFullYear() === currentTime.getFullYear() &&
        entry.getMonth() === currentTime.getMonth()

      if (
        (period === "today" && !isSameDay) ||
        (period === "month" && !isSameMonth)
      ) {
        return
      }

      const end = record.exitTime
        ? new Date(record.exitTime)
        : currentTime

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

  const getMembershipMessage = (membership: MyMembership) => {
    switch (membership.status) {
      case "ACTIVE":
        return `Your membership is active until ${formatDate(
          membership.expiryDate
        )}.`

      case "EXPIRING_SOON":
        return `Your membership expires on ${formatDate(
          membership.expiryDate
        )}. Please renew soon.`

      case "UPCOMING":
        return `Your membership starts on ${formatDate(
          membership.startDate
        )}.`

      case "EXPIRED":
        return `Your membership expired on ${formatDate(
          membership.expiryDate
        )}. Please renew your membership.`

      default:
        return ""
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-84px)] items-center justify-center bg-[#f7faff]">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-7">
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
      <div className="p-7">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
          <p className="font-medium text-slate-500">
            Student profile not found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#f7faff] p-6 md:p-7">

      {/* =====================================================
          WELCOME HEADER
      ===================================================== */}
      <section className="relative mb-6 overflow-hidden rounded-[20px] bg-gradient-to-r from-[#eaf5ff] via-[#eef7ff] to-[#dceeff] px-7 py-6">

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-blue-200/30" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-44 w-44 rounded-full bg-indigo-200/20" />

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 to-blue-100 px-9 py-8">

          <div className="pr-28">
            <p className="text-lg font-semibold uppercase tracking-wider text-blue-600">
              Student Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              Welcome, {student?.name}
            </h1>

            <p className="mt-3 text-lg text-slate-500">
              Student Code:{" "}
              <span className="font-semibold text-slate-700">
                {student?.studentCode}
              </span>
            </p>
          </div>

          {/* Profile Photo - Top Right */}
          <div className="absolute right-8 top-6">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
              {student?.profilePhotoUrl ? (
                <img
                  src={student.profilePhotoUrl}
                  alt={student.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-50 text-2xl font-bold text-blue-600">
                  {student?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          ACCOUNT INFORMATION
      ===================================================== */}
      <section className="mb-7">

        <div className="mb-4 flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-blue-500" />

          <h2 className="text-[22px] font-bold text-[#10203d]">
            Account Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {/* Account Status */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-[15px] text-[#657995]">
                  Account Status
                </p>

                <p className="mt-2 text-[24px] font-bold text-[#13213b]">
                  {student.status}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12l4 4L19 6" />
                </svg>
              </div>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full w-full rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* Seat */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-[15px] text-[#657995]">
                  Assigned Seat
                </p>

                <p className="mt-2 text-[24px] font-bold text-[#13213b]">
                  {student.seatNumber
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
              Your dedicated library study seat
            </p>
          </div>

          {/* Email */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">
            <div className="flex items-start justify-between">

              <div className="min-w-0 pr-3">
                <p className="text-[15px] text-[#657995]">
                  Email
                </p>

                <p className="mt-2 break-all text-[20px] font-bold leading-7 text-[#13213b]">
                  {student.email}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Registered email address
            </p>
          </div>

        </div>
      </section>

      {/* =====================================================
          STUDY SUMMARY
      ===================================================== */}
      <section className="mb-7">

        <div className="mb-4 flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-purple-500" />

          <h2 className="text-[22px] font-bold text-[#10203d]">
            Study Summary
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {/* Today's Study Time */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] text-[#657995]">
                  Today's Study Time
                </p>

                <p className="mt-2 text-[27px] font-bold text-[#13213b]">
                  {todayStudyTime}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
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
              Total study time today
            </p>
          </div>

          {/* This Month */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] text-[#657995]">
                  This Month
                </p>

                <p className="mt-2 text-[27px] font-bold text-[#13213b]">
                  {monthStudyTime}
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
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <path d="M4 9h16" />
                </svg>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Total study time this month
            </p>
          </div>

          {/* Attendance */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] text-[#657995]">
                  Attendance Status
                </p>

                <p
                  className={`mt-2 text-[22px] font-bold ${activeAttendance
                    ? "text-emerald-600"
                    : "text-slate-800"
                    }`}
                >
                  {activeAttendance
                    ? "Currently Studying"
                    : "Not Studying"}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${activeAttendance
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
              {activeAttendance
                ? "Your study session is active"
                : "No active study session"}
            </p>
          </div>

        </div>
      </section>

      {/* =====================================================
          PAYMENT OVERVIEW
      ===================================================== */}
      <section className="mb-7">

        <div className="mb-4 flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-violet-500" />

          <h2 className="text-[22px] font-bold text-[#10203d]">
            Payment Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {/* Total Paid */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[15px] text-[#657995]">
                  Total Paid
                </p>

                <p className="mt-2 text-[27px] font-bold text-[#13213b]">
                  ₹{totalPaidAmount.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 10h18" />
                  <path d="M7 15h4" />
                </svg>
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Total amount paid
            </p>

          </div>

          {/* Latest Payment */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[15px] text-[#657995]">
                  Latest Payment
                </p>

                <p className="mt-2 text-[27px] font-bold text-[#13213b]">
                  {latestPayment
                    ? `₹${Number(latestPayment.amount).toLocaleString("en-IN")}`
                    : "No Payment"}
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
                  <path d="M5 12l4 4L19 6" />
                </svg>
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              {latestPayment
                ? new Date(
                  latestPayment.paymentDate
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "No payment recorded"}
            </p>

          </div>

          {/* Payment Method */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[15px] text-[#657995]">
                  Payment Method
                </p>

                <p className="mt-2 text-[24px] font-bold text-[#13213b]">
                  {latestPayment
                    ? latestPayment.paymentMethod
                    : "—"}
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
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 10h18" />
                </svg>
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Most recent payment method
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          MEMBERSHIP
      ===================================================== */}
      <section className="mb-7">

        <div className="mb-4 flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-emerald-500" />

          <h2 className="text-[22px] font-bold text-[#10203d]">
            Membership
          </h2>
        </div>

        {membership ? (
          <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            {/* Membership header */}
            <div className="flex flex-col gap-4 bg-gradient-to-r from-[#effbf6] to-[#f8fffc] px-6 py-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="4" y="5" width="16" height="14" rx="2" />
                    <path d="M8 9h8" />
                    <path d="M8 13h5" />
                  </svg>
                </div>

                <div>
                  <p className="text-[17px] font-bold text-[#13213b]">
                    Current Membership
                  </p>

                  <p className="mt-1 text-sm text-[#6b8099]">
                    {getMembershipMessage(membership)}
                  </p>
                </div>
              </div>

              <span
                className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${membership.status === "ACTIVE"
                  ? "bg-emerald-100 text-emerald-700"
                  : membership.status === "EXPIRING_SOON"
                    ? "bg-orange-100 text-orange-700"
                    : membership.status === "UPCOMING"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
              >
                {membership.status}
              </span>
            </div>

            {/* Membership information */}
            <div className="grid grid-cols-1 gap-6 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4">

              <div>
                <p className="text-sm text-[#71839d]">
                  Monthly Fee
                </p>

                <p className="mt-2 text-[20px] font-bold text-[#13213b]">
                  ₹{membership.monthlyFee}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#71839d]">
                  Start Date
                </p>

                <p className="mt-2 text-[20px] font-bold text-[#13213b]">
                  {formatDate(membership.startDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#71839d]">
                  Expiry Date
                </p>

                <p className="mt-2 text-[20px] font-bold text-[#13213b]">
                  {formatDate(membership.expiryDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#71839d]">
                  Membership Status
                </p>

                <p className="mt-2 text-[20px] font-bold text-emerald-600">
                  {membership.status}
                </p>
              </div>

            </div>
          </div>
        ) : (
          <div className="rounded-[18px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm text-slate-500">
              No membership found.
            </p>
          </div>
        )}
      </section>

    </div>
  )
}

export default StudentDashboard