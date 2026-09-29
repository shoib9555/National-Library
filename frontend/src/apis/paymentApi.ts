import apiClient from "./client"

export interface PaymentMembership {
  id: number
  startDate: string
  expiryDate: string
}

export interface PaymentStudent {
  studentCode: string
  name: string
}

export interface Payment {
  id: number
  studentId: number
  amount: number
  paymentMethod: string
  paymentDate: string
  status: string
  transactionReference: string
  student: PaymentStudent
  membership: PaymentMembership | null
}

export interface PaymentsResponse {
  payments: Payment[]
}

export const getAllPayments = async (): Promise<PaymentsResponse> => {
  const response = await apiClient.get<PaymentsResponse>("/payments")
  return response.data
}

export const getMyPayments = async (): Promise<PaymentsResponse> => {
  const response = await apiClient.get<PaymentsResponse>(
    "/payments/me"
  )

  return response.data
}

export const getPaymentReceipt = async (
  paymentId: number
): Promise<Blob> => {
  const response = await apiClient.get(
    `/payments/${paymentId}/receipt`,
    {
      responseType: "blob",
    }
  )

  return response.data
}

// ==================== CASH PAYMENT ====================

export interface RecordCashPaymentRequest {
  studentCode: string
  membershipId: number
}

export interface RecordCashPaymentResponse {
  message: string
  payment: Payment
}

export const recordCashPayment = async (
  data: RecordCashPaymentRequest
): Promise<RecordCashPaymentResponse> => {
  const response = await apiClient.post<RecordCashPaymentResponse>(
    "/payments/cash",
    data
  )

  return response.data
}

// ==================== UPI PAYMENT ====================

export interface RecordUpiPaymentRequest {
  studentCode: string
  membershipId: number
  transactionReference: string
}

export interface RecordUpiPaymentResponse {
  message: string
  payment: Payment
}

export const recordUpiPayment = async (
  data: RecordUpiPaymentRequest
): Promise<RecordUpiPaymentResponse> => {
  const response = await apiClient.post<RecordUpiPaymentResponse>(
    "/payments/upi",
    data
  )

  return response.data
}