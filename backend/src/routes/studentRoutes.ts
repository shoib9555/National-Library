import { Router } from "express";
import {
    createStudentController,
    verifyStudentOtpController,
    resendStudentOtpController,
    deactivateStudentController,
    activateStudentController,
    getAllStudentsController,
    getStudentByCodeController,
    getMyStudentProfileController,
    updateStudentController,
    uploadStudentProfilePhotoController
} from "../controllers/studentController";

import {
    authMiddleware,
    authorize
} from "../middleware/authMiddleware";

import upload from "../middleware/upload";

const router = Router();

router.post(
    "/",
    authMiddleware,
    authorize("LIBRARIAN"),
    createStudentController
);

router.post(
    "/verify-otp",
    authMiddleware,
    authorize("LIBRARIAN"),
    verifyStudentOtpController
);

router.post(
    "/resend-otp",
    authMiddleware,
    authorize("LIBRARIAN"),
    resendStudentOtpController
);

router.post(
    "/deactivate",
    authMiddleware,
    authorize("LIBRARIAN"),
    deactivateStudentController
);

router.post(
  "/activate",
  authMiddleware,
  authorize("LIBRARIAN"),
  activateStudentController,
);

router.get(
    "/",
    authMiddleware,
    authorize("LIBRARIAN"),
    getAllStudentsController
);

router.get(
    "/me",
    authMiddleware,
    authorize("STUDENT"),
    getMyStudentProfileController
);

router.post(
    "/me/profile-photo",
    authMiddleware,
    authorize("STUDENT"),
    upload.single("profilePhoto"),
    uploadStudentProfilePhotoController
);

router.put(
    "/:studentCode",
    authMiddleware,
    authorize("LIBRARIAN"),
    updateStudentController
);
router.get(
    "/:studentCode",
    authMiddleware,
    authorize("LIBRARIAN"),
    getStudentByCodeController
);



export default router;