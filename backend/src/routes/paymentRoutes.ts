import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../middleware/authMiddleware";

import {
  recordCashPaymentController,
  recordUpiPaymentController,
  getAllPaymentsController,
  getMyPaymentsController,
  getPaymentReceiptController,
} from "../controllers/paymentController";

const router = Router();

// ==================== CASH PAYMENT ====================

router.post(
  "/cash",
  authMiddleware,
  authorize("LIBRARIAN"),
  recordCashPaymentController,
);

// ==================== UPI PAYMENT ====================

router.post(
  "/upi",
  authMiddleware,
  authorize("LIBRARIAN"),
  recordUpiPaymentController,
);

// ==================== GET ALL PAYMENTS ====================
// LIBRARIAN

router.get(
  "/",
  authMiddleware,
  authorize("LIBRARIAN"),
  getAllPaymentsController,
);

// ==================== GET MY PAYMENTS ====================
// STUDENT

router.get(
  "/me",
  authMiddleware,
  authorize("STUDENT"),
  getMyPaymentsController,
);

// ==================== PAYMENT RECEIPT ====================

router.get(
  "/:paymentId/receipt",
  authMiddleware,
  authorize("LIBRARIAN", "STUDENT"),
  getPaymentReceiptController,
);

export default router;