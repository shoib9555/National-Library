import { Response } from "express";
import {
    markEntry,
    markExit,
    getMyAttendance,
    getAllAttendance,
} from "../services/attendanceService";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware";


export async function markEntryController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const attendance = await markEntry(
            req.user.userId
        );

        return res.status(201).json({
            message: "Entry marked successfully",
            attendance,
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


export async function markExitController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const attendance = await markExit(
            req.user.userId
        );

        return res.status(200).json({
            message: "Exit marked successfully",
            attendance,
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

export async function getMyAttendanceController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const attendance = await getMyAttendance(
            req.user.userId
        );

        return res.status(200).json({
            message: "Attendance history fetched successfully",
            attendance,
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

export async function getAllAttendanceController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const attendance = await getAllAttendance();

        return res.status(200).json({
            message: "All attendance records fetched successfully",
            attendance,
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