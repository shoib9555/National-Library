import prisma from "../lib/prisma";

export async function getAllSeats() {
  const seats = await prisma.seat.findMany({
    orderBy: {
      seatNumber: "asc",
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

  return seats;
}

export async function assignSeat(
  studentCode: string,
  seatNumber: number
) {
  if (seatNumber < 1 || seatNumber > 70) {
    throw new Error("Seat number must be between 1 and 70");
  }

  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: {
        studentCode: studentCode,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    if (student.status !== "ACTIVE") {
      throw new Error("Student is not active");
    }

    if (student.seatId !== null) {
      throw new Error("Student already has a seat");
    }

    const seat = await tx.seat.findUnique({
      where: {
        seatNumber: seatNumber,
      },
    });

    if (!seat) {
      throw new Error("Seat not found");
    }

    if (seat.status !== "AVAILABLE") {
      throw new Error("Seat is already occupied");
    }

    await tx.student.update({
      where: {
        id: student.id,
      },
      data: {
        seatId: seat.id,
      },
    });

    await tx.seat.update({
      where: {
        id: seat.id,
      },
      data: {
        status: "OCCUPIED",
      },
    });

    return {
      studentCode: student.studentCode,
      seatNumber: seat.seatNumber,
      status: "OCCUPIED",
    };
  });
}

export async function changeSeat(
  studentCode: string,
  newSeatNumber: number
) {
  if (newSeatNumber < 1 || newSeatNumber > 70) {
    throw new Error("Seat number must be between 1 and 70");
  }

  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: {
        studentCode: studentCode,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    if (student.status !== "ACTIVE") {
      throw new Error("Student is not active");
    }

    if (student.seatId === null) {
      throw new Error("Student does not have a seat");
    }

    const newSeat = await tx.seat.findUnique({
      where: {
        seatNumber: newSeatNumber,
      },
    });

    if (!newSeat) {
      throw new Error("Seat not found");
    }

    if (newSeat.status !== "AVAILABLE") {
      throw new Error("New seat is already occupied");
    }

    const oldSeat = await tx.seat.findUnique({
      where: {
        id: student.seatId,
      },
    });

    if (!oldSeat) {
      throw new Error("Current seat not found");
    }

    // If the requested seat is somehow the current seat,
    // there is nothing to change.
    if (oldSeat.id === newSeat.id) {
      throw new Error("Student is already assigned to this seat");
    }

    await tx.student.update({
      where: {
        id: student.id,
      },
      data: {
        seatId: newSeat.id,
      },
    });

    await tx.seat.update({
      where: {
        id: oldSeat.id,
      },
      data: {
        status: "AVAILABLE",
      },
    });

    await tx.seat.update({
      where: {
        id: newSeat.id,
      },
      data: {
        status: "OCCUPIED",
      },
    });

    return {
      studentCode: student.studentCode,
      oldSeatNumber: oldSeat.seatNumber,
      newSeatNumber: newSeat.seatNumber,
      status: "OCCUPIED",
    };
  });
}