import { prisma } from "@/lib/db";
import { ensureReferralSignup } from "@/lib/referrals";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string | null;
    phone?: string | null;
    email?: string;
    password?: string;
    referralCode?: string | null;
  };
  const email = body.email?.toLowerCase().trim();
  const phone = body.phone?.toString().trim() || null;
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing && existing.passwordHash) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const referralCode =
    body.referralCode?.toString().trim() || cookies().get("gt_ref")?.value || null;
  const referrer = referralCode
    ? await prisma.user.findUnique({ where: { referralCode } })
    : null;

  const user = existing
    ? await prisma.user.update({
        where: { email },
        data: { name: body.name ?? existing.name, phone: phone || existing.phone, passwordHash },
      })
    : await prisma.user.create({
        data: {
          email,
          name: body.name ?? null,
          phone,
          passwordHash,
          role: Role.CLIENT,
          ...(referrer ? { referredById: referrer.id } : {}),
        },
      });

  if (
    referrer &&
    referrer.id !== user.id &&
    (!user.referredById || user.referredById === referrer.id)
  ) {
    if (!user.referredById) {
      await prisma.user.update({
        where: { id: user.id },
        data: { referredById: referrer.id },
      });
    }
    await ensureReferralSignup({ referrerId: referrer.id, referredUserId: user.id });
  }

  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
