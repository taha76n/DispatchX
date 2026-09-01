import { createTransport } from "nodemailer";
import { config } from "../../configs/index.js";

const transporter = createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
  return await transporter.sendMail({
    from: config.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};
