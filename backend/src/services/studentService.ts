import prisma from "../lib/prisma";
import { generateAndStoreOtp } from "./otpService";
import { createLibrarianNotification } from "./librarianNotificationService";

function maskAadhaarNumber(value: string | null): string | null {
  if (!value) {
    return null;
  }

  if (value.length <= 4) {
    return "****";
  }

  return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
}

interface CreateStudentData {
  name: string;
  phone: string;
  email: string;
  aadhaarNumber?: string;
  address: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  joiningDate: string;
}

export async function createStudent(data: CreateStudentData) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  // Generate and store OTP only after the student
  // has been successfully created.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const lastStudent = await prisma.student.findFirst({
        orderBy: {
          id: "desc",
        },
        select: {
          studentCode: true,
        },
      });

      let nextNumber = 1;

      if (lastStudent) {
        const number = parseInt(lastStudent.studentCode.replace("STU", ""), 10);

        nextNumber = number + 1;
      }

      const studentCode = `STU${String(nextNumber).padStart(3, "0")}`;

      const student = await prisma.student.create({
        data: {
          user: {
            create: {
              email: data.email,
              role: "STUDENT",
              status: "ACTIVE",
            },
          },

          studentCode: studentCode,
          name: data.name,
          phone: data.phone,
          aadhaarNumber: data.aadhaarNumber,
          address: data.address,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          joiningDate: new Date(data.joiningDate),
          status: "INACTIVE",
        },

        include: {
          user: true,
        },
      });
      let otp: string;

      try {
        otp = await generateAndStoreOtp(student.userId, student.phone);
      } catch (otpError) {
        console.error(
          "Failed to generate student OTP. Removing unverified student:",
          otpError,
        );

        await prisma.otpVerification.deleteMany({
          where: {
            userId: student.userId,
          },
        });

        await prisma.student.delete({
          where: {
            id: student.id,
          },
        });

        await prisma.user.delete({
          where: {
            id: student.userId,
          },
        });

        throw new Error("Failed to generate student OTP");
      }

      try {
        await createLibrarianNotification(
          "STUDENT_CREATED",
          "New Student Registered",
          `Student ${student.name} (${student.studentCode}) has been registered successfully.`,
        );
      } catch (notificationError) {
        console.error(
          "Failed to create librarian notification:",
          notificationError,
        );
      }

      const response: {
        id: number;
        studentCode: string;
        name: string;
        phone: string;
        email: string;
        joiningDate: Date;
        status: string;
        otp?: string;
      } = {
        id: student.id,
        studentCode: student.studentCode,
        name: student.name,
        phone: student.phone,
        email: student.user.email,
        joiningDate: student.joiningDate,
        status: student.status,
      };

     response.otp = otp;

      return response;
    } catch (error) {
      // Retry only when the generated studentCode
      // collides with another concurrent request.
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint") &&
        attempt < 2
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to generate student code");
}

export async function resendOtp(studentCode: string) {
  const student = await prisma.student.findUnique({
    where: {
      studentCode: studentCode,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  if (student.status === "ACTIVE") {
    throw new Error("Student is already verified");
  }

  const otp = await generateAndStoreOtp(student.userId, student.phone);

  const response: {
    studentCode: string;
    otp?: string;
  } = {
    studentCode: student.studentCode,
  };

  if (process.env.NODE_ENV === "development") {
    response.otp = otp;
  }

  return response;
}

export async function deactivateStudent(studentCode: string) {
  const student = await prisma.student.findUnique({
    where: {
      studentCode: studentCode,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  if (student.status === "INACTIVE") {
    throw new Error("Student is already inactive");
  }

  await prisma.$transaction(async (tx) => {
    if (student.seatId !== null) {
      await tx.seat.update({
        where: {
          id: student.seatId,
        },
        data: {
          status: "AVAILABLE",
        },
      });
    }

    await tx.student.update({
      where: {
        id: student.id,
      },
      data: {
        status: "INACTIVE",
        seatId: null,
      },
    });
  });

  return {
    studentCode: student.studentCode,
    status: "INACTIVE",
    seatReleased: student.seatId !== null,
  };
}

export async function activateStudent(studentCode: string) {
  const student = await prisma.student.findUnique({
    where: {
      studentCode: studentCode,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  if (student.status === "ACTIVE") {
    throw new Error("Student is already active");
  }

  await prisma.student.update({
    where: {
      id: student.id,
    },
    data: {
      status: "ACTIVE",
    },
  });

  return {
    studentCode: student.studentCode,
    status: "ACTIVE",
  };
}

export async function getAllStudents() {
  const students = await prisma.student.findMany({
    orderBy: {
      id: "asc",
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      seat: {
        select: {
          seatNumber: true,
        },
      },
    },
  });

  return students.map((student) => ({
    id: student.id,
    studentCode: student.studentCode,
    name: student.name,
    phone: student.phone,
    email: student.user.email,
    address: student.address,
    emergencyContactName: student.emergencyContactName,
    emergencyContactPhone: student.emergencyContactPhone,
    joiningDate: student.joiningDate,
    status: student.status,
    seatNumber: student.seat?.seatNumber ?? null,
  }));
}

export async function getStudentByCode(studentCode: string) {
  const student = await prisma.student.findUnique({
    where: {
      studentCode,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      seat: {
        select: {
          seatNumber: true,
          status: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  return {
    id: student.id,
    studentCode: student.studentCode,
    name: student.name,
    phone: student.phone,
    email: student.user.email,
    aadhaarNumber: maskAadhaarNumber(student.aadhaarNumber),
    address: student.address,
    emergencyContactName: student.emergencyContactName,
    emergencyContactPhone: student.emergencyContactPhone,
    joiningDate: student.joiningDate,
    status: student.status,
    seatNumber: student.seat?.seatNumber ?? null,
    seatStatus: student.seat?.status ?? null,
  };
}

export async function getMyStudentProfile(userId: number) {
  const student = await prisma.student.findUnique({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      seat: {
        select: {
          seatNumber: true,
          status: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student profile not found");
  }

  return {
    id: student.id,
    studentCode: student.studentCode,
    name: student.name,
    profilePhotoUrl: student.profilePhotoUrl,
    phone: student.phone,
    email: student.user.email,
    aadhaarNumber: maskAadhaarNumber(student.aadhaarNumber),
    address: student.address,
    emergencyContactName: student.emergencyContactName,
    emergencyContactPhone: student.emergencyContactPhone,
    joiningDate: student.joiningDate,
    status: student.status,
    seatNumber: student.seat?.seatNumber ?? null,
    seatStatus: student.seat?.status ?? null,
  };
}

export async function updateStudentProfilePhoto(
  userId: number,
  profilePhotoUrl: string,
) {
  const student = await prisma.student.findUnique({
    where: {
      userId,
    },
  });

  if (!student) {
    throw new Error("Student profile not found");
  }

  const updatedStudent = await prisma.student.update({
    where: {
      id: student.id,
    },
    data: {
      profilePhotoUrl,
    },
  });

  return {
    id: updatedStudent.id,
    studentCode: updatedStudent.studentCode,
    profilePhotoUrl: updatedStudent.profilePhotoUrl,
  };
}

interface UpdateStudentData {
  name?: string;
  phone?: string;
  email?: string;
  aadhaarNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  joiningDate?: string;
}

export async function updateStudent(
  studentCode: string,
  data: UpdateStudentData,
) {
  const student = await prisma.student.findUnique({
    where: {
      studentCode,
    },
    include: {
      user: true,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Check whether the new email belongs to another user
  if (data.email && data.email !== student.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser && existingUser.id !== student.userId) {
      throw new Error("Email is already registered");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedStudent = await tx.student.update({
      where: {
        id: student.id,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),

        ...(data.phone !== undefined && {
          phone: data.phone,
        }),

        ...(data.aadhaarNumber !== undefined && {
          aadhaarNumber: data.aadhaarNumber,
        }),

        ...(data.address !== undefined && {
          address: data.address,
        }),

        ...(data.emergencyContactName !== undefined && {
          emergencyContactName: data.emergencyContactName,
        }),

        ...(data.emergencyContactPhone !== undefined && {
          emergencyContactPhone: data.emergencyContactPhone,
        }),

        ...(data.joiningDate !== undefined && {
          joiningDate: new Date(data.joiningDate),
        }),
      },
    });

    let updatedUser = student.user;

    if (data.email !== undefined) {
      updatedUser = await tx.user.update({
        where: {
          id: student.userId,
        },
        data: {
          email: data.email,
        },
      });
    }

    return {
      updatedStudent,
      updatedUser,
    };
  });

  return {
    id: result.updatedStudent.id,
    studentCode: result.updatedStudent.studentCode,
    name: result.updatedStudent.name,
    phone: result.updatedStudent.phone,
    email: result.updatedUser.email,
    aadhaarNumber: maskAadhaarNumber(result.updatedStudent.aadhaarNumber),
    address: result.updatedStudent.address,
    emergencyContactName: result.updatedStudent.emergencyContactName,
    emergencyContactPhone: result.updatedStudent.emergencyContactPhone,
    joiningDate: result.updatedStudent.joiningDate,
    status: result.updatedStudent.status,
  };
}
