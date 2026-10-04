import { useEffect, useState } from "react"
import {
  getMyStudentProfile,
  uploadStudentProfilePhoto,
  type MyStudentProfileResponse,
} from "../../apis/studentApi"

function Profile() {
  const [student, setStudent] =
    useState<MyStudentProfileResponse["student"] | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const handleProfilePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const updatedStudent = await uploadStudentProfilePhoto(file)

      setStudent((currentStudent) =>
        currentStudent
          ? {
            ...currentStudent,
            profilePhotoUrl: updatedStudent.profilePhotoUrl,
          }
          : currentStudent
      )

      window.dispatchEvent(new Event("student-profile-photo-updated"))
    } catch (error) {
      console.error("Failed to upload profile photo:", error)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyStudentProfile()
        setStudent(response.student)
      } catch (err) {
        console.error(err)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-84px)] items-center justify-center bg-[#f7faff]">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Loading profile...
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-full bg-[#f7faff] p-6 md:p-7">

      {/* =========================================================
          PROFILE HERO
      ========================================================= */}
      <section className="relative mb-5 min-h-[165px] overflow-hidden rounded-[18px] bg-gradient-to-r from-[#eaf5ff] via-[#edf7ff] to-[#dceeff] px-7 py-7">

        {/* Decorative library illustration */}
        <div className="pointer-events-none absolute bottom-0 right-[330px] hidden opacity-90 xl:block">

          {/* Books */}
          <div className="relative h-[105px] w-[250px]">

            <div className="absolute bottom-0 left-8 h-3 w-[205px] rounded-sm bg-[#274d91]" />

            <div className="absolute bottom-4 left-5 h-4 w-[215px] rounded-sm bg-[#5278b8]" />

            <div className="absolute bottom-9 left-10 h-4 w-[190px] rounded-sm bg-[#183b76]" />

            <div className="absolute bottom-14 left-4 h-4 w-[215px] rounded-sm bg-[#7598ce]" />

            <div className="absolute bottom-[74px] left-16 h-4 w-[170px] rounded-sm bg-[#294f92]" />

            {/* Book pages */}
            <div className="absolute bottom-1 right-0 h-[75px] w-[15px] rounded-r-md bg-[#f6f0df]" />

            {/* Plant */}
            <div className="absolute bottom-0 left-0 h-[70px] w-1.5 rotate-[8deg] rounded-full bg-emerald-500" />

            <div className="absolute bottom-12 left-[-5px] h-9 w-5 -rotate-[35deg] rounded-full bg-emerald-400" />

            <div className="absolute bottom-8 left-4 h-10 w-5 rotate-[35deg] rounded-full bg-emerald-500" />

            <div className="absolute bottom-[52px] left-[-10px] h-8 w-4 -rotate-[55deg] rounded-full bg-teal-400" />
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="text-[36px] font-bold tracking-[-1px] text-[#10203d]">
            My Profile
          </h1>

          <p className="mt-1.5 text-[18px] text-[#526987]">
            View your personal and library information.
          </p>
        </div>

        {/* Student Portal card */}
        <div className="absolute right-7 top-7 hidden w-[325px] rounded-2xl border border-white/70 bg-white/75 px-5 py-4 shadow-sm backdrop-blur-sm lg:flex lg:items-center gap-4">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#dcecff] text-[#1769d1]">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 7.5L12 4l8 3.5L12 11 4 7.5Z" />
              <path d="M7 9v5c2.5 2 7.5 2 10 0V9" />
              <path d="M20 8v5" />
            </svg>
          </div>

          <div>
            <p className="text-[16px] font-bold text-[#1769b5]">
              Student Portal
            </p>

            <p className="mt-1 text-[13px] leading-5 text-[#607694]">
              Your Journey to Knowledge
              <br />
              Starts Here
            </p>
          </div>
        </div>
      </section>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-blue-100 bg-blue-50">
            {student?.profilePhotoUrl ? (
              <img
                src={student.profilePhotoUrl}
                alt="Student profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-blue-600">
                {student?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Profile Photo
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your profile photo is displayed across the Student Portal.
            </p>

            <div className="mt-3">
              <label
                htmlFor="profile-photo"
                className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Change Photo
              </label>
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          PERSONAL INFORMATION
      ========================================================= */}
      <section className="mb-6 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.06)]">

        {/* Section Header */}
        <div className="flex flex-col gap-4 bg-gradient-to-r from-[#eef6ff] to-[#f7fbff] px-7 py-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#d9eaff] text-[#4285e5]">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="3" />
                <path d="M5 20c.8-3.7 3.2-5.5 7-5.5s6.2 1.8 7 5.5" />
              </svg>
            </div>

            <div>
              <h2 className="text-[24px] font-bold text-[#10203d]">
                Personal Information
              </h2>

              <p className="mt-0.5 text-[16px] text-[#647995]">
                Your basic details and registration information.
              </p>
            </div>
          </div>

          
        </div>

        {/* Personal Details */}
        <div className="px-7 py-6">

          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">

            {/* Name */}
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e4f3ff] text-[#3498db]">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="8" r="3" />
                  <path d="M5 20c.8-3.7 3.2-5.5 7-5.5s6.2 1.8 7 5.5" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-[16px] text-[#657995]">
                  Name
                </p>

                <p className="mt-1 text-[18px] font-bold text-[#13213b]">
                  {student.name}
                </p>
              </div>
            </div>

            {/* Student Code */}
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#eee7ff] text-[#7047d8]">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 5h16v14H4z" />
                  <path d="M8 9h8" />
                  <path d="M8 13h5" />
                </svg>
              </div>

              <div>
                <p className="text-[16px] text-[#657995]">
                  Student Code
                </p>

                <p className="mt-1 text-[18px] font-bold text-[#13213b]">
                  {student.studentCode}
                </p>
              </div>
            </div>

            {/* Aadhaar */}
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#dcf8e9] text-[#16a34a]">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="4" y="5" width="16" height="14" rx="2" />
                  <circle cx="9" cy="10" r="2" />
                  <path d="M13 9h4" />
                  <path d="M13 13h4" />
                  <path d="M7 15h3" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-[16px] text-[#657995]">
                  Aadhaar
                </p>

                <p className="mt-1 break-all text-[18px] font-bold text-[#13213b]">
                  {student.aadhaarNumber}
                </p>
              </div>
            </div>

            {/* Joining Date */}
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#fff0df] text-[#f97316]">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="4" y="5" width="16" height="15" rx="2" />
                  <path d="M8 3v4" />
                  <path d="M16 3v4" />
                  <path d="M4 10h16" />
                  <path d="M8 14h3" />
                </svg>
              </div>

              <div>
                <p className="text-[16px] text-[#657995]">
                  Joining Date
                </p>

                <p className="mt-1 text-[18px] font-bold text-[#13213b]">
                  {formatDate(student.joiningDate)}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          CONTACT INFORMATION
      ========================================================= */}
      <section className="mb-6 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.06)]">

        {/* Section Header */}
        <div className="flex flex-col gap-4 bg-gradient-to-r from-[#effbf6] to-[#f8fffc] px-7 py-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#d7f5e5] text-[#16a765]">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6.5 4.5l3 2-1.5 3-2-1a12 12 0 0 0 9.5 9.5l-1-2 3-1.5 2 3c.5.8.2 1.8-.5 2.2-1.2.7-2.7 1-4.2.6C9.5 18.8 5.2 14.5 3.7 8.2c-.4-1.5-.1-3 .6-4.2.4-.7 1.4-1 2.2-.5Z" />
              </svg>
            </div>

            <div>
              <h2 className="text-[24px] font-bold text-[#10203d]">
                Contact Information
              </h2>

              <p className="mt-0.5 text-[16px] text-[#647995]">
                Your contact details for communication.
              </p>
            </div>
          </div>

          
        </div>

        {/* Contact Details */}
        <div className="px-7 py-6">

          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">

            {/* Email */}
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#ffe4e8] text-[#ef3340]">
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

              <div className="min-w-0">
                <p className="text-[16px] text-[#657995]">
                  Email
                </p>

                <p className="mt-1 break-all text-[18px] font-bold text-[#13213b]">
                  {student.email}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e2f0ff] text-[#3795dc]">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6.5 4.5l3 2-1.5 3-2-1a12 12 0 0 0 9.5 9.5l-1-2 3-1.5 2 3c.5.8.2 1.8-.5 2.2-1.2.7-2.7 1-4.2.6C9.5 18.8 5.2 14.5 3.7 8.2c-.4-1.5-.1-3 .6-4.2.4-.7 1.4-1 2.2-.5Z" />
                </svg>
              </div>

              <div>
                <p className="text-[16px] text-[#657995]">
                  Phone
                </p>

                <p className="mt-1 text-[18px] font-bold text-[#13213b]">
                  {student.phone}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-5 md:col-span-2">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#eee7ff] text-[#7549dd]">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-[16px] text-[#657995]">
                  Address
                </p>

                <p className="mt-1 break-words text-[18px] font-bold text-[#13213b]">
                  {student.address}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          EMERGENCY CONTACT
      ========================================================= */}
      <section className="mb-6 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.06)]">

        <div className="flex items-center gap-4 bg-gradient-to-r from-[#fff4f4] to-[#fffafa] px-7 py-5">

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-500">
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
            <h2 className="text-[24px] font-bold text-[#10203d]">
              Emergency Contact
            </h2>

            <p className="mt-0.5 text-[16px] text-[#647995]">
              Emergency contact information.
            </p>
          </div>
        </div>

        <div className="px-7 py-6">
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">

            <div>
              <p className="text-[16px] text-[#657995]">
                Contact Name
              </p>

              <p className="mt-1 text-[18px] font-bold text-[#13213b]">
                {student.emergencyContactName}
              </p>
            </div>

            <div>
              <p className="text-[16px] text-[#657995]">
                Contact Phone
              </p>

              <p className="mt-1 text-[18px] font-bold text-[#13213b]">
                {student.emergencyContactPhone}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          LIBRARY INFORMATION
      ========================================================= */}
      <section className="mb-6 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_3px_15px_rgba(25,55,90,0.06)]">

        <div className="flex items-center gap-4 bg-gradient-to-r from-[#fff8eb] to-[#fffdf7] px-7 py-5">

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-500">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 19V5" />
              <path d="M4 5c4-2 8 2 12 0v14c-4 2-8-2-12 0" />
            </svg>
          </div>

          <div>
            <h2 className="text-[24px] font-bold text-[#10203d]">
              Library Information
            </h2>

            <p className="mt-0.5 text-[16px] text-[#647995]">
              Your National Library account information.
            </p>
          </div>
        </div>

        <div className="px-7 py-6">
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">

            <div>
              <p className="text-[16px] text-[#657995]">
                Account Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${student.status === "ACTIVE"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {student.status}
              </span>
            </div>

            <div>
              <p className="text-[16px] text-[#657995]">
                Student Code
              </p>

              <p className="mt-1 text-[18px] font-bold text-[#13213b]">
                {student.studentCode}
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}

export default Profile