
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import mariadb from "mariadb";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/client";

// Load the AWS RDS CA bundle from the backend/certs directory.
const sslCaPath = path.resolve(
    process.cwd(),
    "certs",
    "aws-rds-global-bundle.pem"
);

const sslCa = fs.readFileSync(sslCaPath, "utf8");

console.log("DB_SSL enabled:", process.env.DB_SSL === "true");
console.log("AWS RDS CA certificate loaded:", sslCa.length > 0);

const pool = mariadb.createPool({
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
