import { Request, Response } from "express";

import {
    getAllSeats,
    assignSeat,
    changeSeat,
} from "../services/seatService";

import {
    assignSeatSchema,
    changeSeatSchema,
} from "../validators/seatValidator";


// ======================================================
// GET ALL SEATS
// LIBRARIAN
// ======================================================

export async function getAllSeatsController(
    req: Request,
    res: Response,
) {
    try {
        const seats = await getAllSeats();

        return res.status(200).json({
            seats,
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
// ASSIGN SEAT
// LIBRARIAN
// ======================================================

export async function assignSeatController(
    req: Request,
    res: Response,
) {
    try {
        const validationResult =
            assignSeatSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors:
                    validationResult.error.flatten().fieldErrors,
            });
        }

        const {
            studentCode,
            seatNumber,
        } = validationResult.data;

        const result = await assignSeat(
            studentCode,
            seatNumber,
        );

        return res.status(200).json({
            message: "Seat assigned successfully",
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
// CHANGE SEAT
// LIBRARIAN
// ======================================================

export async function changeSeatController(
    req: Request,
    res: Response,
) {
    try {
        const validationResult =
            changeSeatSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors:
                    validationResult.error.flatten().fieldErrors,
            });
        }

        const {
            studentCode,
            newSeatNumber,
        } = validationResult.data;

        const result = await changeSeat(
            studentCode,
            newSeatNumber,
        );

        return res.status(200).json({
            message: "Seat changed successfully",
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