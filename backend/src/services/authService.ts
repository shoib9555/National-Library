import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      student: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Account is inactive");
  }

  // Check whether the account is temporarily locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new Error("Too many failed login attempts. Please try again later.");
  }

  // Clear an expired lock
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  if (!user.passwordHash) {
    throw new Error("Password is not set");
  }

  // Student-specific checks
  if (user.role === "STUDENT") {
    if (!user.student) {
      throw new Error("Student profile not found");
    }

    if (user.student.status !== "ACTIVE") {
      throw new Error("Student registration is not verified");
    }
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
      },
    });

    if (updatedUser.failedLoginAttempts >= 5) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      throw new Error(
        "Too many failed login attempts. Please try again later.",
      );
    }

    throw new Error("Invalid email or password");
  }

  // Successful login resets the failed-attempt counter
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    secret,
    {
      expiresIn: "1d",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}
export async function setStudentPassword(
    setupToken: string,
    password: string
) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(setupToken, secret);

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.userId !== "number" ||
        decoded.purpose !== "SET_PASSWORD"
    ) {
        throw new Error("Invalid setup token");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.role !== "STUDENT") {
        throw new Error("Invalid setup token");
    }

    // Setup token can only be used before the password is created.
    if (user.passwordHash) {
        throw new Error("Password has already been created");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
        where: {
            id: decoded.userId,
        },
        data: {
            passwordHash,
        },
    });

    return {
        message: "Password created successfully",
    };
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.passwordHash) {
    throw new Error("Password is not set");
  }

  const currentPasswordMatches = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordMatches) {
    throw new Error("Current password is incorrect");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash: newPasswordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  return {
    message: "Password changed successfully",
  };
}

export async function updateLibrarianProfilePhoto(
  userId: number,
  profilePhotoUrl: string,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "LIBRARIAN") {
    throw new Error("Only librarian can update profile photo");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profilePhotoUrl,
    },
    select: {
      id: true,
      email: true,
      role: true,
      profilePhotoUrl: true,
    },
  });

  return updatedUser;
}

export async function getCurrentUser(userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      profilePhotoUrl: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  return user
}