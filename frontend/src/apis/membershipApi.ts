import apiClient from "./client"

export type MembershipStatus =
  | "UPCOMING"
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED"

export interface MembershipPayment {
  paymentId: number
  amount: number
  paymentMethod: string
  paymentDate: string
  status: string
  transactionReference: string
}

export interface Membership {
  membershipId: number
  studentCode: string
  studentName: string
  startDate: string
  expiryDate: string
  monthlyFee: number
  status: MembershipStatus
  payment: MembershipPayment | null
}

export interface MembershipsResponse {
  memberships: Membership[]
}

export interface CreateMembershipRequest {
  studentCode: string
  startDate: string
}

export interface CreateMembershipResponse {
  message: string
  membership: {
    id: number
    studentCode: string
    startDate: string
    expiryDate: string
    monthlyFee: number
    status: MembershipStatus
  }
}

export interface RenewMembershipRequest {
  studentCode: string
  paymentDate: string
}

export interface RenewMembershipResponse {
  message: string
  membershipId: number
  paymentId: number
  studentCode: string
  amount: number
  paymentMethod: string
  paymentDate: string
  startDate: string
  expiryDate: string
  status: MembershipStatus
  transactionReference: string
}

export const getAllMemberships =
  async (): Promise<MembershipsResponse> => {
    const response = await apiClient.get<MembershipsResponse>(
      "/memberships"
    )

    return response.data
  }

export const createMembership = async (
  data: CreateMembershipRequest
): Promise<CreateMembershipResponse> => {
  const response = await apiClient.post<CreateMembershipResponse>(
    "/memberships",
    data
  )

  return response.data
}

export const renewMembership = async (
  data: RenewMembershipRequest
): Promise<RenewMembershipResponse> => {
  const response = await apiClient.post<RenewMembershipResponse>(
    "/memberships/renew",
    data
  )

  return response.data
}

export const updateMembershipStatuses = async (): Promise<{
  message: string
  updatedCount: number
}> => {
  const response = await apiClient.post<{
    message: string
    updatedCount: number
  }>("/memberships/update-statuses")

  return response.data
}

export interface MyMembershipPayment {
  paymentId: number
  amount: string
  paymentMethod: string
  paymentDate: string
  status: string
  transactionReference: string | null
}

export interface MyMembership {
  membershipId: number
  startDate: string
  expiryDate: string
  monthlyFee: string
  status: MembershipStatus
  payment: MyMembershipPayment | null
}

export interface MyMembershipsResponse {
  message: string
  memberships: MyMembership[]
}

export const getMyMemberships =
  async (): Promise<MyMembershipsResponse> => {
    const response = await apiClient.get<MyMembershipsResponse>(
      "/memberships/me"
    )

    return response.data
  }