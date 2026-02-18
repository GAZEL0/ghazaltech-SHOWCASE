import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { uploadProjectImage } from "@/lib/cloudinary";
import { PhaseAssetType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ projectId: string; phaseId: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId, phaseId } = await params;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phase = await prisma.projectPhase.findFirst({
    where: { id: phaseId, projectId },
  });
  if (!phase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const label = formData.get("label");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await uploadProjectImage(buffer);
    const created = await prisma.phaseAsset.create({
      data: {
        phaseId,
        type: PhaseAssetType.IMAGE,
        url: upload.url,
        label: typeof label === "string" && label.trim() ? label.trim() : null,
        createdById: session.user.id,
      },
    });
    return NextResponse.json(created);
  }

  const body = (await request.json()) as { url?: string; label?: string };
  if (!body.url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const created = await prisma.phaseAsset.create({
    data: {
      phaseId,
      type: PhaseAssetType.LINK,
      url: body.url,
      label: body.label ?? null,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(created);
}
