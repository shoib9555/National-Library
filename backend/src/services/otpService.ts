import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function generateAndStoreOtp(
  userId: number,
  phoneNumber: string,
) {
  const otp = generateOtp();

  const otpHash = await bcrypt.hash(otp, 12);

  await prisma.otpVerification.create({
    data: {
      userId: userId,
      otpHash: otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  // OTP is returned to the librarian UI.
  // It is stored in the database only as a bcrypt hash.
  return otp;
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

  const otp = await generateAndStoreOtp(
    student.userId,
    student.phone,
  );

  return {
    studentCode: student.studentCode,
    otp: otp,
    message: "OTP generated successfully",
  };
}

export async function verifyOtp(
  studentCode: string,
  otp: string,
) {
  const student = await prisma.student.findUnique({
    where: {
      studentCode: studentCode,
    },
    select: {
      userId: true,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const userId = student.userId;

  const verification = await prisma.otpVerification.findFirst({
    where: {
      userId: userId,
      verifiedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!verification) {
    throw new Error("OTP not found");
  }

  if (verification.expiresAt < new Date()) {
    throw new Error("OTP has expired");
  }

  // Maximum 5 incorrect attempts for one OTP
  if (verification.attemptCount >= 5) {
    throw new Error(
      "Maximum OTP attempts exceeded. Please request a new OTP.",
    );
  }

  const otpMatches = await bcrypt.compare(
    otp,
    verification.otpHash,
  );

  if (!otpMatches) {
    const updatedVerification =
      await prisma.otpVerification.updateMany({
        where: {
          id: verification.id,
          verifiedAt: null,
          attemptCount: {
            lt: 5,
          },
        },
        data: {
          attemptCount: {
            increment: 1,
          },
        },
      });

    if (updatedVerification.count === 0) {
      throw new Error(
        "Maximum OTP attempts exceeded. Please request a new OTP.",
      );
    }

    throw new Error("Invalid OTP");
  }

  await prisma.otpVerification.update({
    where: {
      id: verification.id,
    },
    data: {
      verifiedAt: new Date(),
    },
  });

  await prisma.student.update({
    where: {
      userId: userId,
    },
    data: {
      status: "ACTIVE",
    },
  });

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const setupToken = jwt.sign(
    {
      userId: userId,
      purpose: "SET_PASSWORD",
    },
    secret,
    {
      expiresIn: "15m",
    },
  );

  return {
    message: "OTP verified successfully",
    setupToken: setupToken,
  };
}