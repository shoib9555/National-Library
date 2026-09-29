import prisma from "../lib/prisma";

import { createMembershipRenewedNotification } from "./notificationService";

export async function createMembership(
  studentCode: string,
  startDate: Date
) {
  const result = await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: {
        studentCode,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    if (student.status !== "ACTIVE") {
      throw new Error("Student is not active");
    }

    // Check inside the transaction
    const existingMembership = await tx.membership.findFirst({
      where: {
        studentId: student.id,
        status: {
          in: ["ACTIVE", "EXPIRING_SOON"],
        },
        expiryDate: {
          gt: new Date(),
        },
      },
    });

    if (existingMembership) {
      throw new Error("Student already has an active membership");
    }

    // Calculate expiry date = start date + 1 month
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const membership = await tx.membership.create({
      data: {
        studentId: student.id,
        startDate,
        expiryDate,
        monthlyFee: 800,
        status: "ACTIVE",
      },
    });

    return {
      membership,
      student,
    };
  });

  return {
    id: result.membership.id,
    studentCode: result.student.studentCode,
    startDate: result.membership.startDate,
    expiryDate: result.membership.expiryDate,
    monthlyFee: result.membership.monthlyFee,
    status: result.membership.status,
  };
}

export async function renewMembership(
  studentCode: string,
  paymentDate: Date
) {
  const result = await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: { studentCode },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    if (student.status !== "ACTIVE") {
      throw new Error("Student is not active");
    }

    // Find membership currently valid on payment date.
    // UPCOMING memberships are intentionally ignored.
    const currentMembership = await tx.membership.findFirst({
      where: {
        studentId: student.id,
        startDate: { lte: paymentDate },
        expiryDate: { gt: paymentDate },
      },
      orderBy: {
        expiryDate: "desc",
      },
    });

    let startDate: Date;

    if (currentMembership) {
      // Early renewal:
      // New membership starts when current membership expires.
      startDate = currentMembership.expiryDate;
    } else {
      // Late renewal:
      // New membership starts on payment date.
      startDate = paymentDate;
    }

    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const membershipStatus =
      startDate > paymentDate
        ? "UPCOMING"
        : "ACTIVE";

    const transactionReference = `CASH-${Date.now()}`;

    const payment = await tx.payment.create({
      data: {
        studentId: student.id,
        amount: 800,
        paymentMethod: "CASH",
        paymentDate,
        status: "PAID",
        transactionReference,
      },
    });

    const membership = await tx.membership.create({
      data: {
        studentId: student.id,
        paymentId: payment.id,
        startDate,
        expiryDate,
        monthlyFee: 800,
        status: membershipStatus,
      },
    });

    return {
      student,
      payment,
      membership,
    };
  });

  // Notification is created only after the transaction succeeds.
  await createMembershipRenewedNotification(
    result.membership.studentId,
    result.membership.id,
    result.membership.expiryDate
  );

  return {
    membershipId: result.membership.id,
    paymentId: result.payment.id,
    studentCode: result.student.studentCode,
    amount: result.payment.amount,
    paymentMethod: result.payment.paymentMethod,
    paymentDate: result.payment.paymentDate,
    startDate: result.membership.startDate,
    expiryDate: result.membership.expiryDate,
    status: result.membership.status,
    transactionReference: result.payment.transactionReference,
  };
}

export async function updateMembershipStatuses() {
  const now = new Date();

  const expiringSoonLimit = new Date(now);
  expiringSoonLimit.setDate(expiringSoonLimit.getDate() + 5);

  let updatedCount = 0;

  // UPCOMING
  const upcomingResult = await prisma.membership.updateMany({
    where: {
      startDate: {
        gt: now,
      },
      status: {
        not: "UPCOMING",
      },
    },
    data: {
      status: "UPCOMING",
    },
  });

  updatedCount += upcomingResult.count;

  // EXPIRED
  const expiredResult = await prisma.membership.updateMany({
    where: {
      startDate: {
        lte: now,
      },
      expiryDate: {
        lte: now,
      },
      status: {
        not: "EXPIRED",
      },
    },
    data: {
      status: "EXPIRED",
    },
  });

  updatedCount += expiredResult.count;

  // EXPIRING_SOON
  const expiringSoonResult = await prisma.membership.updateMany({
    where: {
      startDate: {
        lte: now,
      },
      expiryDate: {
        gt: now,
        lte: expiringSoonLimit,
      },
      status: {
        not: "EXPIRING_SOON",
      },
    },
    data: {
      status: "EXPIRING_SOON",
    },
  });

  updatedCount += expiringSoonResult.count;

  // ACTIVE
  const activeResult = await prisma.membership.updateMany({
    where: {
      startDate: {
        lte: now,
      },
      expiryDate: {
        gt: expiringSoonLimit,
      },
      status: {
        not: "ACTIVE",
      },
    },
    data: {
      status: "ACTIVE",
    },
  });

  updatedCount += activeResult.count;

  return {
    message: "Membership statuses updated successfully",
    updatedCount,
  };
}

export async function getAllMemberships() {
    const memberships = await prisma.membership.findMany({
        orderBy: {
            id: "asc"
        },
        include: {
            student: {
                select: {
                    studentCode: true,
                    name: true
                }
            },
            payment: {
  select: {
    id: true,
    amount: true,
    paymentMethod: true,
    paymentDate: true,
    status: true,
    transactionReference: true,
  },
}
        }
    });

    return memberships.map((membership) => ({
        membershipId: membership.id,
        studentCode: membership.student.studentCode,
        studentName: membership.student.name,
        startDate: membership.startDate,
        expiryDate: membership.expiryDate,
        monthlyFee: membership.monthlyFee,
        status: membership.status,
        payment: membership.payment
            ? {
                  paymentId: membership.payment.id,
                  amount: membership.payment.amount,
                  paymentMethod: membership.payment.paymentMethod,
                  paymentDate: membership.payment.paymentDate,
                  status: membership.payment.status,
                  transactionReference: membership.payment.transactionReference,
                  
              }
            : null
    }));
}

export async function getMyMemberships(userId: number) {
  const student = await prisma.student.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    throw new Error("Student profile not found");
  }

  const memberships = await prisma.membership.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: {
      id: "desc",
    },
  });

  return memberships.map((membership) => ({
    membershipId: membership.id,
    startDate: membership.startDate,
    expiryDate: membership.expiryDate,
    monthlyFee: membership.monthlyFee,
    status: membership.status,
  }));
}