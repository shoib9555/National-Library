import { Router } from "express";

import {
    authMiddleware,
    authorize,
} from "../middleware/authMiddleware";

import {
    getLibrarianNotificationsController,
    getUnreadLibrarianNotificationsController,
    markLibrarianNotificationAsReadController,
    markAllLibrarianNotificationsAsReadController,
} from "../controllers/librarianNotificationController";

const router = Router();

router.get(
    "/",
    authMiddleware,
    authorize("LIBRARIAN"),
    getLibrarianNotificationsController
);

router.get(
    "/unread",
    authMiddleware,
    authorize("LIBRARIAN"),
    getUnreadLibrarianNotificationsController
);

router.patch(
    "/:id/read",
    authMiddleware,
    authorize("LIBRARIAN"),
    markLibrarianNotificationAsReadController
);

router.patch(
    "/read-all",
    authMiddleware,
    authorize("LIBRARIAN"),
    markAllLibrarianNotificationsAsReadController
);

export default router;