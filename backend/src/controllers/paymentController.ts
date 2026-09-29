import { Request, Response } from "express"
import { AuthenticatedRequest } from "../middleware/authMiddleware"

import {
  recordCashPayment,
  recordUpiPayment,
  getAllPayments,
  getMyPayments,
} from "../services/paymentService"

import { studentCodeSchema } from "../validators/paymentValidator"

import { generatePaymentReceipt } from "../services/receiptService"

// ======================================================
// RECORD CASH PAYMENT
// ======================================================

export async function recordCashPaymentController(
  req: Request,
  res: Response
) {
  try {
    const validationResult = studentCodeSchema.safeParse({
      studentCode: req.body.studentCode,
    })

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      })
    }

    const membershipId = Number(req.body.membershipId)

    if (!Number.isInteger(membershipId) || membershipId <= 0) {
      return res.status(400).json({
        message: "membershipId must be a valid positive number",
      })
    }

    const { studentCode } = validationResult.data

    const payment = await recordCashPayment(
      studentCode,
      membershipId
    )

    return res.status(201).json({
      message: "Cash payment recorded successfully",
      payment,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

// ======================================================
// RECORD UPI PAYMENT
// ======================================================

export async function recordUpiPaymentController(
  req: Request,
  res: Response
) {
  try {
    const validationResult = studentCodeSchema.safeParse({
      studentCode: req.body.studentCode,
    })

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      })
    }

    const membershipId = Number(req.body.membershipId)

    const transactionReference = String(
      req.body.transactionReference ?? ""
    ).trim()

    if (!Number.isInteger(membershipId) || membershipId <= 0) {
      return res.status(400).json({
        message: "membershipId must be a valid positive number",
      })
    }

    if (!transactionReference) {
      return res.status(400).json({
        message: "transactionReference is required",
      })
    }

    const { studentCode } = validationResult.data

    const payment = await recordUpiPayment(
      studentCode,
      membershipId,
      transactionReference
    )

    return res.status(201).json({
      message: "UPI payment recorded successfully",
      payment,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

// ======================================================
// GET ALL PAYMENTS
// LIBRARIAN
// ======================================================

export async function getAllPaymentsController(
  req: Request,
  res: Response
) {
  try {
    const payments = await getAllPayments()

    return res.status(200).json({
      payments,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

// ======================================================
// GET MY PAYMENTS
// STUDENT
// ======================================================

export async function getMyPaymentsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    const payments = await getMyPayments(req.user.userId)

    return res.status(200).json({
      payments,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

// ======================================================
// GET PAYMENT RECEIPT
// ======================================================

export async function getPaymentReceiptController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    const paymentId = Number(req.params.paymentId)

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({
        message: "paymentId must be a valid positive number",
      })
    }

    // Students can access only their own receipts.
    if (req.user.role === "STUDENT") {
      const payments = await getMyPayments(req.user.userId)

      const ownsPayment = payments.some(
        (payment) => payment.id === paymentId
      )

      if (!ownsPayment) {
        return res.status(403).json({
          message: "You are not allowed to access this receipt",
        })
      }
    }

    const pdf = await generatePaymentReceipt(paymentId)

    res.setHeader("Content-Type", "application/pdf")

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="payment-receipt-${paymentId}.pdf"`
    )

    pdf.pipe(res)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}