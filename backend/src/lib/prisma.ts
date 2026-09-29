import "dotenv/config";
import mariadb from "mariadb";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/client";

const pool = mariadb.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.MYSQL_PASSWORD,
    database: "national_library",

    connectionLimit: 5,
    acquireTimeout: 10000,
    connectTimeout: 5000,
    allowPublicKeyRetrieval: true,
});

const adapter = new PrismaMariaDb(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;