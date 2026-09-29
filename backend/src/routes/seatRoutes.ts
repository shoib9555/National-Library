import { Router } from "express";

import {
    authMiddleware,
    authorize
} from "../middleware/authMiddleware";

import {
    getAllSeatsController,
    assignSeatController,
    changeSeatController
} from "../controllers/seatController";

const router = Router();

router.get(
    "/",
    authMiddleware,
    authorize("LIBRARIAN"),
    getAllSeatsController
);

router.post(
    "/assign",
    authMiddleware,
    authorize("LIBRARIAN"),
    assignSeatController
);

router.post(
    "/change",
    authMiddleware,
    authorize("LIBRARIAN"),
    changeSeatController
);

export default router;