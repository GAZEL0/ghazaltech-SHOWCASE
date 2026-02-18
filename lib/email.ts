import nodemailer from "nodemailer";

type AdminNotification = {
  subject: string;
  text: string;
  html?: string;
};

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export async function sendAdminNotification({ subject, text, html }: AdminNotification) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const transport = getTransport();

  if (!to || !from || !transport) {
    console.warn("[email] Missing SMTP configuration or admin recipient.");
    return;
  }

  try {
    await transport.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("[email] Failed to send admin notification.", error);
  }
}
