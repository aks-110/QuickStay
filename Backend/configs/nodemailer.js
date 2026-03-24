import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error(
      " NODEMAILER ERROR: Cannot connect to Brevo SMTP ->",
      error.message,
    );
  } else {
    console.log(" NODEMAILER READY: Server is ready to send emails!");
  }
});

export default transporter;
