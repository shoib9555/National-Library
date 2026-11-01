
import { Router } from "express";
import { askNesoController } from "../controllers/nesoController";

import {
    authMiddleware,
    authorize,
} from "../middleware/authMiddleware";

const router = Router();

router.post(
    "/chat",
    authMiddleware,
    authorize("STUDENT"),
    askNesoController
);

export default router;
