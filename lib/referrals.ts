import { prisma } from "@/lib/db";

type CommissionBreakdown = {
  available: number;
  pending: number;
  availableTotal: number;
};

export function calculateCommissionBreakdown(params: {
  commissionAmount: number;
  commissionPaidOut: number;
  orderTotal: number;
  paidAmount: number;
}): CommissionBreakdown {
  const { commissionAmount, commissionPaidOut, orderTotal, paidAmount } = params;
  const ratio = orderTotal > 0 ? Math.min(paidAmount / orderTotal, 1) : 0;
  const availableTotal = commissionAmount * ratio;
  const available = Math.max(availableTotal - commissionPaidOut, 0);
  const pending = Math.max(commissionAmount - availableTotal, 0);
  return { available, pending, availableTotal };
}

export async function ensureReferralSignup(params: {
  referrerId: string;
  referredUserId: string;
}) {
  const { referrerId, referredUserId } = params;
  const existing = await prisma.referralTracking.findFirst({
    where: { referrerId, referredUserId, orderId: null },
  });
  if (existing) return existing;

  const referrer = await prisma.user.findUnique({
    where: { id: referrerId },
    select: { referralCommissionRate: true },
  });
  const rate = referrer?.referralCommissionRate ?? 0.1;

  return prisma.referralTracking.create({
    data: {
      referrerId,
      referredUserId,
      status: "PENDING",
      commissionAmount: 0,
      commissionRate: rate,
    },
  });
}

export async function createReferralCommissionForOrder(params: {
  orderId: string;
  userId: string;
  orderTotal: number;
}) {
  const { orderId, userId, orderTotal } = params;
  const referredUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { referredById: true },
  });
  if (!referredUser?.referredById || referredUser.referredById === userId) {
    return null;
  }

  const existing = await prisma.referralTracking.findFirst({ where: { orderId } });
  if (existing) return existing;

  const referrer = await prisma.user.findUnique({
    where: { id: referredUser.referredById },
    select: { referralCommissionRate: true },
  });
  if (!referrer) return null;

  const rate = referrer.referralCommissionRate ?? 0.1;
  const commissionAmount = Math.round(orderTotal * rate * 100) / 100;

  return prisma.referralTracking.create({
    data: {
      referrerId: referredUser.referredById,
      referredUserId: userId,
      orderId,
      commissionAmount,
      commissionRate: rate,
      status: "EARNED",
    },
  });
}
