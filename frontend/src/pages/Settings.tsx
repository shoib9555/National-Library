import apiClient from "../apis/client"
import { useEffect, useState } from "react"


function Settings() {
  const [apiStatus, setApiStatus] = useState<"ONLINE" | "OFFLINE">("OFFLINE")
  const [checkingApi, setCheckingApi] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    setPasswordMessage("")
    setPasswordError("")

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long")
      return
    }

    try {
      setChangingPassword(true)

      const response = await apiClient.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      })

      setPasswordMessage(response.data.message)
      setTimeout(() => {
        setShowPasswordModal(false)
      }, 1000)

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setPasswordError(
        error?.response?.data?.message || "Failed to change password"
      )
    } finally {
      setChangingPassword(false)
    }
  }

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/")

        if (response.ok) {
          setApiStatus("ONLINE")
        } else {
          setApiStatus("OFFLINE")
        }
      } catch {
        setApiStatus("OFFLINE")
      } finally {
        setCheckingApi(false)
      }
    }

    checkApiStatus()
  }, [])
  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage National Library account and system information.
        </p>
      </div>

      {/* Librarian Account */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Librarian Account
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Information about the current librarian account.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Role
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              Librarian / Admin
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Account Status
            </p>

            <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your librarian account password.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Change Password
          </button>
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

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Library Name
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900">
              National Library
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Seats
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              70
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Floors
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              1
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Operating Hours
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              24 × 7
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Weekly Holidays
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            None
          </p>
        </div>
      </div>

      {/* System Information */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            System Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Basic application and backend information.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-3">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Application
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              National Library Management System
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Portal
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              Librarian Portal
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              API Status
            </p>

            <div className="mt-2">
              {checkingApi ? (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  CHECKING...
                </span>
              ) : apiStatus === "ONLINE" ? (
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  ONLINE
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  OFFLINE
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your current and new password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-2xl text-slate-400 transition hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
                  {passwordMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  )
}

export default Settings