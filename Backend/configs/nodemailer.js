import nodemailer from "nodemailer";
import "dotenv/config";

// OPTION 1: BREVO (Try Port 465 if 587 times out)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587, // Changed from 587 to 465 (Secure)s
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});



export default transporter ;