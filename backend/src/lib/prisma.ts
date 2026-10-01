import "dotenv/config";
import mariadb from "mariadb";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/client";

console.log("DB_SSL:", process.env.DB_SSL);
console.log("DB_SSL_CA present:", Boolean(process.env.DB_SSL_CA));
console.log("DB_SSL_CA length:", process.env.DB_SSL_CA?.length ?? 0);

const sslCa = process.env.DB_SSL_CA
    ? Buffer.from(process.env.DB_SSL_CA, "base64").toString("utf8")
    : undefined;

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Aiven requires SSL
    ssl: process.env.DB_SSL === "true"
        ? {
            ca: sslCa,
            rejectUnauthorized: true,
        }
        : undefined,

    connectionLimit: 5,
    acquireTimeout: 10000,
    connectTimeout: 5000,
    allowPublicKeyRetrieval: true,

    logger: {
        error: (error) => {
            console.error("MARIADB ERROR:", error);
        },
    },
});

const adapter = new PrismaMariaDb(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;