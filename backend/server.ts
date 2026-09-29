import app from "./src/app";
import prisma from "./src/lib/prisma";
import { startMembershipStatusJob } from "./src/jobs/membershipJob";

const PORT = 5000;

async function startServer() {
    try {
        await prisma.$connect();

        console.log("Database connected successfully.");

        startMembershipStatusJob();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error);
        process.exit(1);
    }
}

startServer();