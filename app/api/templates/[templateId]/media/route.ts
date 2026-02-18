import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { uploadTemplateImage } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: { templateId: string };
};

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const template = await prisma.templateSite.findUnique({
    where: { id: params.templateId },
  });

  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const label = formData.get("label")?.toString() ?? null;

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const upload = await uploadTemplateImage(buffer);

  const media = await prisma.templateMedia.create({
    data: {
      templateId: template.id,
      url: upload.url,
      publicId: upload.publicId,
      label,
    },
  });

  if (!template.thumbUrl) {
    await prisma.templateSite.update({
      where: { id: template.id },
      data: { thumbUrl: upload.url },
    });
  }

  return NextResponse.json(media);
}
