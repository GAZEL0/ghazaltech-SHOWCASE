import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { CustomRequestStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email";

const PLAN_PREFIX = "SUPPORT_PLAN:";
const PLAN_KEYS = new Set(["CARE", "CARE_PLUS", "GROWTH", "AUDIT"]);

function normalizePlan(value?: string | null) {
  if (!value) return null;
  const key = value.toUpperCase();
  return PLAN_KEYS.has(key) ? key : null;
}

function parsePlan(projectType?: string | null) {
  if (!projectType) return null;
  if (projectType.startsWith(PLAN_PREFIX)) {
    const key = projectType.slice(PLAN_PREFIX.length);
    return normalizePlan(key);
  }
  return null;
}

function mapSupportRequest(request: {
  id: string;
  fullName: string;
  email: string;
  companyName: string | null;
  businessType: string | null;
  projectType: string | null;
  referenceLinks: string | null;
  languages: string | null;
  details: string;
  status: CustomRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: request.id,
    plan: parsePlan(request.projectType),
    projectName: request.companyName,
    projectType: request.businessType,
    siteUrl: request.referenceLinks,
    builtByUs: request.languages === "YES",
    notes: request.details,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    client: {
      name: request.fullName,
      email: request.email,
    },
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where =
    session.user.role === "ADMIN" || session.user.role === "PARTNER"
      ? { projectType: { startsWith: PLAN_PREFIX } }
      : { userId: session.user.id, projectType: { startsWith: PLAN_PREFIX } };

  const requests = await prisma.customProjectRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests.map(mapSupportRequest));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    plan?: string;
    projectName?: string;
    siteUrl?: string | null;
    projectType?: string | null;
    builtByUs?: boolean;
    notes?: string | null;
  };

  const plan = normalizePlan(body.plan);
  if (!plan || !body.projectName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const created = await prisma.customProjectRequest.create({
    data: {
      userId: session.user.id,
      fullName: session.user.name ?? session.user.email,
      email: session.user.email,
      projectType: `${PLAN_PREFIX}${plan}`,
      companyName: body.projectName,
      businessType: body.projectType ?? null,
      referenceLinks: body.siteUrl ?? null,
      languages: typeof body.builtByUs === "boolean" ? (body.builtByUs ? "YES" : "NO") : null,
      details: body.notes?.trim() || "Support plan request",
    },
  });

  await sendAdminNotification({
    subject: "New support plan request",
    text: [
      `Client: ${created.fullName}`,
      `Email: ${created.email}`,
      `Plan: ${plan}`,
      `Project: ${created.companyName ?? "-"}`,
      `Project type: ${created.businessType ?? "-"}`,
      `Site URL: ${created.referenceLinks ?? "-"}`,
      `Built by us: ${created.languages === "YES" ? "Yes" : created.languages === "NO" ? "No" : "-"}`,
      `Notes: ${created.details}`,
    ].join("\n"),
  });

  return NextResponse.json(mapSupportRequest(created));
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    status?: CustomRequestStatus;
  };

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const updated = await prisma.customProjectRequest.update({
    where: { id: body.id },
    data: { status: body.status },
  });

  return NextResponse.json(mapSupportRequest(updated));
}
