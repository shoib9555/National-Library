import prisma from "../lib/prisma";

function formatLibraryDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
}

export async function getMyNotifications(userId: number) {
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

  const notifications = await prisma.notification.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
}

export async function createFeeReminderNotifications() {
  const now = new Date();

  // Start of today's date
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Five days from today
  const reminderStart = new Date(todayStart);
  reminderStart.setDate(reminderStart.getDate() + 5);

  // End of the reminder date
  const reminderEnd = new Date(reminderStart);
  reminderEnd.setDate(reminderEnd.getDate() + 1);

  const memberships = await prisma.membership.findMany({
    where: {
      expiryDate: {
        gte: reminderStart,
        lt: reminderEnd,
      },
      status: {
        in: ["ACTIVE", "EXPIRING_SOON"],
      },
    },
    include: {
      student: true,
    },
  });

  let createdCount = 0;

  for (const membership of memberships) {
    // Check whether today's reminder
    // has already been created.
    const existingNotification = await prisma.notification.findFirst({
      where: {
        studentId: membership.studentId,
        membershipId: membership.id,
        type: "FEE_REMINDER",
        channel: "WEBSITE",
        createdAt: {
          gte: todayStart,
        },
      },
    });

    if (existingNotification) {
      continue;
    }

    const message = `Your membership expires on ${formatLibraryDate(membership.expiryDate)}. Please renew your membership.`;

    await prisma.notification.create({
      data: {
        studentId: membership.studentId,
        membershipId: membership.id,
        type: "FEE_REMINDER",
        channel: "WEBSITE",
        message,
        status: "PENDING",
      },
    });

    createdCount++;
  }

  return {
    message: "Fee reminder notifications created successfully",
    createdCount,
  };
}

export async function createOverdueNotifications() {
  const now = new Date();

  const memberships = await prisma.membership.findMany({
    where: {
      expiryDate: {
        lt: now,
      },
      status: "EXPIRED",
      paymentId: null,
    },
    include: {
      student: true,
    },
  });

  let createdCount = 0;

  for (const membership of memberships) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        studentId: membership.studentId,
        membershipId: membership.id,
        type: "OVERDUE",
        channel: "WEBSITE",
      },
    });

    if (existingNotification) {
      continue;
    }

    const message = `Your membership expired on ${formatLibraryDate(membership.expiryDate)}. Please renew your membership.`;

    await prisma.notification.create({
      data: {
        studentId: membership.studentId,
        membershipId: membership.id,
        type: "OVERDUE",
        channel: "WEBSITE",
        message,
        status: "PENDING",
      },
    });

    createdCount++;
  }

  return {
    message: "Overdue notifications created successfully",
    createdCount,
  };
}

export async function createPaymentSuccessNotification(
  studentId: number,
  membershipId: number,
  amount: number,
) {
  const message = `Your payment of ₹${amount} was successful. Your membership payment has been recorded.`;

  await prisma.notification.create({
    data: {
      studentId,
      membershipId,
      type: "PAYMENT_SUCCESS",
      channel: "WEBSITE",
      message,
      status: "PENDING",
    },
  });
}

export async function createMembershipRenewedNotification(
  studentId: number,
  membershipId: number,
  expiryDate: Date,
) {
  const message = `Your membership has been renewed successfully. Your new membership expiry date is ${formatLibraryDate(expiryDate)}.`;

  await prisma.notification.create({
    data: {
      studentId,
      membershipId,
      type: "MEMBERSHIP_RENEWED",
      channel: "WEBSITE",
      message,
      status: "PENDING",
    },
  });
}

export async function createMembershipExpiringNotifications() {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const expiringStart = new Date(todayStart);
  expiringStart.setDate(expiringStart.getDate() + 5);

  const expiringEnd = new Date(expiringStart);
  expiringEnd.setDate(expiringEnd.getDate() + 1);

  const memberships = await prisma.membership.findMany({
    where: {
      expiryDate: {
        gte: expiringStart,
        lt: expiringEnd,
      },
      status: {
        in: ["ACTIVE", "EXPIRING_SOON"],
      },
    },
  });

  let createdCount = 0;

  for (const membership of memberships) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        studentId: membership.studentId,
        membershipId: membership.id,
        type: "MEMBERSHIP_EXPIRING",
        channel: "WEBSITE",
        createdAt: {
          gte: todayStart,
        },
      },
    });

    if (existingNotification) {
      continue;
    }

    await prisma.notification.create({
      data: {
        studentId: membership.studentId,
        membershipId: membership.id,
        type: "MEMBERSHIP_EXPIRING",
        channel: "WEBSITE",
        message: `Your membership is expiring on ${formatLibraryDate(membership.expiryDate)}. Please renew your membership.`,
        status: "PENDING",
      },
    });

    createdCount++;
  }

  return {
    message: "Membership expiring notifications created successfully",
    createdCount,
  };
}
