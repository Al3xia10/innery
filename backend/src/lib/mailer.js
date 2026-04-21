import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

function isMailConfigured() {
  return Boolean(env.mail.host && env.mail.user && env.mail.pass && env.mail.from);
}

function getTransporter() {
  if (!isMailConfigured()) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: {
      user: env.mail.user,
      pass: env.mail.pass,
    },
  });

  return transporter;
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const tx = getTransporter();
  if (!tx) {
    throw new Error(
      "Serviciul de email nu este configurat. Seteaza SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.",
    );
  }

  const subject = "Reseteaza parola contului tau Innery";
  const text = [
    "Salut,",
    "",
    "Am primit o cerere de resetare a parolei pentru contul tau Innery.",
    `Deschide acest link (valabil 1 ora): ${resetUrl}`,
    "",
    "Daca nu ai cerut aceasta schimbare, poti ignora acest email.",
    "",
    "Echipa Innery",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2 style="margin-bottom: 12px;">Reseteaza parola contului tau Innery</h2>
      <p>Am primit o cerere de resetare a parolei pentru contul tau.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 14px;background:#e679b8;color:#fff;text-decoration:none;border-radius:8px;">
          Reseteaza parola
        </a>
      </p>
      <p style="font-size: 13px; color:#555;">Link-ul este valabil 1 ora.</p>
      <p style="font-size: 13px; color:#555;">Daca nu ai cerut aceasta schimbare, ignora emailul.</p>
    </div>
  `;

  await tx.sendMail({
    from: env.mail.from,
    to,
    subject,
    text,
    html,
  });
}

