import apiClient from "./client"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    role: "LIBRARIAN" | "STUDENT"
  }
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", data)

  return response.data
}

export interface CurrentUserResponse {
  message: string
  user: {
    id: number
    email: string
    role: "LIBRARIAN" | "STUDENT"
    status: string
    profilePhotoUrl?: string | null
  }
}

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await apiClient.get<CurrentUserResponse>("/auth/me")

  return response.data
}

export interface SetPasswordRequest {
  setupToken: string
  password: string
}

export interface SetPasswordResponse {
  message: string
}

export const setPassword = async (
  data: SetPasswordRequest
): Promise<SetPasswordResponse> => {
  const response = await apiClient.post<SetPasswordResponse>(
    "/auth/set-password",
    data
  )

  return response.data
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}): Promise<string> {
  const response = await apiClient.patch<{ message: string }>(
    "/auth/change-password",
    data,
  )

  return response.data.message
}