import { useEffect, useState } from "react"
import {
  getMyPayments,
  getPaymentReceipt,
  type Payment,
} from "../../apis/paymentApi"

function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getMyPayments()
        setPayments(response.payments)
      } catch (err) {
        console.error(err)
        setError("Failed to load payment history")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const handleReceipt = async (paymentId: number) => {
    try {
      const blob = await getPaymentReceipt(paymentId)

      const url = window.URL.createObjectURL(blob)
      window.open(url, "_blank")

      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (err) {
      console.error(err)
      alert("Failed to load payment receipt")
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PAID":
      case "SUCCESS":
        return "bg-emerald-100 text-emerald-700"

      case "PENDING":
        return "bg-orange-100 text-orange-700"

      case "FAILED":
        return "bg-red-100 text-red-700"

      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const totalPaid = payments
    .filter(
      (payment) =>
        payment.status === "PAID" ||
        payment.status === "SUCCESS"
    )
    .reduce(
      (total, payment) => total + Number(payment.amount),
      0
    )

  const successfulPayments = payments.filter(
    (payment) =>
      payment.status === "PAID" ||
      payment.status === "SUCCESS"
  ).length

  const pendingPayments = payments.filter(
    (payment) => payment.status === "PENDING"
  ).length

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-84px)] items-center justify-center bg-[#f7faff]">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Loading payment history...
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
            My Payments
          </h1>

          <p className="mt-1.5 text-[17px] text-[#58708f]">
            View your payment history and download receipts.
          </p>
        </div>

        {/* Payment Icon */}
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
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
              />
              <path d="M3 10h18" />
              <path d="M7 15h3" />
            </svg>
          </div>
        </div>
      </section>

      {/* =====================================================
          PAYMENT SUMMARY
      ===================================================== */}
      {payments.length > 0 && (
        <section className="mb-7">

          <div className="mb-4 flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-blue-500" />

            <h2 className="text-[22px] font-bold text-[#10203d]">
              Payment Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* Total Paid */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[15px] text-[#657995]">
                    Total Paid
                  </p>

                  <p className="mt-2 text-[28px] font-bold text-emerald-600">
                    ₹{totalPaid}
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
                    <path d="M12 3v18" />
                    <path d="M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3" />
                  </svg>
                </div>

              </div>
            </div>

            {/* Successful */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[15px] text-[#657995]">
                    Successful Payments
                  </p>

                  <p className="mt-2 text-[28px] font-bold text-blue-600">
                    {successfulPayments}
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
                    <path d="m8.5 12 2.2 2.2 4.8-5" />
                  </svg>
                </div>

              </div>
            </div>

            {/* Pending */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[15px] text-[#657995]">
                    Pending Payments
                  </p>

                  <p className="mt-2 text-[28px] font-bold text-orange-500">
                    {pendingPayments}
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
            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          PAYMENT HISTORY
      ===================================================== */}
      <section>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-purple-500" />

          <h2 className="text-[22px] font-bold text-[#10203d]">
            Payment History
          </h2>
        </div>

        {payments.length === 0 ? (
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
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="M3 10h18" />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#13213b]">
                  No Payment Records
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your payment history will appear here.
                </p>
              </div>

            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px] text-left">

                <thead className="bg-[#f4f8fd]">

                  <tr className="border-b border-slate-200">

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Payment ID
                    </th>

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Amount
                    </th>

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Method
                    </th>

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Date
                    </th>

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Status
                    </th>

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Reference
                    </th>

                    <th className="px-6 py-5 text-sm font-bold text-[#526987]">
                      Receipt
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >

                      {/* Payment ID */}
                      <td className="px-6 py-5 text-sm font-bold text-[#13213b]">
                        #{payment.id}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5 text-sm font-bold text-[#13213b]">
                        ₹{payment.amount}
                      </td>

                      {/* Method */}
                      <td className="px-6 py-5">

                        <span className="inline-flex rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
                          {payment.paymentMethod}
                        </span>

                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 text-sm font-medium text-[#526987]">
                        {formatDate(payment.paymentDate)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>

                      </td>

                      {/* Reference */}
                      <td className="px-6 py-5 text-sm text-[#526987]">

                        {payment.transactionReference ? (
                          <span className="break-all font-medium">
                            {payment.transactionReference}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            —
                          </span>
                        )}

                      </td>

                      {/* Receipt */}
                      <td className="px-6 py-5">

                        <button
                          onClick={() =>
                            handleReceipt(payment.id)
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >

                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M6 2h9l3 3v17H6z" />
                            <path d="M14 2v4h4" />
                            <path d="M9 13h6" />
                            <path d="M9 17h6" />
                          </svg>

                          View Receipt

                        </button>

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

export default Payments