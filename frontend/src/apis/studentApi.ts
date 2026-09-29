import apiClient from "./client"


export interface Student {
  id: number
  studentCode: string
  name: string
  profilePhotoUrl?: string | null
  phone: string
  email: string
  otp?: string
  status?: "ACTIVE" | "INACTIVE"
  joiningDate?: string
}

export interface StudentsResponse {
  message: string
  students: Student[]
}

export interface CreateStudentRequest {
  name: string
  phone: string
  email: string
  aadhaarNumber: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  joiningDate: string
}

export interface CreateStudentResponse {
  message: string
  student: Student
  otp?: string
}

export const getStudents = async (): Promise<StudentsResponse> => {
  const response = await apiClient.get<StudentsResponse>("/students")

  return response.data
}

export const createStudent = async (
  data: CreateStudentRequest
): Promise<CreateStudentResponse> => {
  const response = await apiClient.post<CreateStudentResponse>(
    "/students",
    data
  )

  return response.data
}

export interface VerifyStudentOtpRequest {
  studentCode: string
  otp: string
}

export interface VerifyStudentOtpResponse {
  message: string
  setupToken: string
}

export const verifyStudentOtp = async (
  data: VerifyStudentOtpRequest
): Promise<VerifyStudentOtpResponse> => {
  const response = await apiClient.post<VerifyStudentOtpResponse>(
    "/students/verify-otp",
    data
  )

  return response.data
}

export interface StudentDetailsResponse {
  message: string
  student: Student
}

export const getStudentByCode = async (
  studentCode: string
): Promise<StudentDetailsResponse> => {
  const response = await apiClient.get<StudentDetailsResponse>(
    `/students/${studentCode}`
  )

  return response.data
}

export interface MyStudentProfileResponse {
  message: string
  student: {
    id: number
    studentCode: string
    name: string
    profilePhotoUrl?: string | null
    phone: string
    email: string
    aadhaarNumber: string
    address: string
    emergencyContactName: string
    emergencyContactPhone: string
    joiningDate: string
    status: "ACTIVE" | "INACTIVE"
    seatNumber: number | null
    seatStatus: string | null
  }
}

export const getMyStudentProfile =
  async (): Promise<MyStudentProfileResponse> => {
    const response = await apiClient.get<MyStudentProfileResponse>(
      "/students/me"
    )

    return response.data
  }

export interface UpdateStudentRequest {
  name?: string
  phone?: string
  email?: string
  aadhaarNumber?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  joiningDate?: string
}

export interface UpdateStudentResponse {
  message: string
  student: Student
}

export const updateStudent = async (
  studentCode: string,
  data: UpdateStudentRequest
): Promise<UpdateStudentResponse> => {
  const response = await apiClient.put<UpdateStudentResponse>(
    `/students/${studentCode}`,
    data
  )

  return response.data
}

export interface DeactivateStudentRequest {
  studentCode: string
}

export interface DeactivateStudentResponse {
  message: string
}

export const deactivateStudent = async (
  data: DeactivateStudentRequest
): Promise<DeactivateStudentResponse> => {
  const response = await apiClient.post<DeactivateStudentResponse>(
    "/students/deactivate",
    data
  )

  return response.data
}

export async function uploadStudentProfilePhoto(
  file: File
): Promise<Student> {
  const formData = new FormData()

  formData.append("profilePhoto", file, file.name)

  const response = await apiClient.post<{
    message: string
    student: Student
  }>("/students/me/profile-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data.student
}

export interface ActivateStudentRequest {
  studentCode: string
}

export interface ActivateStudentResponse {
  message: string
  student: Student
}

export const activateStudent = async (
  data: ActivateStudentRequest
): Promise<ActivateStudentResponse> => {
  const response = await apiClient.post<ActivateStudentResponse>(
    "/students/activate",
    data
  )

  return response.data
}