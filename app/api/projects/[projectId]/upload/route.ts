import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadProjectImage } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ projectId: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { order: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isStaff = session.user.role === "ADMIN" || session.user.role === "PARTNER";
  if (!isStaff && project.order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const upload = await uploadProjectImage(buffer);

  const media = await prisma.projectMedia.create({
    data: {
      projectId: project.id,
      url: upload.url,
      publicId: upload.publicId,
    },
  });

  return NextResponse.json(media);
}
