import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { calculateCommissionBreakdown } from "@/lib/referrals";
import { toNumber } from "@/lib/money";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tracks = await prisma.referralTracking.findMany({
    include: {
      referrer: true,
      referredUser: true,
      order: { include: { projects: { include: { milestonePayments: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    tracks.map((track: typeof tracks[number]) => {
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

      return {
        id: track.id,
        status: track.status,
        commissionAmount,
        commissionRate: track.commissionRate,
        commissionPaidOut,
        available: breakdown.available,
        pending: breakdown.pending,
        referrerEmail: track.referrer.email,
        referrerId: track.referrerId,
        referredUser: track.referredUser
          ? {
              id: track.referredUser.id,
              email: track.referredUser.email,
              name: track.referredUser.name,
            }
          : null,
        orderId: track.orderId,
        orderTotal,
        paidAmount,
        createdAt: track.createdAt,
      };
    }),
  );
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    status?: "PENDING" | "EARNED" | "PAID_OUT";
    commissionAmount?: number;
    action?: "pay-out";
  };

  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (body.action === "pay-out") {
    const track = await prisma.referralTracking.findUnique({
      where: { id: body.id },
      include: { order: { include: { projects: { include: { milestonePayments: true } } } } },
    });
    if (!track) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    const nextPaidOut = commissionPaidOut + breakdown.available;
    const updated = await prisma.referralTracking.update({
      where: { id: body.id },
      data: {
        commissionPaidOut: nextPaidOut,
        status: nextPaidOut >= commissionAmount ? "PAID_OUT" : "EARNED",
      },
    });
    return NextResponse.json({
      ...updated,
      commissionAmount: toNumber(updated.commissionAmount),
      commissionPaidOut: toNumber(updated.commissionPaidOut),
    });
  }

  const updated = await prisma.referralTracking.update({
    where: { id: body.id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(typeof body.commissionAmount === "number"
        ? { commissionAmount: body.commissionAmount }
        : {}),
    },
  });

  return NextResponse.json({
    ...updated,
    commissionAmount: toNumber(updated.commissionAmount),
    commissionPaidOut: toNumber(updated.commissionPaidOut),
  });
}
