import { NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    locale?: string;
  };

  const name = body.name?.trim();
  const email = body.email?.trim();
  const subject = body.subject?.trim();
  const message = body.message?.trim();
  const locale = body.locale?.trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await sendAdminNotification({
    subject: subject ? `New contact: ${subject}` : "New contact message",
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Locale: ${locale ?? "-"}`,
      `Subject: ${subject || "-"}`,
      "Message:",
      message,
    ].join("\n"),
  });

  return NextResponse.json({ ok: true });
}
