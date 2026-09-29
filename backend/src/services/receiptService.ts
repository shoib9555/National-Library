import PDFDocument from "pdfkit";
import prisma from "../lib/prisma";
import path from "path";

export async function generatePaymentReceipt(paymentId: number) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },

    include: {
      student: {
        select: {
          studentCode: true,
          name: true,
        },
      },

      membership: {
        select: {
          id: true,
          startDate: true,
          expiryDate: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "PAID") {
    throw new Error("Receipt is available only for paid payments");
  }

  if (!payment.membership) {
    throw new Error("Membership not found for payment");
  }

  const receiptNumber = `NL-${String(payment.id).padStart(6, "0")}`;

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  // =========================
  // HEADER
  // =========================

  doc
    .rect(0, 0, doc.page.width, 90)
    .fill("#1E3A8A");

  doc
    .fillColor("#FFFFFF")
    .fontSize(24)
    .text("THE NATIONAL LIBRARY", 40, 25, {
      width: doc.page.width - 80,
      align: "center",
    });

  doc
    .fontSize(11)
    .text("Library Management System", 40, 58, {
      width: doc.page.width - 80,
      align: "center",
    });

  // =========================
  // RECEIPT TITLE
  // =========================

  doc
    .fillColor("#000000")
    .fontSize(21)
    .text("PAYMENT RECEIPT", 40, 115, {
      width: doc.page.width - 80,
      align: "center",
    });

  doc
    .fontSize(9)
    .fillColor("#555555")
    .text(`Receipt No: ${receiptNumber}`, 40, 145, {
      width: doc.page.width - 80,
      align: "right",
    });

  // =========================
  // STUDENT DETAILS
  // =========================

  doc
    .roundedRect(50, 170, 495, 75, 8)
    .fill("#EFF6FF");

  doc
    .fontSize(13)
    .fillColor("#1E3A8A")
    .text("STUDENT DETAILS", 70, 185);

  doc
    .fontSize(10.5)
    .fillColor("#000000")
    .text(
      `Student ID: ${payment.student.studentCode}`,
      70,
      210
    )
    .text(
      `Student Name: ${payment.student.name}`,
      70,
      228
    );

  // =========================
  // MEMBERSHIP DETAILS
  // =========================

  doc
    .roundedRect(50, 260, 495, 75, 8)
    .fill("#F0FDF4");

  doc
    .fontSize(13)
    .fillColor("#15803D")
    .text("MEMBERSHIP DETAILS", 70, 275);

  doc
    .fontSize(10.5)
    .fillColor("#000000")
    .text(
      `Membership Start: ${payment.membership.startDate.toDateString()}`,
      70,
      300
    )
    .text(
      `Membership Expiry: ${payment.membership.expiryDate.toDateString()}`,
      70,
      318
    );

  // =========================
  // PAYMENT DETAILS
  // =========================

  doc
    .roundedRect(50, 350, 495, 90, 8)
    .fill("#FFF7ED");

  doc
    .fontSize(13)
    .fillColor("#C2410C")
    .text("PAYMENT DETAILS", 70, 365);

  doc
    .fontSize(10.5)
    .fillColor("#000000")
    .text(
      `Payment Date: ${payment.paymentDate.toDateString()}`,
      70,
      390
    )
    .text(
      `Payment Method: ${payment.paymentMethod}`,
      70,
      408
    )
    .text(
      `Transaction Reference: ${
        payment.transactionReference ?? "N/A"
      }`,
      70,
      426
    );

  // =========================
  // PAYMENT SUMMARY
  // =========================

  doc
    .roundedRect(50, 455, 495, 80, 8)
    .fill("#F0FDF4");

  doc
    .fontSize(12)
    .fillColor("#166534")
    .text("PAYMENT STATUS", 70, 470);

  doc
    .fontSize(17)
    .fillColor("#15803D")
    .text("PAID", 70, 492);

  doc
    .fontSize(18)
    .fillColor("#15803D")
    .text(
      `INR ${Number(payment.amount).toFixed(2)}`,
      350,
      485,
      {
        width: 165,
        align: "right",
      }
    );

  // =========================
  // AUTHORIZED SIGNATURE
  // =========================

 const signaturePath = path.resolve(
  __dirname,
  "../../assets/national-library-signature.png"
);

  doc.image(signaturePath, 385, 545, {
    width: 120,
  });

  doc
    .fontSize(10)
    .fillColor("#000000")
    .text("Authorized Signature", 365, 595, {
      width: 160,
      align: "center",
    });

  doc
    .fontSize(10)
    .text("Abu Sahma", 365, 615, {
      width: 160,
      align: "center",
    });

  doc
    .fontSize(10)
    .text("Librarian / Manager", 365, 632, {
      width: 160,
      align: "center",
    });

  doc
    .fontSize(10)
    .text("National Library", 365, 649, {
      width: 160,
      align: "center",
    });

  // =========================
  // FOOTER
  // =========================

  doc
    .fontSize(10)
    .fillColor("#1E3A8A")
    .text(
      "Thank you for choosing National Library",
      40,
      710,
      {
        width: doc.page.width - 80,
        align: "center",
      }
    );

  doc
    .fontSize(8.5)
    .fillColor("#555555")
    .text(
      "Library open 24 × 7",
      40,
      730,
      {
        width: doc.page.width - 80,
        align: "center",
      }
    );

  doc
    .fontSize(8.5)
    .text(
      "This receipt is valid as proof of payment.",
      40,
      745,
      {
        width: doc.page.width - 80,
        align: "center",
      }
    );

  doc.end();

  return doc;
}