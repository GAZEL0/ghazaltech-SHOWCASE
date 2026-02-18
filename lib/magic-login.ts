import { prisma } from "@/lib/db";
import { generateMagicToken } from "@/lib/quote-tokens";

export async function createMagicLoginToken(params: {
  userId: string;
  email: string;
  targetType: string;
  targetId?: string | null;
  expiresAt?: Date;
  meta?: Record<string, unknown>;
}) {
  const { token, hashed } = generateMagicToken();
  const normalizedEmail = params.email.toLowerCase();
  const expiresAt =
    params.expiresAt && params.expiresAt.getTime() > Date.now()
      ? params.expiresAt
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // default 3 days

  await prisma.auditLog.create({
    data: {
      actorId: params.userId,
      action: "MAGIC_LOGIN",
      targetType: params.targetType,
      targetId: params.targetId ?? undefined,
      data: {
        tokenHash: hashed,
        email: normalizedEmail,
        userId: params.userId,
        expiresAt: expiresAt.toISOString(),
        meta: params.meta ?? {},
      },
    },
  });

  return { token, hashed, expiresAt };
}
