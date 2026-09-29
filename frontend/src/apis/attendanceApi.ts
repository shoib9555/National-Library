import apiClient from "./client"

export interface Attendance {
  attendanceId: number
  studentCode: string
  studentName: string
  entryTime: string
  exitTime: string | null
  durationMinutes: number | null
}

export interface AttendanceResponse {
  message: string
  attendance: Attendance[]
}

export interface AttendanceActionResponse {
  message: string
  attendance: {
    attendanceId: number
    studentCode: string
    entryTime: string
    exitTime: string | null
    durationMinutes: number | null
  }
}

export const markEntry = async (): Promise<AttendanceActionResponse> => {
  const response = await apiClient.post<AttendanceActionResponse>(
    "/attendance/entry"
  )

  return response.data
}

export const markExit = async (): Promise<AttendanceActionResponse> => {
  const response = await apiClient.post<AttendanceActionResponse>(
    "/attendance/exit"
  )

  return response.data
}

export const getMyAttendance = async (): Promise<AttendanceResponse> => {
  const response = await apiClient.get<AttendanceResponse>(
    "/attendance/me"
  )

  return response.data
}

export const getAllAttendance = async (): Promise<AttendanceResponse> => {
  const response = await apiClient.get<AttendanceResponse>(
    "/attendance"
  )

  return response.data
}