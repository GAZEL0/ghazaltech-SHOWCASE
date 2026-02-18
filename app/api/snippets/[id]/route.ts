import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim() ?? "";

  if (!id && !slug) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const snippet = await prisma.frontEndSnippet.findFirst({
    where: {
      status: "PUBLISHED",
      ...(id ? { id } : {}),
      ...(slug ? { slug } : {}),
    },
    include: { tags: { include: { tag: true } } },
  });

  if (!snippet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: snippet.id,
    title: snippet.title,
    description: snippet.description,
    slug: snippet.slug,
    html: snippet.html,
    css: snippet.css,
    js: snippet.js,
    status: snippet.status,
    createdAt: snippet.createdAt,
    updatedAt: snippet.updatedAt,
    tags: snippet.tags.map((rel) => ({
      name: rel.tag.name,
      category: rel.tag.category,
    })),
  });
}
