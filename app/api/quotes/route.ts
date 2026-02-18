import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateMagicToken } from "@/lib/quote-tokens";
import { toNumber } from "@/lib/money";
import { QuoteStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isStaff = session.user.role === "ADMIN" || session.user.role === "PARTNER";
  const url = new URL(request.url);
  const includeArchived = url.searchParams.get("archived") === "1";
  const archiveFilter =
    isStaff && includeArchived
      ? { archivedAt: { not: null } }
      : { archivedAt: null };

  const emailFilter =
    session.user.email && session.user.email.length > 0
      ? { email: { equals: session.user.email, mode: "insensitive" as const } }
      : undefined;
  const quoteIdFromToken =
    (session.user as { quoteId?: string | null }).quoteId ?? null;

  const quotes = await prisma.quote.findMany({
    where:
      isStaff
        ? archiveFilter
        : {
            OR: [
              { customRequest: { userId: session.user.id } },
              ...(emailFilter ? [{ customRequest: emailFilter }] : []),
              ...(quoteIdFromToken ? [{ id: quoteIdFromToken }] : []),
            ],
            archivedAt: null,
          },
    include: { customRequest: true },
    orderBy: { createdAt: "desc" },
  });

  const metaLogs = await prisma.auditLog.findMany({
    where: {
      targetType: "QUOTE",
      action: "QUOTE_META",
      targetId: { in: quotes.map((q) => q.id) },
    },
    orderBy: { createdAt: "desc" },
  });
  const metaById = new Map<string, Record<string, unknown>>();
  for (const log of metaLogs) {
    if (!log.targetId) continue;
    if (!metaById.has(log.targetId)) {
      const raw = (log.data as Record<string, unknown> | null) ?? {};
      const paymentSchedule = Array.isArray((raw as { paymentSchedule?: unknown }).paymentSchedule)
        ? (raw as { paymentSchedule?: unknown }).paymentSchedule
        : [];
      const phases = Array.isArray((raw as { phases?: unknown }).phases)
        ? (raw as { phases?: unknown }).phases
        : [];
      metaById.set(log.targetId, { ...raw, paymentSchedule, phases });
    }
  }

  return NextResponse.json(
    quotes.map((quote) => ({
      id: quote.id,
      customRequestId: quote.customRequestId,
      amount: toNumber(quote.amount),
      currency: quote.currency,
      scope: quote.scope,
      status: quote.status,
      expiresAt: quote.expiresAt,
      sentAt: quote.sentAt,
      acceptedAt: quote.acceptedAt,
      rejectedAt: quote.rejectedAt,
      archivedAt: quote.archivedAt,
      createdAt: quote.createdAt,
      meta: metaById.get(quote.id) ?? null,
      request: {
        fullName: quote.customRequest.fullName,
        email: quote.customRequest.email,
        projectType: quote.customRequest.projectType,
        budgetRange: quote.customRequest.budgetRange,
        status: quote.customRequest.status,
      },
    })),
  );
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
    if (!session || !isStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      customRequestId?: string;
      amount?: number;
      currency?: string;
      scope?: string;
      expiresAt?: string;
      serviceId?: string | null;
      projectTitle?: string | null;
      projectDescription?: string | null;
      plan?: {
        deliveryEstimate?: string | null;
        timeline?: string | null;
        phases?: {
          key?: string | null;
          group?: string | null;
          title?: string | null;
          description?: string | null;
          dueDate?: string | null;
          order?: number | null;
        }[];
        paymentSchedule?: {
          label?: string | null;
          amount?: number | null;
          dueDate?: string | null;
          beforePhaseKey?: string | null;
        }[];
        paymentNotes?: string | null;
      };
    };

    if (!body.customRequestId) {
      return NextResponse.json({ error: "Custom request is required", field: "customRequestId" }, { status: 400 });
    }
    if (typeof body.amount !== "number" || Number.isNaN(body.amount) || body.amount <= 0) {
      return NextResponse.json({ error: "Amount is required", field: "amount" }, { status: 400 });
    }
    if (!body.scope) {
      return NextResponse.json({ error: "Scope/notes are required", field: "scope" }, { status: 400 });
    }

    const customRequest = await prisma.customProjectRequest.findUnique({
      where: { id: body.customRequestId },
    });

    if (!customRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const expiresAt =
      body.expiresAt && !Number.isNaN(Date.parse(body.expiresAt))
        ? new Date(body.expiresAt)
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    if (expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Expiration must be in the future", field: "expiresAt" }, { status: 400 });
    }

    const { hashed } = generateMagicToken();

    const created = await prisma.quote.create({
      data: {
        customRequestId: body.customRequestId,
        amount: body.amount,
        currency: body.currency ?? "USD",
        scope: body.scope,
        status: QuoteStatus.DRAFT,
        expiresAt,
        magicToken: hashed,
      },
      include: { customRequest: true },
    });

    const plan = body.plan ?? null;
    const paymentSchedule = Array.isArray(plan?.paymentSchedule)
      ? plan?.paymentSchedule
          ?.filter((p) => p && (p.label || p.amount || p.dueDate))
          .map((p) => {
            const rawAmount = (p as { amount?: unknown }).amount;
            const parsedAmount =
              typeof rawAmount === "number"
                ? rawAmount
                : typeof rawAmount === "string" && rawAmount.trim()
                  ? Number(rawAmount)
                  : undefined;
            const amount = typeof parsedAmount === "number" && !Number.isNaN(parsedAmount) ? parsedAmount : undefined;
            return { ...p, amount };
          })
      : [];
    const phases = Array.isArray(plan?.phases)
      ? plan?.phases
          .filter((phase) => phase && (phase.title || phase.description || phase.dueDate))
          .map((phase, index) => ({
            key: phase?.key ?? `phase-${index + 1}`,
            group: phase?.group ?? null,
            title: phase?.title ?? null,
            description: phase?.description ?? null,
            dueDate: phase?.dueDate ?? null,
            order: typeof phase?.order === "number" ? phase.order : index,
          }))
      : [];

    if (body.serviceId || body.projectTitle || body.projectDescription || plan) {
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "QUOTE_META",
          targetType: "QUOTE",
          targetId: created.id,
          data: {
            serviceId: body.serviceId,
            projectTitle: body.projectTitle,
            projectDescription: body.projectDescription,
            deliveryEstimate: plan?.deliveryEstimate,
            timeline: plan?.timeline,
            phases,
            paymentSchedule,
            paymentNotes: plan?.paymentNotes,
          },
        },
      });
    }

    return NextResponse.json({
      id: created.id,
      customRequestId: created.customRequestId,
      amount: toNumber(created.amount),
      currency: created.currency,
      scope: created.scope,
      status: created.status,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
      meta: {
        serviceId: body.serviceId,
        projectTitle: body.projectTitle,
        projectDescription: body.projectDescription,
        deliveryEstimate: plan?.deliveryEstimate,
        timeline: plan?.timeline,
        phases,
        paymentSchedule,
        paymentNotes: plan?.paymentNotes,
      },
      request: {
        fullName: created.customRequest.fullName,
        email: created.customRequest.email,
      },
    });
  } catch (error) {
    console.error("[quote-create]", error);
    return NextResponse.json({ error: "Failed to create quote" }, { status: 500 });
  }
}
