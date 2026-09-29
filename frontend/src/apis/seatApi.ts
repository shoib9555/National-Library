import apiClient from "./client"

export interface SeatStudent {
  id: number
  studentCode: string
  name: string
  phone: string
  email: string
}

export interface Seat {
  id: number
  seatNumber: number
  status: "AVAILABLE" | "OCCUPIED"
  student: SeatStudent | null
  createdAt: string
  updatedAt: string
}

export interface SeatsResponse {
  message: string
  seats: Seat[]
}

export interface AssignSeatRequest {
  studentCode: string
  seatNumber: number
}

export interface ChangeSeatRequest {
  studentCode: string
  newSeatNumber: number
}

export interface SeatActionResponse {
  message: string
  seat: Seat
}

export const getSeats = async (): Promise<SeatsResponse> => {
  const response = await apiClient.get<SeatsResponse>("/seats")
  return response.data
}

export const assignSeat = async (
  data: AssignSeatRequest
): Promise<SeatActionResponse> => {
  const response = await apiClient.post<SeatActionResponse>(
    "/seats/assign",
    data
  )

  return response.data
}

export const changeSeat = async (
  data: ChangeSeatRequest
): Promise<SeatActionResponse> => {
  const response = await apiClient.post<SeatActionResponse>(
    "/seats/change",
    data
  )

  return response.data
}