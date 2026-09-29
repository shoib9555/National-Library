import { Router } from "express";

import {
    authMiddleware,
    authorize
} from "../middleware/authMiddleware";

import {
    createMembershipController,
    renewMembershipController,
    updateMembershipStatusesController,
    getAllMembershipsController,
    getMyMembershipsController
} from "../controllers/membershipController";

const router = Router();

router.post(
    "/",
    authMiddleware,
    authorize("LIBRARIAN"),
    createMembershipController
);

router.post(
    "/renew",
    authMiddleware,
    authorize("LIBRARIAN"),
    renewMembershipController
);

router.post(
    "/update-statuses",
    authMiddleware,
    authorize("LIBRARIAN"),
    updateMembershipStatusesController
);

router.get(
    "/me",
    authMiddleware,
    authorize("STUDENT"),
    getMyMembershipsController
);

router.get(
    "/",
    authMiddleware,
    authorize("LIBRARIAN"),
    getAllMembershipsController
);



export default router;