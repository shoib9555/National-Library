import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";

async function main() {
    // Create 70 seats
    for (let i = 1; i <= 70; i++) {
        await prisma.seat.upsert({
            where: {
                seatNumber: i
            },
            update: {},
            create: {
                seatNumber: i,
                status: "AVAILABLE"
            }
        });
    }

    console.log("70 seats created successfully.");

    // Create librarian
    const email = process.env.LIBRARIAN_EMAIL;
    const password = process.env.LIBRARIAN_PASSWORD;

    if (!email || !password) {
        throw new Error(
            "LIBRARIAN_EMAIL and LIBRARIAN_PASSWORD are required in .env"
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.upsert({
        where: {
            email: email
        },
        update: {
            passwordHash: passwordHash,
            role: "LIBRARIAN",
            status: "ACTIVE"
        },
        create: {
            email: email,
            passwordHash: passwordHash,
            role: "LIBRARIAN",
            status: "ACTIVE"
        }
    });

    console.log("Librarian created successfully.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });