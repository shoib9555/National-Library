import { Request, Response } from "express";
import {
  createStudentSchema,
  updateStudentSchema,
} from "../validators/studentValidator";

import {
    verifyOtpSchema,
    resendOtpSchema,
    setStudentPasswordSchema
} from "../validators/authValidator";

import {
  createStudent,
  deactivateStudent,
  activateStudent,
  getAllStudents,
  getStudentByCode,
  getMyStudentProfile,
  updateStudent,
  updateStudentProfilePhoto,
} from "../services/studentService";
import { setStudentPassword } from "../services/authService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { verifyOtp, resendOtp } from "../services/otpService";
import { uploadProfilePhoto } from "../services/cloudinaryService";

export async function createStudentController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const validationResult = createStudentSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const {
      name,
      phone,
      email,
      aadhaarNumber,
      address,
      emergencyContactName,
      emergencyContactPhone,
      joiningDate,
    } = validationResult.data;

    const student = await createStudent({
      name,
      phone,
      email,
      aadhaarNumber,
      address,
      emergencyContactName,
      emergencyContactPhone,
      joiningDate,
    });

    return res.status(201).json({
      message: "Student registered successfully",
      student,
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

export async function verifyStudentOtpController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const validationResult = verifyOtpSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

  const { studentCode, otp } = validationResult.data;

const result = await verifyOtp(studentCode, otp);

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
export async function resendStudentOtpController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const validationResult =
            resendOtpSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.flatten().fieldErrors
            });
        }

        const { studentCode } = validationResult.data;

        const result = await resendOtp(studentCode);

        return res.status(200).json(result);

    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function setStudentPasswordController(
  req: Request,
  res: Response,
) {
  try {
   const validationResult =
    setStudentPasswordSchema.safeParse(req.body);

if (!validationResult.success) {
    return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
    });
}

const { setupToken, password } = validationResult.data;
    const result = await setStudentPassword(
      String(setupToken),
      String(password),
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

export async function deactivateStudentController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { studentCode } = req.body;

    if (!studentCode) {
      return res.status(400).json({
        message: "studentCode is required",
      });
    }

    const result = await deactivateStudent(String(studentCode));

    return res.status(200).json({
      message: "Student deactivated successfully",
      student: result,
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

export async function activateStudentController(
  req: Request,
  res: Response,
) {
  try {
    const { studentCode } = req.body

    if (!studentCode) {
      return res.status(400).json({
        message: "Student code is required",
      })
    }

    const student = await activateStudent(studentCode)

    return res.status(200).json({
      message: "Student activated successfully",
      student,
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

export async function getAllStudentsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const students = await getAllStudents();

    return res.status(200).json({
      message: "Students fetched successfully",
      students,
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

export async function getStudentByCodeController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { studentCode } = req.params;

    const student = await getStudentByCode(String(studentCode));

    return res.status(200).json({
      message: "Student fetched successfully",
      student,
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

export async function getMyStudentProfileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const student = await getMyStudentProfile(req.user.userId);

    return res.status(200).json({
      message: "Student profile fetched successfully",
      student,
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

export async function updateStudentController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { studentCode } = req.params;

    if (!studentCode) {
      return res.status(400).json({
        message: "studentCode is required",
      });
    }

    const validationResult = updateStudentSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const result = await updateStudent(
      String(studentCode),
      validationResult.data,
    );

    return res.status(200).json({
      message: "Student updated successfully",
      student: result,
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

export async function uploadStudentProfilePhotoController(
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

    const student = await getMyStudentProfile(req.user.userId);

    const profilePhotoUrl = await uploadProfilePhoto(
      req.file.buffer,
      student.studentCode,
    );

    const updatedStudent = await updateStudentProfilePhoto(
      req.user.userId,
      profilePhotoUrl,
    );

    return res.status(200).json({
      message: "Profile photo uploaded successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Profile photo upload error:", error);

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