import prisma from "../lib/prisma";

export async function markEntry(userId: number) {
    const student = await prisma.student.findUnique({
        where: {
            userId,
        },
    });

    if (!student) {
        throw new Error("Student profile not found");
    }

    if (student.status !== "ACTIVE") {
        throw new Error("Student is not active");
    }

    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            studentId: student.id,
            exitTime: null,
        },
        orderBy: {
            entryTime: "desc",
        },
    });

    if (existingAttendance) {
        throw new Error("Student is already inside the library");
    }

    const attendance = await prisma.attendance.create({
        data: {
            studentId: student.id,
            entryTime: new Date(),
        },
    });

    return {
        attendanceId: attendance.id,
        studentCode: student.studentCode,
        entryTime: attendance.entryTime,
        exitTime: attendance.exitTime,
        durationMinutes: attendance.durationMinutes,
    };
}


export async function markExit(userId: number) {
    const student = await prisma.student.findUnique({
        where: {
            userId,
        },
    });

    if (!student) {
        throw new Error("Student profile not found");
    }

    if (student.status !== "ACTIVE") {
        throw new Error("Student is not active");
    }

    const attendance = await prisma.attendance.findFirst({
        where: {
            studentId: student.id,
            exitTime: null,
        },
        orderBy: {
            entryTime: "desc",
        },
    });

    if (!attendance) {
        throw new Error("No active attendance found");
    }

    const exitTime = new Date();

    const durationMinutes = Math.floor(
        (exitTime.getTime() - attendance.entryTime.getTime()) /
        (1000 * 60)
    );

    const updatedAttendance = await prisma.attendance.update({
        where: {
            id: attendance.id,
        },
        data: {
            exitTime,
            durationMinutes,
        },
    });

    return {
        attendanceId: updatedAttendance.id,
        studentCode: student.studentCode,
        entryTime: updatedAttendance.entryTime,
        exitTime: updatedAttendance.exitTime,
        durationMinutes: updatedAttendance.durationMinutes,
    };
}

export async function autoMarkExit(userId: number) {
    const student = await prisma.student.findUnique({
        where: {
            userId,
        },
    });

    if (!student) {
        return null;
    }

    const attendance = await prisma.attendance.findFirst({
        where: {
            studentId: student.id,
            exitTime: null,
        },
        orderBy: {
            entryTime: "desc",
        },
    });

    // No active attendance means there is nothing to close.
    if (!attendance) {
        return null;
    }

    const exitTime = new Date();

    const durationMinutes = Math.floor(
        (exitTime.getTime() - attendance.entryTime.getTime()) /
        (1000 * 60)
    );

    const updatedAttendance = await prisma.attendance.update({
        where: {
            id: attendance.id,
        },
        data: {
            exitTime,
            durationMinutes,
        },
    });

    return {
        attendanceId: updatedAttendance.id,
        studentCode: student.studentCode,
        entryTime: updatedAttendance.entryTime,
        exitTime: updatedAttendance.exitTime,
        durationMinutes: updatedAttendance.durationMinutes,
    };
}

export async function getMyAttendance(userId: number) {
    const student = await prisma.student.findUnique({
        where: {
            userId,
        },
        select: {
            id: true,
            studentCode: true,
        },
    });

    if (!student) {
        throw new Error("Student profile not found");
    }

    const attendance = await prisma.attendance.findMany({
        where: {
            studentId: student.id,
        },
        orderBy: {
            entryTime: "desc",
        },
    });

    return attendance.map((record) => ({
        attendanceId: record.id,
        studentCode: student.studentCode,
        entryTime: record.entryTime,
        exitTime: record.exitTime,
        durationMinutes: record.durationMinutes,
    }));
}

export async function getAllAttendance() {
    const attendance = await prisma.attendance.findMany({
        orderBy: {
            entryTime: "desc",
        },
        include: {
            student: {
                select: {
                    studentCode: true,
                    name: true,
                },
            },
        },
    });

    return attendance.map((record) => ({
        attendanceId: record.id,
        studentCode: record.student.studentCode,
        studentName: record.student.name,
        entryTime: record.entryTime,
        exitTime: record.exitTime,
        durationMinutes: record.durationMinutes,
    }));
}