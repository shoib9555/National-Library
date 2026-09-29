import { Response } from "express";

import {
    getLibrarianNotifications,
    getUnreadLibrarianNotifications,
    markLibrarianNotificationAsRead,
    markAllLibrarianNotificationsAsRead,
} from "../services/librarianNotificationService";

import {
    AuthenticatedRequest,
} from "../middleware/authMiddleware";


export async function getLibrarianNotificationsController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const notifications = await getLibrarianNotifications();

        return res.status(200).json({
            message: "Librarian notifications fetched successfully",
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


export async function getUnreadLibrarianNotificationsController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const notifications =
            await getUnreadLibrarianNotifications();

        return res.status(200).json({
            message: "Unread librarian notifications fetched successfully",
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


export async function markLibrarianNotificationAsReadController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const notificationId = Number(req.params.id);

        if (!Number.isInteger(notificationId)) {
            return res.status(400).json({
                message: "Invalid notification ID",
            });
        }

        const notification =
            await markLibrarianNotificationAsRead(notificationId);

        return res.status(200).json({
            message: "Notification marked as read",
            notification,
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


export async function markAllLibrarianNotificationsAsReadController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const result =
            await markAllLibrarianNotificationsAsRead();

        return res.status(200).json(result);

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