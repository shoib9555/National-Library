import prisma from "../lib/prisma";

export async function getLibrarianNotifications() {
    return prisma.librarianNotification.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getUnreadLibrarianNotifications() {
    return prisma.librarianNotification.findMany({
        where: {
            isRead: false,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function createLibrarianNotification(
    type: string,
    title: string,
    message: string
) {
    return prisma.librarianNotification.create({
        data: {
            type,
            title,
            message,
        },
    });
}

export async function markLibrarianNotificationAsRead(
    notificationId: number
) {
    const notification =
        await prisma.librarianNotification.findUnique({
            where: {
                id: notificationId,
            },
        });

    if (!notification) {
        throw new Error("Librarian notification not found");
    }

    return prisma.librarianNotification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });
}

export async function markAllLibrarianNotificationsAsRead() {
    await prisma.librarianNotification.updateMany({
        where: {
            isRead: false,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });

    return {
        message: "All librarian notifications marked as read",
    };
}