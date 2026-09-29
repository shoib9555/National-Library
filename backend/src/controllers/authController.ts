import { Request, Response } from "express";
import * as authService from "../services/authService";

import { uploadLibrarianProfilePhoto } from "../services/cloudinaryService";
import {
  loginSchema,
  setStudentPasswordSchema,
} from "../validators/authValidator";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export async function loginController(req: Request, res: Response) {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validationResult.data;

    const result = await authService.login(email, password);

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Invalid email or password" ||
        error.message === "Access denied"
      ) {
        return res.status(401).json({
          message: error.message,
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function setStudentPasswordController(
  req: Request,
  res: Response
) {
  try {
    const validationResult = setStudentPasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { setupToken, password } = validationResult.data;

    const result = await authService.setStudentPassword(
  setupToken,
  password
);

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
export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

   const user = await authService.getCurrentUser(req.user.userId)

    return res.status(200).json({
      message: "Authentication successful",
      user,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      })
    }

    return res.status(500).json({
      message: "Something went wrong",
    })
  }
}

export async function changePasswordController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long",
      });
    }

  const result = await authService.changePassword(
  req.user.userId,
  currentPassword,
  newPassword,
);

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

export async function uploadLibrarianProfilePhotoController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Profile photo is required",
      });
    }

 

    const profilePhotoUrl = await uploadLibrarianProfilePhoto(
      req.file.buffer,
      req.file.originalname,
    );

    const user = await authService.updateLibrarianProfilePhoto(
  req.user.userId,
  profilePhotoUrl,
);

    return res.status(200).json({
      message: "Librarian profile photo uploaded successfully",
      user,
    });
  } catch (error) {
    console.error("Librarian profile photo upload error:", error);

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