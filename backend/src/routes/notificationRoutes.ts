import { Router } from "express";
import {
    authMiddleware,
    authorize,
} from "../middleware/authMiddleware";

import {
    getMyNotificationsController,
} from "../controllers/notificationController";


const router = Router();

router.get(
    "/me",
    authMiddleware,
    authorize("STUDENT"),
    getMyNotificationsController
);



export default router;