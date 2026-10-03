import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

import {
  createMembership,
  renewMembership,
  updateMembershipStatuses,
  getAllMemberships,
  getMyMemberships,
} from "../services/membershipService";

import {
    createMembershipSchema,
    renewMembershipSchema,
} from "../validators/membershipValidator";


// ======================================================
// GET ALL MEMBERSHIPS
// LIBRARIAN
// ======================================================

export async function getAllMembershipsController(
    req: Request,
    res: Response,
) {
    try {
        const memberships = await getAllMemberships();

        return res.status(200).json({
            memberships,
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
}


// ======================================================
// CREATE MEMBERSHIP
// LIBRARIAN
// ======================================================

export async function createMembershipController(
    req: Request,
    res: Response,
) {
    try {
        const validationResult =
            createMembershipSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors:
                    validationResult.error.flatten().fieldErrors,
            });
        }

     const {
    studentCode,
    startDate,
    accessHours,
} = validationResult.data;

const membership = await createMembership(
    studentCode,
    new Date(startDate),
    accessHours,
);

        return res.status(201).json({
            message: "Membership created successfully",
            membership,
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
}


// ======================================================
// RENEW MEMBERSHIP
// LIBRARIAN
// ======================================================

export async function renewMembershipController(
    req: Request,
    res: Response,
) {
    try {
        const validationResult =
            renewMembershipSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors:
                    validationResult.error.flatten().fieldErrors,
            });
        }

        const {
            studentCode,
            paymentDate,
        } = validationResult.data;

        const result = await renewMembership(
            studentCode,
            new Date(paymentDate),
        );

        return res.status(201).json({
            message: "Membership renewed successfully",
            ...result,
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
}


// ======================================================
// UPDATE MEMBERSHIP STATUSES
// LIBRARIAN
// ======================================================

export async function updateMembershipStatusesController(
    req: Request,
    res: Response,
) {
    try {
        const result = await updateMembershipStatuses();

        return res.status(200).json({
    ...result,
    message: "Membership statuses updated successfully",
});
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
}

export async function getMyMembershipsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const memberships = await getMyMemberships(req.user.userId);

    return res.status(200).json({
      message: "Memberships fetched successfully",
      memberships,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}