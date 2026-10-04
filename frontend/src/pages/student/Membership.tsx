import { useEffect, useState } from "react"
import {
  getMyMemberships,
  type MyMembership,
} from "../../apis/membershipApi"

function Membership() {
  const [memberships, setMemberships] = useState<MyMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await getMyMemberships()
        setMemberships(response.memberships)
      } catch (err) {
        console.error(err)
        setError("Failed to load membership information")
      } finally {
        setLoading(false)
      }
    }

    fetchMemberships()
  }, [])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700"

      case "UPCOMING":
        return "bg-blue-100 text-blue-700"

      case "EXPIRING_SOON":
        return "bg-orange-100 text-orange-700"

      case "EXPIRED":
        return "bg-red-100 text-red-700"

      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "PAID":
        return "bg-emerald-100 text-emerald-700"

      case "PENDING":
        return "bg-orange-100 text-orange-700"

      case "FAILED":
        return "bg-red-100 text-red-700"

      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-84px)] items-center justify-center bg-[#f7faff]">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Loading membership information...
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
      <section className="relative mb-6 overflow-hidden rounded-[20px] bg-gradient-to-r from-[#eaf5ff] via-[#eef7ff] to-[#dceeff] px-5 py-6 sm:px-7 sm:py-7">

        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-blue-200/30" />

        <div className="pointer-events-none absolute -bottom-20 right-52 h-44 w-44 rounded-full bg-indigo-200/20" />

        <div className="relative z-10">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-500">
            Student Portal
          </p>

          <h1 className="text-[30px] font-bold tracking-[-0.8px] text-[#10203d] sm:text-[34px]">
            My Membership
          </h1>

          <p className="mt-1.5 text-[15px] leading-6 text-[#58708f] sm:text-[17px]">
            View your membership, payment and validity information.
          </p>
        </div>

        {/* Membership Icon */}
        <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 lg:flex">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/75 text-blue-500 shadow-sm">
            <svg
              className="h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 9h10" />
              <path d="M7 13h6" />
              <path d="M7 16h3" />
            </svg>
          </div>
        </div>
      </section>

      {/* =====================================================
          MEMBERSHIP SUMMARY
      ===================================================== */}
      {memberships.length > 0 && (
        <section className="mb-7">

          <div className="mb-4 flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-blue-500" />

            <h2 className="text-[22px] font-bold text-[#10203d]">
              Membership Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

            {/* Total Memberships */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] text-[#657995]">
                    Total Records
                  </p>

                  <p className="mt-2 text-[28px] font-bold text-[#13213b]">
                    {memberships.length}
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
                    <rect x="4" y="5" width="16" height="14" rx="2" />
                    <path d="M8 9h8" />
                    <path d="M8 13h5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] text-[#657995]">
                    Active
                  </p>

                  <p className="mt-2 text-[28px] font-bold text-emerald-600">
                    {
                      memberships.filter(
                        (item) => item.status === "ACTIVE"
                      ).length
                    }
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
            </div>

            {/* Upcoming */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] text-[#657995]">
                    Upcoming
                  </p>

                  <p className="mt-2 text-[28px] font-bold text-blue-600">
                    {
                      memberships.filter(
                        (item) => item.status === "UPCOMING"
                      ).length
                    }
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
            </div>

            {/* Expired */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_3px_15px_rgba(25,55,90,0.05)]">

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] text-[#657995]">
                    Expired
                  </p>

                  <p className="mt-2 text-[28px] font-bold text-red-500">
                    {
                      memberships.filter(
                        (item) => item.status === "EXPIRED"
                      ).length
                    }
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="8" />
                    <path d="m9 9 6 6" />
                    <path d="m15 9-6 6" />
                  </svg>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          MEMBERSHIP RECORDS
      ===================================================== */}
      <section>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-emerald-500" />

          <h2 className="text-[22px] font-bold text-[#10203d]">
            Membership Records
          </h2>
        </div>

        {memberships.length === 0 ? (
          <div className="rounded-[20px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#13213b]">
                  No Membership Records
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  No membership records were found for your account.
                </p>
              </div>

            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {memberships.map((membership) => (
              <div
                key={membership.membershipId}
                className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.05)]"
              >

                {/* Membership Header */}
                <div className="flex flex-col gap-4 bg-gradient-to-r from-[#eef6ff] to-[#f7fbff] px-7 py-5 md:flex-row md:items-center md:justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcecff] text-blue-500">
                      <svg
                        className="h-7 w-7"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                        />
                        <path d="M7 9h10" />
                        <path d="M7 13h6" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-[17px] font-bold text-[#13213b]">
                        Membership #{membership.membershipId}
                      </p>

                      <p className="mt-1 text-sm text-[#71839d]">
                        Library membership record
                      </p>
                    </div>

                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${getStatusStyle(
                      membership.status
                    )}`}
                  >
                    {membership.status}
                  </span>

                </div>

                {/* Membership Details */}
                <div className="px-7 py-7">

                  <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-4">

                    {/* Membership ID */}
                    <div>
                      <p className="text-sm text-[#71839d]">
                        Membership ID
                      </p>

                      <p className="mt-2 text-[20px] font-bold text-[#13213b]">
                        #{membership.membershipId}
                      </p>
                    </div>

                    {/* Start Date */}
                    <div>
                      <p className="text-sm text-[#71839d]">
                        Start Date
                      </p>

                      <p className="mt-2 text-[20px] font-bold text-[#13213b]">
                        {formatDate(membership.startDate)}
                      </p>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <p className="text-sm text-[#71839d]">
                        Expiry Date
                      </p>

                      <p className="mt-2 text-[20px] font-bold text-[#13213b]">
                        {formatDate(membership.expiryDate)}
                      </p>
                    </div>

                    {/* Monthly Fee */}
                    <div>
                      <p className="text-sm text-[#71839d]">
                        Monthly Fee
                      </p>

                      <p className="mt-2 text-[20px] font-bold text-[#13213b]">
                        ₹{membership.monthlyFee}
                      </p>
                    </div>

                  </div>

                  {/* Payment Information */}
                  {membership.payment && (
                    <div className="mt-7 border-t border-slate-100 pt-7">

                      <div className="mb-5 flex items-center gap-3">
                        <div className="h-6 w-1 rounded-full bg-purple-500" />

                        <h3 className="text-[18px] font-bold text-[#13213b]">
                          Payment Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

                        {/* Payment Status */}
                        <div>
                          <p className="text-sm text-[#71839d]">
                            Payment Status
                          </p>

                          <span
                            className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${getPaymentStatusStyle(
                              membership.payment.status
                            )}`}
                          >
                            {membership.payment.status}
                          </span>
                        </div>

                        {/* Payment Method */}
                        <div>
                          <p className="text-sm text-[#71839d]">
                            Payment Method
                          </p>

                          <p className="mt-2 text-[18px] font-bold text-[#13213b]">
                            {membership.payment.paymentMethod}
                          </p>
                        </div>

                        {/* Payment Date */}
                        <div>
                          <p className="text-sm text-[#71839d]">
                            Payment Date
                          </p>

                          <p className="mt-2 text-[18px] font-bold text-[#13213b]">
                            {formatDate(
                              membership.payment.paymentDate
                            )}
                          </p>
                        </div>

                        {/* Amount */}
                        <div>
                          <p className="text-sm text-[#71839d]">
                            Amount
                          </p>

                          <p className="mt-2 text-[18px] font-bold text-[#13213b]">
                            ₹{membership.payment.amount}
                          </p>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}

          </div>
        )}
      </section>

    </div>
  )
}

export default Membership