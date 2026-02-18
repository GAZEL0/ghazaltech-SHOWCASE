import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.customProjectRequest.findMany({
    include: { user: true, order: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    requests.map((req) => ({
      id: req.id,
      fullName: req.fullName,
      email: req.email,
      phone: req.phone,
      companyName: req.companyName,
      businessType: req.businessType,
      projectType: req.projectType,
      languages: req.languages,
      hasDomain: req.hasDomain,
      hasHosting: req.hasHosting,
      budgetRange: req.budgetRange,
      timeline: req.timeline,
      referenceLinks: req.referenceLinks,
      details: req.details,
      status: req.status,
      userId: req.userId,
      orderId: req.orderId,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
    })),
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = (await request.json()) as {
    fullName?: string;
    email?: string;
    phone?: string | null;
    companyName?: string | null;
    businessType?: string | null;
    projectType?: string | null;
    languages?: string | null;
    hasDomain?: boolean | null;
    hasHosting?: boolean | null;
    budgetRange?: string | null;
    timeline?: string | null;
    referenceLinks?: string | null;
    details?: string;
  };

  if (!body.fullName || !body.email || !body.details) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const created = await prisma.customProjectRequest.create({
    data: {
      userId: session?.user.id ?? null,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone ?? null,
      companyName: body.companyName ?? null,
      businessType: body.businessType ?? null,
      projectType: body.projectType ?? null,
      languages: body.languages ?? null,
      hasDomain: body.hasDomain ?? null,
      hasHosting: body.hasHosting ?? null,
      budgetRange: body.budgetRange ?? null,
      timeline: body.timeline ?? null,
      referenceLinks: body.referenceLinks ?? null,
      details: body.details,
    },
  });

  await sendAdminNotification({
    subject: "New custom project request",
    text: [
      `Name: ${created.fullName}`,
      `Email: ${created.email}`,
      `Phone: ${created.phone ?? "-"}`,
      `Company: ${created.companyName ?? "-"}`,
      `Project type: ${created.projectType ?? "-"}`,
      `Budget: ${created.budgetRange ?? "-"}`,
      `Timeline: ${created.timeline ?? "-"}`,
      `Details: ${created.details}`,
    ].join("\n"),
  });

  return NextResponse.json(created);
}
