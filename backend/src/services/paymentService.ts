import prisma from "../lib/prisma"

import { createPaymentSuccessNotification } from "./notificationService"

// ======================================================
// RECORD CASH PAYMENT
// ======================================================

export async function recordCashPayment(
  studentCode: string,
  membershipId: number,
) {
  const student = await prisma.student.findUnique({
    where: {
      studentCode,
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  if (student.status !== "ACTIVE") {
    throw new Error("Student is not active")
  }

  const membership = await prisma.membership.findUnique({
    where: {
      id: membershipId,
    },
  })

  if (!membership) {
    throw new Error("Membership not found")
  }

  if (membership.studentId !== student.id) {
    throw new Error("Membership does not belong to this student")
  }

  if (membership.paymentId !== null) {
    throw new Error("This membership is already paid")
  }

  if (membership.monthlyFee.toString() !== "800") {
    throw new Error("Invalid membership fee")
  }

  const paymentDate = new Date()

  const transactionReference = `CASH-${Date.now()}`

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        studentId: student.id,
        amount: 800,
        paymentMethod: "CASH",
        paymentDate,
        status: "PAID",
        transactionReference,
      },
    })

    const updatedMembership = await tx.membership.update({
      where: {
        id: membership.id,
      },
      data: {
        paymentId: payment.id,
      },
    })

    return {
      payment,
      membership: updatedMembership,
    }
  })

  await createPaymentSuccessNotification(
    result.payment.studentId,
    membershipId,
    Number(result.payment.amount),
  )

  return {
    paymentId: result.payment.id,
    studentCode: student.studentCode,
    amount: result.payment.amount,
    paymentMethod: result.payment.paymentMethod,
    paymentDate: result.payment.paymentDate,
    status: result.payment.status,
    transactionReference: result.payment.transactionReference,
    membershipId: result.membership.id,
  }
}

// ======================================================
// RECORD UPI PAYMENT
// ======================================================

export async function recordUpiPayment(
  studentCode: string,
  membershipId: number,
  transactionReference: string,
) {
  const student = await prisma.student.findUnique({
    where: {
      studentCode,
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  if (student.status !== "ACTIVE") {
    throw new Error("Student is not active")
  }

  const membership = await prisma.membership.findUnique({
    where: {
      id: membershipId,
    },
  })

  if (!membership) {
    throw new Error("Membership not found")
  }

  if (membership.studentId !== student.id) {
    throw new Error("Membership does not belong to this student")
  }

  if (membership.paymentId !== null) {
    throw new Error("This membership is already paid")
  }

  if (membership.monthlyFee.toString() !== "800") {
    throw new Error("Invalid membership fee")
  }

  if (!transactionReference.trim()) {
    throw new Error("Transaction reference is required")
  }

  const paymentDate = new Date()

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        studentId: student.id,
        amount: 800,
        paymentMethod: "UPI",
        paymentDate,
        status: "PAID",
        transactionReference: transactionReference.trim(),
      },
    })

    const updatedMembership = await tx.membership.update({
      where: {
        id: membership.id,
      },
      data: {
        paymentId: payment.id,
      },
    })

    return {
      payment,
      membership: updatedMembership,
    }
  })

  await createPaymentSuccessNotification(
    result.payment.studentId,
    membershipId,
    Number(result.payment.amount),
  )

  return {
    paymentId: result.payment.id,
    studentCode: student.studentCode,
    amount: result.payment.amount,
    paymentMethod: result.payment.paymentMethod,
    paymentDate: result.payment.paymentDate,
    status: result.payment.status,
    transactionReference: result.payment.transactionReference,
    membershipId: result.membership.id,
  }
}

// ======================================================
// GET ALL PAYMENTS
// LIBRARIAN
// ======================================================

export async function getAllPayments() {
  const payments = await prisma.payment.findMany({
    orderBy: {
      paymentDate: "desc",
    },
    include: {
      student: {
        select: {
          studentCode: true,
          name: true,
        },
      },
      membership: {
        select: {
          id: true,
          startDate: true,
          expiryDate: true,
        },
      },
    },
  })

  return payments
}

// ======================================================
// GET MY PAYMENTS
// STUDENT
// ======================================================

export async function getMyPayments(userId: number) {
  const student = await prisma.student.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      studentCode: true,
    },
  })

  if (!student) {
    throw new Error("Student profile not found")
  }

  const payments = await prisma.payment.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: {
      paymentDate: "desc",
    },
    include: {
      membership: {
        select: {
          id: true,
          startDate: true,
          expiryDate: true,
        },
      },
    },
  })

  return payments
}