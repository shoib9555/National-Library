import { Router } from "express";

import {
    authMiddleware,
    authorize,
} from "../middleware/authMiddleware";

import {
    markEntryController,
    markExitController,
    getMyAttendanceController,
    getAllAttendanceController,
} from "../controllers/attendanceController";

const router = Router();

router.post(
    "/entry",
    authMiddleware,
    authorize("STUDENT"),
    markEntryController
);

router.post(
    "/exit",
    authMiddleware,
    authorize("STUDENT"),
    markExitController
);

router.get(
    "/me",
    authMiddleware,
    authorize("STUDENT"),
    getMyAttendanceController
);

router.get(
    "/",
    authMiddleware,
    authorize("LIBRARIAN"),
    getAllAttendanceController
);

export default router;