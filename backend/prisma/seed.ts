import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/client";
import bcrypt from "bcrypt";

const sslCa = process.env.DB_SSL_CA
  ? Buffer.from(process.env.DB_SSL_CA, "base64").toString("utf8")
  : undefined;

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl:
    process.env.DB_SSL === "true"
      ? {
          ca: sslCa,
          rejectUnauthorized: true,
        }
      : undefined,

  connectionLimit: 5,
});


const prisma = new PrismaClient({ adapter });

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