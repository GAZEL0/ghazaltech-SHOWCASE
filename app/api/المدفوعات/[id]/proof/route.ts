import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadProofImage } from "@/lib/cloudinary";
import { MilestoneStatus } from "@prisma/client";
import { toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const payment = await prisma.milestonePayment.findUnique({
      where: { id },
      include: { project: { include: { order: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      session.user.role === "CLIENT" &&
      payment.project.order.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const upload = await uploadProofImage(buffer);

    const updated = await prisma.milestonePayment.update({
      where: { id },
      data: {
        proofUrl: upload.url,
        status: MilestoneStatus.UNDER_REVIEW,
      },
      include: { project: true },
    });

    return NextResponse.json({
      ...updated,
      amount: toNumber(updated.amount),
    });
  } catch (error) {
    console.error("Upload proof error", error);
    return NextResponse.json(
      { error: "Upload failed", message: (error as Error).message },
      { status: 500 },
    );
  }
}
