import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { uploadProjectImage } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ projectId: string; phaseId: string }>;
};

async function ensureAccess(projectId: string, session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session) return null;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { order: true },
  });
  if (!project) return null;
  if (session.user.role === "ADMIN" || session.user.role === "PARTNER") return project;
  if (project.order.userId !== session.user.id) return null;
  return project;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId, phaseId } = await params;
  const session = await getServerSession(authOptions);
  const project = await ensureAccess(projectId, session);
  if (!project) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phase = await prisma.projectPhase.findFirst({
    where: { id: phaseId, projectId },
  });
  if (!phase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let bodyText = "";
  let attachmentUrl: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    bodyText = (formData.get("body") as string | null)?.toString().trim() ?? "";
    const file = formData.get("file");
    if (file && file instanceof Blob) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const upload = await uploadProjectImage(buffer);
      attachmentUrl = upload.url;
    }
  } else {
    const body = (await request.json()) as { body?: string };
    bodyText = body.body?.toString().trim() ?? "";
  }

  if (!bodyText && !attachmentUrl) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  const comment = await prisma.phaseComment.create({
    data: {
      phaseId,
      authorId: session?.user.id ?? null,
      body: bodyText || "Attachment",
    },
  });

  if (attachmentUrl) {
    await prisma.phaseCommentAsset.create({
      data: {
        commentId: comment.id,
        url: attachmentUrl,
      },
    });
  }

  const created = await prisma.phaseComment.findUnique({
    where: { id: comment.id },
    include: { author: true, attachments: true },
  });

  await sendAdminNotification({
    subject: "New project comment",
    text: [
      `Project ID: ${projectId}`,
      `Phase: ${phase.title}`,
      `By: ${created?.author?.email ?? "Unknown"}`,
      `Comment: ${bodyText || "Attachment"}`,
    ].join("\n"),
  });

  return NextResponse.json(created);
}
