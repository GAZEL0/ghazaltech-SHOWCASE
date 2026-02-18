import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email";
import { toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: { templateId: string };
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const body = (await request.json().catch(() => ({}))) as {
      fullName?: string;
      email?: string;
      addOns?: { title?: string; amount?: number }[];
      notes?: string;
    };

    const email = body.email?.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required", field: "email" }, { status: 400 });
    }

    const template = await prisma.templateSite.findUnique({
      where: { id: params.templateId },
    });

    if (!template || !template.isActive) {
      return NextResponse.json({ error: "Template not available" }, { status: 404 });
    }

    const cleanAddOns =
      Array.isArray(body.addOns) && body.addOns.length > 0
        ? body.addOns
            .filter((a) => a?.title && typeof a.amount === "number" && !Number.isNaN(a.amount))
            .map((a) => ({ title: a.title as string, amount: Number(a.amount) }))
        : [];

    const basePrice = toNumber(template.basePrice);
    const totalAmount = basePrice + cleanAddOns.reduce((sum, addOn) => sum + Number(addOn.amount), 0);

    const detailLines = [
      `Template: ${template.title}`,
      `Slug: ${template.slug}`,
      template.demoUrl ? `Demo: ${template.demoUrl}` : null,
      `Base price: ${basePrice} ${template.currency}`,
      cleanAddOns.length > 0
        ? `Add-ons: ${cleanAddOns.map((addOn) => `${addOn.title} (${addOn.amount})`).join(", ")}`
        : "Add-ons: none",
      `Estimated total: ${totalAmount} ${template.currency}`,
      body.notes ? `Notes: ${body.notes}` : null,
    ].filter(Boolean);

    const created = await prisma.customProjectRequest.create({
      data: {
        userId: session?.user?.id ?? null,
        fullName: body.fullName || template.title,
        email,
        projectType: `Template: ${template.title}`,
        budgetRange: `${template.currency} ${totalAmount.toFixed(2)}`,
        referenceLinks: template.demoUrl ?? null,
        details: detailLines.join("\n"),
      },
    });

    await sendAdminNotification({
      subject: "New template request",
      text: [
        `Template: ${template.title}`,
        `Client: ${body.fullName ?? "-"}`,
        `Email: ${email}`,
        `Estimated total: ${totalAmount} ${template.currency}`,
        `Request ID: ${created.id}`,
      ].join("\n"),
    });

    return NextResponse.json({
      requestId: created.id,
      status: created.status,
    });
  } catch (error) {
    console.error("[template-order]", error);
    return NextResponse.json({ error: "Unable to create template order" }, { status: 500 });
  }
}
