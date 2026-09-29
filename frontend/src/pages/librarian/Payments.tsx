import { useEffect, useState } from "react"
import {
  getAllPayments,
  getPaymentReceipt,
  recordCashPayment,
  recordUpiPayment,
} from "../../apis/paymentApi"

import { getAllMemberships } from "../../apis/membershipApi"
import type { Membership } from "../../apis/membershipApi"
import type { Payment } from "../../apis/paymentApi"
import { getStudents } from "../../apis/studentApi"
import type { Student } from "../../apis/studentApi"
function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [receiptLoading, setReceiptLoading] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [methodFilter, setMethodFilter] = useState("ALL")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedMembershipId, setSelectedMembershipId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI">("CASH")
  const [transactionReference, setTransactionReference] = useState("")
  const [recordingPayment, setRecordingPayment] = useState(false)
  const handleViewReceipt = async (paymentId: number) => {
    try {
      setReceiptLoading(paymentId)
      setError("")
      const blob = await getPaymentReceipt(paymentId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `payment-receipt-${paymentId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      console.error("Failed to download payment receipt:", error)
      setError("Failed to download payment receipt")
    } finally {
      setReceiptLoading(null)
    }
  }
  const handleRecordPayment = async () => {
    if (!selectedMembershipId) {
      setError("Please select a membership")
      return
    }
    const selectedMembership = memberships.find(
      (membership) =>
        membership.membershipId === Number(selectedMembershipId)
    )
    if (!selectedMembership) {
      setError("Membership not found")
      return
    }
    if (
      paymentMethod === "UPI" &&
      !transactionReference.trim()
    ) {
      setError("Please enter the UPI transaction reference")
      return
    }
    try {
      setRecordingPayment(true)
      setError("")
      if (paymentMethod === "CASH") {
        await recordCashPayment({
          studentCode: selectedMembership.studentCode,
          membershipId: selectedMembership.membershipId,
        })
        const data = await getAllPayments()
        console.log("PAYMENTS FROM API:", data.payments)
        setPayments(data.payments)
        setShowPaymentModal(false)
        setSelectedMembershipId("")
        setPaymentMethod("CASH")
        setTransactionReference("")
        return
      }
      if (paymentMethod === "UPI") {
        await recordUpiPayment({
          studentCode: selectedMembership.studentCode,
          membershipId: selectedMembership.membershipId,
          transactionReference: transactionReference.trim(),
        })
        const data = await getAllPayments()
        setPayments(data.payments)
        setShowPaymentModal(false)
        setSelectedMembershipId("")
        setPaymentMethod("CASH")
        setTransactionReference("")
        return
      }
      
     
    } catch (error) {
      console.error("Failed to process payment:", error)
      setError("Failed to process payment")
      setRecordingPayment(false)
    }
  }
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true)
        setError("")
        const [paymentData, membershipData, studentData] =
          await Promise.all([
            getAllPayments(),
            getAllMemberships(),
            getStudents(),
          ])
        setPayments(paymentData.payments)
        setMemberships(membershipData.memberships)
        setStudents(studentData.students)
        setPayments(paymentData.payments)
        setMemberships(membershipData.memberships)
      } catch (error) {
        console.error("Failed to fetch payments:", error)
        setError("Failed to load payments")
      } finally {
        setLoading(false)
      }
    }
    loadPayments()
  }, [])
  const filteredPayments = payments.filter((payment) => {
    const search = searchTerm.toLowerCase().trim()
    const matchesSearch =
      payment.student.name.toLowerCase().includes(search) ||
      payment.student.studentCode.toLowerCase().includes(search)
    const matchesStatus =
      statusFilter === "ALL" ||
      payment.status === statusFilter
    const matchesMethod =
      methodFilter === "ALL" ||
      payment.paymentMethod === methodFilter
    return matchesSearch && matchesStatus && matchesMethod
  })
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading payments...</p>
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
          Payments
        </span>
      </div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Payments
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            View and manage library payment records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError("")
            setShowPaymentModal(true)
          }}
          className="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172F70]"
        >
          + Record Payment
        </button>
      </div>
      {/* Summary */}
      <div className="grid gap-5 md:grid-cols-4">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Total Payments
          </p>
          <p className="mt-3 text-4xl font-bold text-slate-950">
            {payments.length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Paid
          </p>
          <p className="mt-3 text-4xl font-bold text-emerald-600">
            {
              payments.filter(
                (payment) => payment.status === "PAID"
              ).length
            }
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Pending
          </p>
          <p className="mt-3 text-4xl font-bold text-amber-600">
            {
              payments.filter(
                (payment) => payment.status === "PENDING"
              ).length
            }
          </p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Failed
          </p>
          <p className="mt-3 text-4xl font-bold text-red-600">
            {
              payments.filter(
                (payment) => payment.status === "FAILED"
              ).length
            }
          </p>
        </div>
      </div>
      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search Student
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or student code..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          {/* Method */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Payment Method
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>

            </select>
          </div>
          {/* Clear */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("ALL")
                setMethodFilter("ALL")
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:w-auto"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      {/* Payment Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Payment Records
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredPayments.length} payment record
            {filteredPayments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1350px] w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Transaction Reference
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    {/* Student */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {payment.student.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payment.student.studentCode}
                      </p>
                    </td>
                    {/* Amount */}
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ₹{Number(payment.amount)}
                    </td>
                    {/* Method */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    {/* Payment Date */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(
                        payment.paymentDate
                      ).toLocaleDateString()}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${payment.status === "PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : payment.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    {/* Transaction Reference */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {payment.transactionReference}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewReceipt(payment.id)}
                        disabled={receiptLoading === payment.id}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {receiptLoading === payment.id
                          ? "Downloading..."
                          : "Receipt"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">
                        Record Payment
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                      Record a cash or UPI membership payment.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModal(false)
                        setSelectedMembershipId("")
                        setPaymentMethod("CASH")
                        setTransactionReference("")
                      }}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {/* Body */}
                <div className="space-y-5 px-6 py-6">
                  {/* Membership */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Student Membership
                    </label>
                    <select
                      value={selectedMembershipId}
                      onChange={(e) => setSelectedMembershipId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Select student membership
                      </option>
                      {memberships
                        .filter((membership) => {
                          const student = students.find(
                            (student) =>
                              student.studentCode === membership.studentCode
                          )
                          return (
                            student?.status === "ACTIVE" &&
                            (membership.status === "ACTIVE" ||
                              membership.status === "EXPIRING_SOON") &&
                            membership.payment === null
                          )
                        })
                        .map((membership) => (
                          <option
                            key={membership.membershipId}
                            value={membership.membershipId}
                          >
                            {membership.studentName} —{" "}
                            {membership.studentCode}
                          </option>
                        ))}
                    </select>
                  </div>
                  {/* Amount */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Amount
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-900">
                      ₹800
                    </div>
                  </div>
                  {/* Payment Method */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("CASH")
                          setTransactionReference("")
                        }}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${paymentMethod === "CASH"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("UPI")}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${paymentMethod === "UPI"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        UPI
                      </button>
                      
                    </div>
                  </div>
                  {/* UPI Reference */}
                  {paymentMethod === "UPI" && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        UPI Transaction Reference
                      </label>
                      <input
                        type="text"
                        value={transactionReference}
                        onChange={(e) =>
                          setTransactionReference(e.target.value)
                        }
                        placeholder="Enter UPI transaction ID"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  )}
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false)
                      setSelectedMembershipId("")
                      setPaymentMethod("CASH")
                      setTransactionReference("")
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRecordPayment}
                    disabled={recordingPayment}
                    className="rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172F70] disabled:cursor-not-allowed disabled:opacity-50"
                  >
               {recordingPayment ? "Recording..." : "Record Payment"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Payments

