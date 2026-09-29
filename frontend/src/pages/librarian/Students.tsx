import { useEffect, useMemo, useState } from "react"
import {
  getStudents,
  createStudent,
  verifyStudentOtp,
  getStudentByCode,
  updateStudent,
  deactivateStudent,
  activateStudent,
} from "../../apis/studentApi"

import type { Student } from "../../apis/studentApi"
import { setPassword } from "../../apis/authApi"

function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [otpStudentCode, setOtpStudentCode] = useState("")
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [otp, setOtp] = useState("")
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [setupToken, setSetupToken] = useState("")
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [password, setPasswordValue] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [settingPassword, setSettingPassword] = useState(false)
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false)
  const [studentDetailsError, setStudentDetailsError] = useState("")
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [updatingStudent, setUpdatingStudent] = useState(false)
  const [editStudentError, setEditStudentError] = useState("")
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)
  const [studentToDeactivate, setStudentToDeactivate] =
    useState<Student | null>(null)
  const [deactivatingStudent, setDeactivatingStudent] = useState(false)
  const [deactivateError, setDeactivateError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    aadhaarNumber: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    joiningDate: "",
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    email: "",
    aadhaarNumber: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    joiningDate: "",
  })

  const [creatingStudent, setCreatingStudent] = useState(false)
  const [formError, setFormError] = useState("")

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleCreateStudent = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setFormError("")
    setCreatingStudent(true)

    try {
      const response = await createStudent({
        ...formData,
        joiningDate: new Date(formData.joiningDate).toISOString(),
      })
      console.log("CREATE STUDENT RESPONSE:", response)

      setIsAddStudentOpen(false)

      setOtpStudentCode(response.student.studentCode)
      setGeneratedOtp(response.student.otp ?? "")
      setOtp("")
      setOtpError("")
      setIsOtpModalOpen(true)

      setFormData({
        name: "",
        phone: "",
        email: "",
        aadhaarNumber: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        joiningDate: "",
      })

      const data = await getStudents()
      setStudents(data.students)
    } catch (error) {
      console.error("Failed to create student:", error)
      setFormError("Failed to create student")
    } finally {
      setCreatingStudent(false)
    }
  }

  const handleVerifyOtp = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setOtpError("")
    setVerifyingOtp(true)

    try {
      const response = await verifyStudentOtp({
        studentCode: otpStudentCode,
        otp,
      })

      setSetupToken(response.setupToken)
      setIsOtpModalOpen(false)
      setOtp("")
      setOtpStudentCode("")
      setGeneratedOtp("")

      setPasswordError("")
      setPasswordValue("")
      setConfirmPassword("")
      setIsPasswordModalOpen(true)

      const data = await getStudents()
      setStudents(data.students)
    } catch (error) {
      console.error("OTP verification failed:", error)
      setOtpError("Invalid or expired OTP")
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleSetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setPasswordError("")

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setSettingPassword(true)

    try {
     await setPassword({
        setupToken,
        password,
      })


      setIsPasswordModalOpen(false)

      setSetupToken("")
      setPasswordValue("")
      setConfirmPassword("")

      const data = await getStudents()
      setStudents(data.students)
    } catch (error) {
      console.error("Failed to set password:", error)
      setPasswordError("Failed to set password")
    } finally {
      setSettingPassword(false)
    }
  }

  const handleViewStudent = async (studentCode: string) => {
    setStudentDetailsError("")
    setLoadingStudentDetails(true)
    setIsStudentDetailsOpen(true)

    try {
      const response = await getStudentByCode(studentCode)

      setSelectedStudent(response.student)
    } catch (error) {
      console.error("Failed to fetch student details:", error)
      setStudentDetailsError("Failed to load student details")
    } finally {
      setLoadingStudentDetails(false)
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditStudentError("")
    setEditingStudent(student)

    setEditFormData({
      name: student.name,
      phone: student.phone,
      email: student.email,
      aadhaarNumber: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      joiningDate: student.joiningDate
        ? new Date(student.joiningDate).toISOString().slice(0, 16)
        : "",
    })

    setIsEditStudentOpen(true)
  }

  const handleOpenDeactivate = (student: Student) => {
    setDeactivateError("")
    setStudentToDeactivate(student)
    setIsDeactivateOpen(true)
  }

  const handleDeactivateStudent = async () => {
    if (!studentToDeactivate) {
      return
    }

    setDeactivateError("")
    setDeactivatingStudent(true)

    try {
      await deactivateStudent({
        studentCode: studentToDeactivate.studentCode,
      })

      setIsDeactivateOpen(false)
      setStudentToDeactivate(null)

      const data = await getStudents()
      setStudents(data.students)
    } catch (error) {
      console.error("Failed to deactivate student:", error)
      setDeactivateError("Failed to deactivate student")
    } finally {
      setDeactivatingStudent(false)
    }
  }

  const handleActivateStudent = async (student: Student) => {
    try {
      await activateStudent({
        studentCode: student.studentCode,
      })

      const data = await getStudents()
      setStudents(data.students)
    } catch (error) {
      console.error("Failed to activate student:", error)
      setError("Failed to activate student")
    }
  }

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setEditFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleUpdateStudent = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!editingStudent) {
      return
    }

    setEditStudentError("")
    setUpdatingStudent(true)

    try {
      await updateStudent(editingStudent.studentCode, {
        ...editFormData,
        joiningDate: editFormData.joiningDate
          ? new Date(editFormData.joiningDate).toISOString()
          : undefined,
      })

      setIsEditStudentOpen(false)
      setEditingStudent(null)

      const data = await getStudents()
      setStudents(data.students)
    } catch (error) {
      console.error("Failed to update student:", error)
      setEditStudentError("Failed to update student")
    } finally {
      setUpdatingStudent(false)
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const query = searchQuery.toLowerCase().trim()

      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.studentCode.toLowerCase().includes(query) ||
        student.phone.includes(query) ||
        student.email.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === "ALL" ||
        student.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [students, searchQuery, statusFilter])

 

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getStudents()

        setStudents(data.students)
      } catch (error) {
        console.error("Failed to fetch students:", error)
        setError("Failed to load students")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

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
          Students
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Students
          </h1>

          <p className="mt-2 text-base text-slate-500">
            Manage student accounts, access and library membership.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddStudentOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10284a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b1e38] hover:shadow-md"
        >
          <span className="text-xl leading-none">
            +
          </span>

          Add Student
        </button>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">


      </div>

      {/* Students Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Card Header */}
        <div className="border-b border-slate-200 px-6 py-5">

          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <svg
                  className="h-6 w-6 text-blue-600"
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
                    d="M22 21v-2a4 4 0 00-3-3.87"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  All Students
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search, filter and manage registered students.
                </p>
              </div>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* Search */}
              <div className="relative">

                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                  />
                </svg>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, code, phone or email..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:w-80"
                />

              </div>

              {/* Filter */}
              <div className="relative">

                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M4 5h16M7 12h10M10 19h4"
                  />
                </svg>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:w-40"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                <svg
                  className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 9l6 6 6-6"
                  />
                </svg>

              </div>

            </div>

          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-72 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              Loading students...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] table-fixed">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">

                  <th className="w-16 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    #
                  </th>

                  <th className="w-[300px] px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Student
                  </th>

                  <th className="w-[280px] px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="w-[150px] px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="w-[150px] px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Joined On
                  </th>

                  <th className="w-[340px] px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredStudents.map((student, index) => {

                  const isActive = student.status === "ACTIVE"

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/70"
                    >

                      {/* Number */}
                      <td className="px-6 py-5 text-sm font-medium text-slate-600">
                        {index + 1}
                      </td>

                      {/* Student */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                            {student.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="whitespace-nowrap font-semibold text-slate-900">
                              {student.name}
                            </p>

                            <p className="mt-1 text-xs font-medium text-slate-500">
                              {student.studentCode}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <p className="whitespace-nowrap text-sm font-medium text-slate-700">
                          {student.phone}
                        </p>

                        <p className="mt-1 max-w-[240px] truncate text-xs text-slate-500">
                          {student.email}
                        </p>

                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">

                        <span
                          className={
                            isActive
                              ? "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                              : "inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                          }
                        >
                          <span
                            className={
                              isActive
                                ? "h-2 w-2 rounded-full bg-emerald-500"
                                : "h-2 w-2 rounded-full bg-red-500"
                            }
                          />

                          {isActive ? "Active" : "Inactive"}
                        </span>

                      </td>

                      {/* Joining Date */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {student.joiningDate
                          ? new Date(
                            student.joiningDate
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">

                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">

                          {/* View */}
                          <button
                            type="button"
                            onClick={() =>
                              handleViewStudent(student.studentCode)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
                              />

                              <circle
                                cx="12"
                                cy="12"
                                r="2.5"
                                strokeWidth="1.8"
                              />
                            </svg>

                            View
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleEditStudent(student)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M12 20h9"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M16.5 3.5a2.12 2.12 0 013 3L8 18l-4 1 1-4L16.5 3.5z"
                              />
                            </svg>

                            Edit
                          </button>

                          {/* Deactivate */}
                          {isActive && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenDeactivate(student)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.8"
                                  d="M6 6l12 12M18 6L6 18"
                                />
                              </svg>

                              Deactivate
                            </button>
                          )}

                        </div>

                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleActivateStudent(student)}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-600 transition hover:border-emerald-200 hover:bg-emerald-100"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M5 12l4 4L19 6"
                              />
                            </svg>

                            Activate
                          </button>
                        )}

                      </td>

                    </tr>
                  )
                })}

              </tbody>

            </table>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <svg
                    className="h-6 w-6 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                    />
                  </svg>
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  No students found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or status filter.
                </p>

              </div>
            )}

          </div>
        )}

        {/* Footer */}
        {!loading && !error && filteredStudents.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5">

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredStudents.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {students.length}
              </span>{" "}
              students
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ←
              </button>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm"
              >
                {currentPage}
              </button>

              <button
                type="button"
                disabled
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 opacity-40"
              >
                →
              </button>

            </div>

          </div>
        )}

      </div>
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">

            {/* Header */}
            <div className="px-8 pt-7 pb-5 border-b border-gray-200">
              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">
                  {/* Student Icon */}
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-blue-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Add Student
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Create a new National Library student account.
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateStudent}>

              <div className="px-8 py-7">

                {/* Error */}
                {formError && (
                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                {/* Two Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter student name"
                      required
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      Minimum 2 characters
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit phone number"
                      required
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      Must be a valid Indian phone number
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter student email"
                      required
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      Must be a valid email address
                    </p>
                  </div>

                  {/* Aadhaar */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Aadhaar / ID Proof
                    </label>

                    <input
                      type="text"
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={handleInputChange}
                      placeholder="Enter Aadhaar / ID proof"
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      Optional
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter full address"
                      required
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none resize-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      Minimum 5 characters
                    </p>
                  </div>

                  {/* Emergency Contact Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Emergency Contact Name
                    </label>

                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      placeholder="Enter emergency contact name"

                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      Optional
                    </p>
                  </div>

                  {/* Emergency Contact Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Emergency Contact Phone
                    </label>

                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit phone number"

                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      Optional
                    </p>
                  </div>

                  {/* Joining Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Joining Date <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="datetime-local"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      Select date and time
                    </p>
                  </div>

                </div>

                {/* Information Box */}
                <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
                  <div className="flex gap-3">

                    <svg
                      className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.5 8.5 0 100-17 8.5 8.5 0 000 17z"
                      />
                    </svg>

                    <div>
                      <p className="font-semibold text-blue-900">
                        After creating the student:
                      </p>

                      <ul className="mt-2 text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>
                          A student code will be generated automatically
                        </li>
                        <li>
                        A verification OTP will be generated for the student.
                        </li>
                      </ul>
                    </div>

                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingStudent}
                  className="px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {creatingStudent ? (
                    "Creating..."
                  ) : (
                    <>
                      <span className="text-lg">+</span>
                      Create Student
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-slate-900">
                Verify Student
              </h2>

              <p className="text-sm text-gray-500">
                Enter the 6-digit OTP generated for this student.
              </p>

              {generatedOtp && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                    Generated OTP
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-[0.4em] text-blue-700">
                    {generatedOtp}
                  </p>

                  <p className="mt-2 text-xs text-blue-600">
                    Share this OTP with the student.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div className="p-6">

                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 mb-5">
                  <p className="text-sm text-gray-500">
                    Student Code
                  </p>

                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {otpStudentCode}
                  </p>
                </div>

                {otpError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {otpError}
                  </div>
                )}

                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  OTP
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 text-center text-xl tracking-[0.4em] font-semibold outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Use the 6-digit OTP shown above to verify the student.
                </p>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {verifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-gray-200">
              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h-3a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-5"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Set Student Password
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Create the student's login password.
                  </p>
                </div>

              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSetPassword}>

              <div className="p-6">

                {/* Success message */}
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <p className="text-sm font-semibold text-green-800">
                    OTP verified successfully
                  </p>

                  <p className="text-xs text-green-700 mt-1">
                    The student account is ready for password setup.
                  </p>
                </div>

                {/* Error */}
                {passwordError && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {passwordError}
                  </div>
                )}

                {/* Password */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    placeholder="Enter password"
                    required
                    minLength={6}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    Use at least 6 characters.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    minLength={6}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={settingPassword}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {settingPassword ? "Setting Password..." : "Set Password"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {isStudentDetailsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Student Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Complete student information
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsStudentDetailsOpen(false)
                  setSelectedStudent(null)
                  setStudentDetailsError("")
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6">

              {loadingStudentDetails && (
                <div className="py-10 text-center text-gray-500">
                  Loading student details...
                </div>
              )}

              {studentDetailsError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {studentDetailsError}
                </div>
              )}

              {!loadingStudentDetails &&
                !studentDetailsError &&
                selectedStudent && (
                  <div className="space-y-6">

                    {/* Student Identity */}
                    <div className="rounded-xl bg-slate-50 border border-gray-200 p-5">
                      <div className="flex items-center gap-4">

                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xl font-bold text-blue-700">
                            {selectedStudent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {selectedStudent.name}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {selectedStudent.studentCode}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Student Code
                        </p>
                        <p className="mt-1 font-medium text-gray-900">
                          {selectedStudent.studentCode}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Status
                        </p>
                        <p className="mt-1 font-medium text-gray-900">
                          {selectedStudent.status ?? "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Phone
                        </p>
                        <p className="mt-1 font-medium text-gray-900">
                          {selectedStudent.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Email
                        </p>
                        <p className="mt-1 font-medium text-gray-900">
                          {selectedStudent.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Joining Date
                        </p>
                        <p className="mt-1 font-medium text-gray-900">
                          {selectedStudent.joiningDate
                            ? new Date(
                              selectedStudent.joiningDate
                            ).toLocaleString()
                            : "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Student ID
                        </p>
                        <p className="mt-1 font-medium text-gray-900">
                          {selectedStudent.id}
                        </p>
                      </div>

                    </div>

                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsStudentDetailsOpen(false)
                  setSelectedStudent(null)
                  setStudentDetailsError("")
                }}
                className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {isEditStudentOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">

            {/* Header */}
            <div className="px-8 pt-7 pb-5 border-b border-gray-200">
              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Edit Student
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Update the student's information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditStudentOpen(false)
                    setEditingStudent(null)
                    setEditStudentError("")
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                >
                  ✕
                </button>

              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateStudent}>

              <div className="px-8 py-7">

                {editStudentError && (
                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {editStudentError}
                  </div>
                )}

                {/* Student Code */}
                {editingStudent && (
                  <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Student Code
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {editingStudent.studentCode}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Student code cannot be changed.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      required
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditInputChange}
                      required
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                      required
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Aadhaar */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Aadhaar / ID Proof
                    </label>

                    <input
                      type="text"
                      name="aadhaarNumber"
                      value={editFormData.aadhaarNumber}
                      onChange={handleEditInputChange}
                      placeholder="Enter ID proof"
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditInputChange}
                      placeholder="Enter address"
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none resize-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Emergency Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Emergency Contact Name
                    </label>

                    <input
                      type="text"
                      name="emergencyContactName"
                      value={editFormData.emergencyContactName}
                      onChange={handleEditInputChange}
                      placeholder="Enter emergency contact name"
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Emergency Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Emergency Contact Phone
                    </label>

                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={editFormData.emergencyContactPhone}
                      onChange={handleEditInputChange}
                      placeholder="Enter emergency contact phone"
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 placeholder-gray-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Joining Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Joining Date
                    </label>

                    <input
                      type="datetime-local"
                      name="joiningDate"
                      value={editFormData.joiningDate}
                      onChange={handleEditInputChange}
                      className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-800 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                </div>

              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setIsEditStudentOpen(false)
                    setEditingStudent(null)
                    setEditStudentError("")
                  }}
                  className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingStudent}
                  className="px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {updatingStudent ? "Saving..." : "Save Changes"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {isDeactivateOpen && studentToDeactivate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            {/* Header */}
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3.5m0 3h.01M10.29 3.86l-7.1 12.28A2 2 0 004.92 19h14.16a2 2 0 001.73-2.86l-7.1-12.28a2 2 0 00-3.42 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Deactivate Student
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    This action will deactivate the student account.
                  </p>
                </div>

              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-6">

              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  Are you sure you want to deactivate:
                </p>

                <p className="mt-2 font-bold text-red-900">
                  {studentToDeactivate.name}
                </p>

                <p className="text-sm text-red-700 mt-1">
                  Student Code: {studentToDeactivate.studentCode}
                </p>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                The student will no longer be able to use their active
                account until reactivated through the appropriate process.
              </p>

              {deactivateError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {deactivateError}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setIsDeactivateOpen(false)
                  setStudentToDeactivate(null)
                  setDeactivateError("")
                }}
                disabled={deactivatingStudent}
                className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-100 disabled:opacity-60 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeactivateStudent}
                disabled={deactivatingStudent}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {deactivatingStudent ? "Deactivating..." : "Deactivate Student"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>

  )
}

export default Students
