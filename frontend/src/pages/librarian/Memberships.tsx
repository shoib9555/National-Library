import { useEffect, useState } from "react"
import {
  getAllMemberships,
  createMembership,
  renewMembership,
} from "../../apis/membershipApi"
import { getStudents } from "../../apis/studentApi"
import type { Student } from "../../apis/studentApi"
import type { Membership } from "../../apis/membershipApi"

function Memberships() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [students, setStudents] = useState<Student[]>([])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStudentCode, setSelectedStudentCode] = useState("")
  const [startDate, setStartDate] = useState("")
  const [membershipPlan, setMembershipPlan] = useState("24")
  const [creatingMembership, setCreatingMembership] = useState(false)

  const [showRenewModal, setShowRenewModal] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null)
  const [renewalDate, setRenewalDate] = useState("")
  const [renewingMembership, setRenewingMembership] = useState(false)

  useEffect(() => {
    const loadMemberships = async () => {
      try {
        setLoading(true)
        setError("")

        const [membershipData, studentData] = await Promise.all([
          getAllMemberships(),
          getStudents(),
        ])

        setMemberships(membershipData.memberships)
        setStudents(studentData.students)
      } catch (error) {
        console.error("Failed to fetch memberships:", error)
        setError("Failed to load memberships")
      } finally {
        setLoading(false)
      }
    }

    loadMemberships()
  }, [])

  const handleCreateMembership = async () => {
    if (!selectedStudentCode || !startDate) {
      return
    }

    try {
      setCreatingMembership(true)
      setError("")

      await createMembership({
  studentCode: selectedStudentCode,
  startDate: new Date(`${startDate}T00:00:00`).toISOString(),
  accessHours: Number(membershipPlan),
})

      const data = await getAllMemberships()

      setMemberships(data.memberships)

      setShowCreateModal(false)
      setSelectedStudentCode("")
      setStartDate("")
    } catch (error) {
      console.error("Failed to create membership:", error)
      setError("Failed to create membership")
    } finally {
      setCreatingMembership(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading memberships...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>

        <button
          type="button"
          onClick={() => setError("")}
          className="rounded-xl bg-[#10284a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#173761]"
        >
          Back
        </button>
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
          Memberships
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Memberships
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            Manage student library memberships and subscription status.
          </p>
        </div>

        {/* IMPORTANT:
            This button ONLY opens the modal.
        */}
        <button
          type="button"
          onClick={() => {
            setError("")
            setShowCreateModal(true)
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10284a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173761]"
        >
          <span className="text-lg">+</span>
          Create Membership
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-4">
        {/* Total */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Total Memberships
          </p>

          <p className="mt-3 text-4xl font-bold text-slate-950">
            {memberships.length}
          </p>
        </div>

        {/* Active */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Active
          </p>

          <p className="mt-3 text-4xl font-bold text-emerald-600">
            {
              memberships.filter(
                (membership) => membership.status === "ACTIVE"
              ).length
            }
          </p>
        </div>

        {/* Expiring Soon */}
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Expiring Soon
          </p>

          <p className="mt-3 text-4xl font-bold text-amber-600">
            {
              memberships.filter(
                (membership) =>
                  membership.status === "EXPIRING_SOON"
              ).length
            }
          </p>
        </div>

        {/* Expired */}
        <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Expired
          </p>

          <p className="mt-3 text-4xl font-bold text-red-600">
            {
              memberships.filter(
                (membership) => membership.status === "EXPIRED"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Membership Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Membership Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {memberships.length} membership record
            {memberships.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Plan
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Start Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Expiry Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fee
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {memberships.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No membership records found.
                  </td>
                </tr>
              ) : (
                memberships.map((membership) => (
                  <tr
                    key={membership.membershipId}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    {/* Student */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {membership.studentName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {membership.studentCode}
                      </p>
                    </td>

                    {/* Membership ID */}
                    <td className="px-6 py-4">
  <p className="text-sm font-semibold text-slate-900">
    {membership.accessHours} Hours
  </p>
  <p className="mt-1 text-xs text-slate-500">
    #{membership.membershipId}
  </p>
</td>

                    {/* Start Date */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(
                        membership.startDate
                      ).toLocaleDateString()}
                    </td>

                    {/* Expiry Date */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(
                        membership.expiryDate
                      ).toLocaleDateString()}
                    </td>

                    {/* Fee */}
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ₹{membership.monthlyFee}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${membership.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : membership.status ===
                            "EXPIRING_SOON"
                            ? "bg-amber-100 text-amber-700"
                            : membership.status === "UPCOMING"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                      >
                        {membership.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="px-6 py-4">
                      {membership.payment ? (
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {membership.payment.paymentMethod}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            ₹{membership.payment.amount}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          No payment
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMembership(membership)
                          setRenewalDate("")
                          setShowRenewModal(true)
                        }}
                        className="rounded-lg bg-[#10284a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#173761]"
                      >
                        Renew
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Membership Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Create Membership
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new one-month library membership.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!creatingMembership) {
                    setShowCreateModal(false)
                  }
                }}
                disabled={creatingMembership}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 px-6 py-6">
              {/* Student */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Student
                </label>

                <select
                  value={selectedStudentCode}
                  onChange={(e) =>
                    setSelectedStudentCode(e.target.value)
                  }
                  disabled={creatingMembership}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    Select a student
                  </option>

                  {students
                    .filter(
                      (student) => student.status === "ACTIVE"
                    )
                    .map((student) => (
                      <option
                        key={student.id}
                        value={student.studentCode}
                      >
                        {student.name} — {student.studentCode}
                      </option>
                    ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  disabled={creatingMembership}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              {/* Membership Plan */}
<div>
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    Membership Plan
  </label>

  <select
    value={membershipPlan}
    onChange={(e) => setMembershipPlan(e.target.value)}
    disabled={creatingMembership}
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
  >
    <option value="24">24 Hours — ₹1,000 / month</option>
    <option value="12">12 Hours — ₹800 / month</option>
    <option value="6">6 Hours — ₹600 / month</option>
    <option value="4">4 Hours — ₹400 / month</option>
  </select>
</div>

              {/* Fee */}
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Monthly Fee
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-700">
  ₹
  {membershipPlan === "24"
    ? "1,000"
    : membershipPlan === "12"
      ? "800"
      : membershipPlan === "6"
        ? "600"
        : "400"}
</p>
              </div>

              {/* Modal Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <button
                type="button"
                disabled={creatingMembership}
                onClick={() => {
                  setShowCreateModal(false)
                  setSelectedStudentCode("")
                  setStartDate("")
                  setMembershipPlan("24")
                }}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              {/* IMPORTANT:
                  This button actually creates the membership.
              */}
              <button
                type="button"
                disabled={
                  !selectedStudentCode ||
                  !startDate ||
                  creatingMembership
                }
                onClick={handleCreateMembership}
                className="rounded-xl bg-[#10284a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173761] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingMembership
                  ? "Creating..."
                  : "Create Membership"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRenewModal && selectedMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Renew Membership
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Renew the membership for one more month.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRenewModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 px-6 py-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedMembership.studentName}
                </p>

                <p className="text-sm text-slate-500">
                  {selectedMembership.studentCode}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Payment Date
                </label>

                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Renewal Fee
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-700">
                  ₹800
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <button
                type="button"
                onClick={() => setShowRenewModal(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!renewalDate || renewingMembership}
                onClick={async () => {
                  if (!renewalDate || !selectedMembership) {
                    return
                  }

                  try {
                    setRenewingMembership(true)
                    setError("")

                    await renewMembership({
                      studentCode: selectedMembership.studentCode,
                      paymentDate: new Date(
                        `${renewalDate}T00:00:00`
                      ).toISOString(),
                    })

                    const data = await getAllMemberships()

                    setMemberships(data.memberships)

                    setShowRenewModal(false)
                    setSelectedMembership(null)
                    setRenewalDate("")
                  } catch (error) {
                    console.error(
                      "Failed to renew membership:",
                      error
                    )

                    setError("Failed to renew membership")
                  } finally {
                    setRenewingMembership(false)
                  }
                }}
                className="rounded-xl bg-[#10284a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173761] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {renewingMembership
                  ? "Renewing..."
                  : "Renew Membership"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Memberships