import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { calculateCommissionBreakdown } from "@/lib/referrals";
import { toNumber } from "@/lib/money";
import { ReferralStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function buildReferralSummary(userId: string) {
  const tracks = await prisma.referralTracking.findMany({
    where: { referrerId: userId },
    include: {
      referredUser: true,
      order: {
        include: { projects: { include: { milestonePayments: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let earned = 0;
  let available = 0;
  let pending = 0;
  const referralUsers = new Set<string>();
  const items = tracks.map((track) => {
    if (track.referredUserId) {
      referralUsers.add(track.referredUserId);
    }

    const orderTotal = track.order ? toNumber(track.order.totalAmount) : 0;
    const paidAmount = track.order
      ? track.order.projects
          .flatMap((project) => project.milestonePayments)
          .filter((payment) => payment.status === "APPROVED")
          .reduce((sum, payment) => sum + toNumber(payment.amount), 0)
      : 0;
    const commissionAmount = toNumber(track.commissionAmount);
    const commissionPaidOut = toNumber(track.commissionPaidOut);
    const breakdown = calculateCommissionBreakdown({
      commissionAmount,
      commissionPaidOut,
      orderTotal,
      paidAmount,
    });

    earned += commissionAmount;
    available += breakdown.available;
    pending += breakdown.pending;

    return {
      id: track.id,
      status: track.status,
      commissionAmount,
      commissionRate: track.commissionRate,
      commissionPaidOut,
      available: breakdown.available,
      pending: breakdown.pending,
      referrerId: track.referrerId,
      referredUser: track.referredUser
        ? {
            id: track.referredUser.id,
            name: track.referredUser.name,
            email: track.referredUser.email,
          }
        : null,
      orderId: track.orderId,
      orderTotal,
      paidAmount,
      createdAt: track.createdAt,
    };
  });

  return {
    referrals: referralUsers.size,
    earned,
    available,
    pending,
    items,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let referralCode = session.user.referralCode;
  if (!referralCode) {
    referralCode = Math.random().toString(36).slice(2, 8);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode },
    });
  }

  const summary = await buildReferralSummary(session.user.id);

  const link = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/?ref=${referralCode}`;

  return NextResponse.json({
    link,
    ...summary,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { action?: string };
  if (body.action === "request-payout") {
    const tracks = await prisma.referralTracking.findMany({
      where: { referrerId: session.user.id },
      include: {
        order: {
          include: { projects: { include: { milestonePayments: true } } },
        },
      },
    });

    for (const track of tracks) {
      if (!track.order || toNumber(track.commissionAmount) <= 0) continue;
      const paidAmount = track.order.projects
        .flatMap((project) => project.milestonePayments)
        .filter((payment) => payment.status === "APPROVED")
        .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
      const commissionAmount = toNumber(track.commissionAmount);
      const commissionPaidOut = toNumber(track.commissionPaidOut);
      const breakdown = calculateCommissionBreakdown({
        commissionAmount,
        commissionPaidOut,
        orderTotal: toNumber(track.order.totalAmount),
        paidAmount,
      });

      if (breakdown.available <= 0) continue;
      const nextPaidOut = commissionPaidOut + breakdown.available;
      await prisma.referralTracking.update({
        where: { id: track.id },
        data: {
          commissionPaidOut: nextPaidOut,
          status: nextPaidOut >= commissionAmount ? ReferralStatus.PAID_OUT : ReferralStatus.EARNED,
        },
      });
    }

    const summary = await buildReferralSummary(session.user.id);
    return NextResponse.json(summary);
  }

  return NextResponse.json({ ok: true });
}
