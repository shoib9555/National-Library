import { Response } from "express";

import {
    getMyNotifications,
} from "../services/notificationService";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware";


export async function getMyNotificationsController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const notifications = await getMyNotifications(
            req.user.userId
        );

        return res.status(200).json({
            message: "Notifications fetched successfully",
            notifications,
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

