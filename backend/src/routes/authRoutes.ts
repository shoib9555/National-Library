import { Router } from "express";

import {
  loginController,
  getMe,
  setStudentPasswordController,
  changePasswordController,
  uploadLibrarianProfilePhotoController,
  logoutController,
} from "../controllers/authController";

import {
    authMiddleware
} from "../middleware/authMiddleware";
import upload from "../middleware/upload";

const router = Router();

router.post("/login", loginController);

router.post(
  "/logout",
  authMiddleware,
  logoutController,
);

router.post(
    "/set-password",
    setStudentPasswordController
);

router.get("/me", authMiddleware, getMe);

router.patch(
  "/change-password",
  authMiddleware,
  changePasswordController,
);

router.post(
  "/librarian/profile-photo",
  authMiddleware,
  upload.single("profilePhoto"),
  uploadLibrarianProfilePhotoController,
);

export default router;