import { useEffect, useState } from "react"
import { getCurrentUser } from "../apis/authApi"
import { getStudents } from "../apis/studentApi"
import type { Student } from "../apis/studentApi"
import { getSeats } from "../apis/seatApi"
import type { Seat } from "../apis/seatApi"
import { getAllMemberships } from "../apis/membershipApi"
import type { Membership } from "../apis/membershipApi"
import { getAllPayments } from "../apis/paymentApi"
import type { Payment } from "../apis/paymentApi"
import { getAllAttendance } from "../apis/attendanceApi"
import type { Attendance } from "../apis/attendanceApi"


import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

function LibrarianDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          user,
          studentData,
          seatData,
          membershipData,
          paymentData,
          attendanceData,
        ] = await Promise.all([
          getCurrentUser(),
          getStudents(),
          getSeats(),
          getAllMemberships(),
          getAllPayments(),
          getAllAttendance(),
        ])

        console.log("Current user:", user)

        setStudents(studentData.students)
        setSeats(seatData.seats)
        setMemberships(membershipData.memberships)
        setPayments(paymentData.payments)
        setAttendance(attendanceData.attendance)

      } catch (error) {
        console.error("Failed to load dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const totalStudents = students.length

  const totalSeats = seats.length

  const occupiedSeats = seats.filter(
    (seat) => seat.status === "OCCUPIED"
  ).length

  const availableSeats = seats.filter(
    (seat) => seat.status === "AVAILABLE"
  ).length

  const seatOccupancy =
    totalSeats > 0
      ? Math.round((occupiedSeats / totalSeats) * 100)
      : 0

  const activeStudents = students.filter(
    (student) => student.status === "ACTIVE"
  ).length

  const inactiveStudents = students.filter(
    (student) => student.status !== "ACTIVE"
  ).length

  const activeMemberships = memberships.filter(
    (membership) => membership.status === "ACTIVE"
  ).length

  const upcomingMemberships = memberships.filter(
    (membership) => membership.status === "UPCOMING"
  ).length

  const expiringMemberships = memberships.filter(
    (membership) => membership.status === "EXPIRING_SOON"
  ).length

  const expiredMemberships = memberships.filter(
    (membership) => membership.status === "EXPIRED"
  ).length


  const successfulPayments = payments.filter(
    (payment) => payment.status === "PAID"
  ).length

  const pendingPayments = payments.filter(
    (payment) => payment.status === "PENDING"
  ).length

  const failedPayments = payments.filter(
    (payment) => payment.status === "FAILED"
  ).length

  const totalPaymentAmount = payments
    .filter((payment) => payment.status === "PAID")
    .reduce((total, payment) => total + Number(payment.amount), 0)



  const studentPieData = [
    {
      name: "Active Students",
      value: activeStudents,
    },
    {
      name: "Inactive Students",
      value: inactiveStudents,
    },
  ]

  const newStudentsThisMonth = students.filter((student) => {
    if (!student.joiningDate) {
      return false
    }

    const joiningDate = new Date(student.joiningDate)
    const now = new Date()

    return (
      joiningDate.getMonth() === now.getMonth() &&
      joiningDate.getFullYear() === now.getFullYear()
    )
  }).length

  const now = new Date()

  const todayAttendance = attendance.filter((record) => {
    const entryDate = new Date(record.entryTime)

    return (
      entryDate.getFullYear() === now.getFullYear() &&
      entryDate.getMonth() === now.getMonth() &&
      entryDate.getDate() === now.getDate()
    )
  })

  const currentlyStudying = todayAttendance.filter(
    (record) => record.exitTime === null
  ).length

  const completedSessionsToday = todayAttendance.filter(
    (record) => record.exitTime !== null
  ).length

  const todayStudyTimeMinutes = todayAttendance.reduce(
    (total, record) => {
      if (record.exitTime) {
        const entry = new Date(record.entryTime)
        const exit = new Date(record.exitTime)

        return total + Math.max(
          0,
          Math.floor((exit.getTime() - entry.getTime()) / 60000)
        )
      }

      const entry = new Date(record.entryTime)

      return total + Math.max(
        0,
        Math.floor((now.getTime() - entry.getTime()) / 60000)
      )
    },
    0
  )

  const todayStudyHours = Math.floor(todayStudyTimeMinutes / 60)
  const todayStudyMinutes = todayStudyTimeMinutes % 60

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
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>

        <span className="font-medium text-slate-800">
          Overview
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-base text-slate-500">
          Welcome back. Here's an overview of your National Library.
        </p>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        {/* Students */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-7 w-7 text-blue-600"
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
            </div>

            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Students
            </span>

          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Students
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {loading ? "—" : totalStudents}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Registered accounts
          </p>

        </div>

        {/* Active Students */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-7 w-7 text-emerald-600"
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
              </svg>
            </div>

            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Active
            </span>

          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Active Students
          </p>

          <p className="mt-1 text-3xl font-bold text-emerald-600">
            {loading ? "—" : activeStudents}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Currently active
          </p>

        </div>

        {/* Seats */}
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/60 p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
              <svg
                className="h-7 w-7 text-violet-600"
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
                  d="M4 11h16v7H4zM6 18v3M18 18v3"
                />
              </svg>
            </div>

            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
              Library
            </span>

          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            Total Seats
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "—" : totalSeats}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? "Loading seat information..."
              : `${occupiedSeats} occupied · ${availableSeats} available`}
          </p>

        </div>



        {/* New Students */}
        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/60 p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
              <svg
                className="h-7 w-7 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="16"
                  rx="2"
                  strokeWidth="1.8"
                />

                <path
                  strokeLinecap="round"
                  strokeWidth="1.8"
                  d="M8 3v4M16 3v4M4 10h16"
                />
              </svg>
            </div>

            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
              This Month
            </span>

          </div>

          <p className="mt-5 text-sm font-medium text-slate-500">
            New Students
          </p>

          <p className="mt-1 text-3xl font-bold text-orange-600">
            {loading ? "—" : newStudentsThisMonth}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Recently registered
          </p>

        </div>

      </div>

      {/* Overview Sections */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Student Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              Student Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current student account status.
            </p>
          </div>

          <div className="p-6">

            <div className="h-[430px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                  <Pie
                    data={studentPieData}
                    cx="50%"
                    cy="48%"
                    outerRadius={145}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={3}
                    labelLine={{
                      stroke: "#64748b",
                      strokeWidth: 1.5,
                    }}
                    label={({ name, value, percent }) =>
                      `${name} · ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>

                  <Tooltip
                    formatter={(value) => [`${value}`, "Students"]}
                  />

                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: "20px",
                    }}
                  />

                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

        {/* Library Information */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-bold text-slate-900">
              Library Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current National Library configuration.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4 p-6">

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Seats
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? "—" : totalSeats}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Occupied Seats
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-600">
                {loading ? "—" : occupiedSeats}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Available Seats
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {loading ? "—" : availableSeats}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Seat Occupancy
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {loading ? "—" : `${seatOccupancy}%`}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Floors
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                1
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Operating Hours
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                24 × 7
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Active Students
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {loading ? "—" : activeStudents}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Membership Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Membership Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current membership status across the National Library.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">

          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Active
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {loading ? "—" : activeMemberships}
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Upcoming
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {loading ? "—" : upcomingMemberships}
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Expiring Soon
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-600">
              {loading ? "—" : expiringMemberships}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Expired
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {loading ? "—" : expiredMemberships}
            </p>
          </div>

        </div>

      </div>

      {/* Payment Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Payment Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current payment activity across the National Library.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">

          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Successful
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {loading ? "—" : successfulPayments}
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {loading ? "—" : pendingPayments}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Failed
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {loading ? "—" : failedPayments}
            </p>
          </div>

          <div className="rounded-xl bg-violet-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Successful Amount
            </p>

            <p className="mt-2 text-2xl font-bold text-violet-600">
              {loading
                ? "—"
                : `₹${totalPaymentAmount.toLocaleString("en-IN")}`}
            </p>
          </div>

        </div>

      </div>

      {/* Attendance Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Attendance Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Today's library attendance activity.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">

          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Today's Attendance
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {loading ? "—" : todayAttendance.length}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Currently Studying
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {loading ? "—" : currentlyStudying}
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Completed Sessions
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-600">
              {loading ? "—" : completedSessionsToday}
            </p>
          </div>

          <div className="rounded-xl bg-violet-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Today's Study Time
            </p>

            <p className="mt-2 text-2xl font-bold text-violet-600">
              {loading
                ? "—"
                : `${todayStudyHours}h ${todayStudyMinutes}m`}
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}

export default LibrarianDashboard