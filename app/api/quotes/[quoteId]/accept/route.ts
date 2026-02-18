import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createMagicLoginToken } from "@/lib/magic-login";
import { createReferralCommissionForOrder, ensureReferralSignup } from "@/lib/referrals";
import { hashToken } from "@/lib/quote-tokens";
import { sendAdminNotification } from "@/lib/email";
import { toNumber } from "@/lib/money";
import {
  CustomRequestStatus,
  MilestoneStatus,
  OrderStatus,
  Prisma,
  ProjectStatus,
  QuoteStatus,
  Role,
} from "@prisma/client";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ quoteId: string }>;
};

async function resolveServiceId() {
  const fallback = await prisma.service.findFirst({ where: { slug: "custom-project" } });
  if (fallback) return fallback.id;
  const anyService = await prisma.service.findFirst({ orderBy: { createdAt: "asc" } });
  return anyService?.id ?? null;
}

async function resolveQuoteByToken(token: string) {
  const hashed = hashToken(token);
  const now = new Date();
  const byMagicField = await prisma.quote.findFirst({
    where: { magicToken: hashed, expiresAt: { gt: now }, archivedAt: null },
    include: { customRequest: true },
  });
  if (byMagicField) return { quote: byMagicField, hashed };

  const viaAudit = await prisma.quote.findFirst({
    where: {
      status: { in: [QuoteStatus.SENT, QuoteStatus.DRAFT] },
      expiresAt: { gt: now },
      archivedAt: null,
      id: {
        in: await prisma.auditLog
          .findMany({
            where: {
              targetType: "QUOTE",
              action: "QUOTE_SENT",
              data: { path: ["tokenHash"], equals: hashed } as Prisma.JsonFilter,
            },
            select: { targetId: true },
          })
          .then((rows) => rows.map((r) => r.targetId).filter(Boolean) as string[]),
      },
    },
    include: { customRequest: true },
  });
  if (viaAudit) return { quote: viaAudit, hashed };
  return null;
}

function parsePhases(raw: Record<string, unknown>) {
  const phases = Array.isArray(raw.phases) ? raw.phases : [];
  return phases
    .map((phase, index) => {
      if (!phase || typeof phase !== "object") return null;
      const data = phase as {
        key?: string | null;
        group?: string | null;
        title?: string | null;
        description?: string | null;
        dueDate?: string | null;
        order?: number | null;
      };
      const group = (data.group ?? "REQUIREMENTS") as ProjectStatus;
      const title = data.title?.toString().trim() || `Phase ${index + 1}`;
      const order = typeof data.order === "number" ? data.order : index;
      return {
        key: data.key ?? `phase-${index + 1}`,
        group,
        title,
        description: data.description?.toString().trim() || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        order,
      };
    })
    .filter((phase): phase is NonNullable<typeof phase> => !!phase);
}

function parsePaymentSchedule(raw: Record<string, unknown>) {
  const payments = Array.isArray(raw.paymentSchedule) ? raw.paymentSchedule : [];
  return payments
    .map((payment, index) => {
      if (!payment || typeof payment !== "object") return null;
      const data = payment as {
        label?: string | null;
        amount?: number | string | null;
        dueDate?: string | null;
        beforePhaseKey?: string | null;
      };
      const amount =
        typeof data.amount === "number"
          ? data.amount
          : typeof data.amount === "string" && data.amount.trim()
            ? Number(data.amount)
            : null;
      if (!amount || Number.isNaN(amount) || amount <= 0) return null;
      return {
        label: data.label?.toString().trim() || `Payment ${index + 1}`,
        amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        beforePhaseKey: data.beforePhaseKey ?? null,
      };
    })
    .filter((payment): payment is NonNullable<typeof payment> => !!payment);
}

async function ensureUser(
  quote: { customRequest: { email: string; fullName: string; userId: string | null } },
  referralCode?: string | null,
) {
  const email = quote.customRequest.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const referrer = referralCode
      ? await prisma.user.findUnique({ where: { referralCode } })
      : null;
    user = await prisma.user.create({
      data: {
        email,
        name: quote.customRequest.fullName,
        role: Role.CLIENT,
        ...(referrer ? { referredById: referrer.id } : {}),
      },
    });
    if (referrer) {
      await ensureReferralSignup({ referrerId: referrer.id, referredUserId: user.id });
    }
  }
  if (!quote.customRequest.userId || quote.customRequest.userId !== user.id) {
    await prisma.customProjectRequest.update({
      where: { id: (quote as { customRequestId: string }).customRequestId },
      data: { userId: user.id },
    });
  }
  return user;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json().catch(() => ({}));
    const token = (body as { token?: string }).token ?? new URL(request.url).searchParams.get("token");
    const referralCode = cookies().get("gt_ref")?.value ?? null;
    const resolvedParams = await params;

    // Fallback to path parsing if params is missing
    const pathParts = new URL(request.url).pathname.split("/").filter(Boolean);
    const pathQuoteId = pathParts.length >= 3 ? pathParts[pathParts.length - 2] : null; // .../quotes/:id/accept
    const quoteId = resolvedParams?.quoteId ?? pathQuoteId ?? null;

    let quote: (typeof prisma.quote)["$inferSelect"] & { customRequest: { email: string; fullName: string; userId: string | null }; customRequestId: string } | null =
      quoteId
        ? await prisma.quote.findUnique({
            where: { id: quoteId },
            include: { customRequest: true },
          })
        : null;
    let tokenHash: string | null = null;

    if (!quote && token) {
      const resolved = await resolveQuoteByToken(token);
      if (resolved) {
        quote = resolved.quote;
        tokenHash = resolved.hashed;
      }
    }

    if (!quote) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (quote.archivedAt) {
      return NextResponse.json({ error: "Quote archived" }, { status: 400 });
    }
    if (!tokenHash && token) {
      tokenHash = hashToken(token);
    }

    if (quote.status === QuoteStatus.ACCEPTED) {
      return NextResponse.json({ error: "Quote already accepted" }, { status: 400 });
    }
    if (quote.status === QuoteStatus.REJECTED) {
      return NextResponse.json({ error: "Quote was rejected" }, { status: 400 });
    }
    if (quote.expiresAt <= new Date()) {
      return NextResponse.json({ error: "Quote expired" }, { status: 400 });
    }

    const sessionEmail = session?.user.email?.toLowerCase?.() ?? "";
    const quoteIdFromToken = (session?.user as { quoteId?: string | null })?.quoteId ?? null;
    const isOwner =
      (session && quote.customRequest.userId === session.user.id) ||
      (sessionEmail && quote.customRequest.email.toLowerCase() === sessionEmail) ||
      (quoteIdFromToken && quoteIdFromToken === quote.id);

    if (!session && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session && session.user.role !== "ADMIN" && session.user.role !== "PARTNER" && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const meta = await prisma.auditLog.findFirst({
      where: { targetId: quote.id, targetType: "QUOTE", action: "QUOTE_META" },
      orderBy: { createdAt: "desc" },
    });
    const parsedMeta = (meta?.data as Record<string, unknown> | null) ?? {};
    const metaServiceId =
      typeof parsedMeta.serviceId === "string" && parsedMeta.serviceId ? parsedMeta.serviceId : null;
    const phaseSeeds = parsePhases(parsedMeta);
    const paymentSeeds = parsePaymentSchedule(parsedMeta);
    const phaseDueByKey = new Map<string, Date | null>();
    phaseSeeds.forEach((phase) => {
      if (phase.key) {
        phaseDueByKey.set(phase.key, phase.dueDate ?? null);
      }
    });
    let serviceId = metaServiceId ?? (await resolveServiceId());
    if (serviceId) {
      const exists = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!exists) serviceId = await resolveServiceId();
    }
    if (!serviceId) {
      return NextResponse.json({ error: "No service configured", field: "serviceId" }, { status: 400 });
    }

    const user = await ensureUser(quote, referralCode);
    const userId = user.id;

    const order = await prisma.order.create({
      data: {
        userId,
        serviceId,
        totalAmount: quote.amount,
        status: OrderStatus.IN_PROGRESS,
      },
    });

    const project = await prisma.project.create({
      data: {
        orderId: order.id,
        title:
          (typeof parsedMeta.projectTitle === "string" && parsedMeta.projectTitle) ||
          `Custom project for ${quote.customRequest.fullName}`,
        description:
          (typeof parsedMeta.projectDescription === "string" && parsedMeta.projectDescription) || quote.scope,
      },
    });

    const phaseMap = new Map<string, string>();
    if (phaseSeeds.length > 0) {
      const createdPhases = await Promise.all(
        phaseSeeds.map((phase) =>
          prisma.projectPhase.create({
            data: {
              projectId: project.id,
              group: phase.group,
              title: phase.title,
              description: phase.description ?? null,
              dueDate: phase.dueDate ?? null,
              order: phase.order,
            },
          }),
        ),
      );
      createdPhases.forEach((phase, index) => {
        const key = phaseSeeds[index]?.key;
        if (key) {
          phaseMap.set(key, phase.id);
        }
      });

      const firstGroup =
        createdPhases
          .sort((a, b) => a.order - b.order)
          .map((phase) => phase.group)
          .find(Boolean) ?? null;
      if (firstGroup) {
        await prisma.project.update({
          where: { id: project.id },
          data: { status: firstGroup },
        });
      }
    }

    if (paymentSeeds.length > 0) {
      const payments = paymentSeeds.map((payment) => ({
        projectId: project.id,
        label: payment.label,
        amount: payment.amount,
        dueDate:
          payment.dueDate ??
          (payment.beforePhaseKey ? phaseDueByKey.get(payment.beforePhaseKey) ?? null : null),
        gatePhaseId: payment.beforePhaseKey ? phaseMap.get(payment.beforePhaseKey) ?? null : null,
        status: MilestoneStatus.PENDING,
      }));
      await prisma.milestonePayment.createMany({ data: payments });
    }

    await prisma.customProjectRequest.update({
      where: { id: quote.customRequestId },
      data: {
        orderId: order.id,
        status: CustomRequestStatus.CONVERTED_TO_ORDER,
        userId,
      },
    });

    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: QuoteStatus.ACCEPTED,
        acceptedAt: new Date(),
        magicToken: tokenHash ? `used:${tokenHash}` : quote.magicToken,
      },
    });

    const magic = await createMagicLoginToken({
      userId,
      email: user.email,
      targetType: "PROJECT",
      targetId: project.id,
      meta: { quoteId: quote.id, orderId: order.id, projectId: project.id },
    });

    await prisma.auditLog.createMany({
      data: [
        {
          actorId: session?.user.id ?? userId,
          action: "QUOTE_ACCEPTED",
          targetType: "QUOTE",
          targetId: quote.id,
          data: { orderId: order.id, projectId: project.id, magicLink: magic.token },
        },
        {
          actorId: session?.user.id ?? userId,
          action: "PROJECT_PLAN",
          targetType: "PROJECT",
          targetId: project.id,
          data: {
            phases: phaseSeeds,
            paymentSchedule: paymentSeeds,
          },
        },
        {
          actorId: session?.user.id ?? userId,
          action: "USER_ACTIVATED",
          targetType: "USER",
          targetId: userId,
          data: { source: "QUOTE_ACCEPTED", quoteId: quote.id },
        },
      ],
      skipDuplicates: true,
    });

    await createReferralCommissionForOrder({
      orderId: order.id,
      userId,
      orderTotal: toNumber(order.totalAmount),
    });

    await sendAdminNotification({
      subject: "Quote accepted",
      text: [
        `Client: ${user.email}`,
        `Quote ID: ${quote.id}`,
        `Order ID: ${order.id}`,
        `Project ID: ${project.id}`,
        `Amount: ${toNumber(order.totalAmount)}`,
      ].join("\n"),
    });

    return NextResponse.json({
      id: quote.id,
      status: QuoteStatus.ACCEPTED,
      orderId: order.id,
      projectId: project.id,
      magicLink: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/magic/order?token=${magic.token}`,
    });
  } catch (error) {
    console.error("[quote-accept]", error);
    const message = error instanceof Error ? error.message : "Failed to accept quote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
