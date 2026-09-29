import express from "express";

import helmet from "helmet";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import seatRoutes from "./routes/seatRoutes";
import membershipRoutes from "./routes/membershipRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import librarianNotificationRoutes from "./routes/librarianNotificationRoutes";
import todoRoutes from "./routes/todoRoutes"


const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      (
        req as express.Request & {
          rawBody?: Buffer;
        }
      ).rawBody = Buffer.from(buf);
    },
  }),
);

app.get("/", (req, res) => {
  res.json({
    message: "National Library API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/librarian-notifications", librarianNotificationRoutes);
app.use("/api", todoRoutes);


app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

export default app;
