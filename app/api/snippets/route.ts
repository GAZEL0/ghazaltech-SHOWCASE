import { prisma } from "@/lib/db";
import { normalizeTagName } from "@/lib/snippets";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const rawTags = searchParams.get("tags") ?? "";
  const tags = rawTags
    .split(",")
    .map(normalizeTagName)
    .filter(Boolean);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || 9), 3), 24);
  const skip = (page - 1) * pageSize;

  const filters: Prisma.FrontEndSnippetWhereInput[] = [];
  if (search) {
    filters.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { some: { tag: { name: { contains: search, mode: "insensitive" } } } } },
      ],
    });
  }
  if (tags.length > 0) {
    filters.push({
      tags: { some: { tag: { name: { in: tags } } } },
    });
  }

  const where: Prisma.FrontEndSnippetWhereInput = {
    status: "PUBLISHED",
    ...(filters.length > 0 ? { AND: filters } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.frontEndSnippet.count({ where }),
    prisma.frontEndSnippet.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      include: { tags: { include: { tag: true } } },
    }),
  ]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return NextResponse.json({
    page,
    pageSize,
    total,
    totalPages,
    items: items.map((snippet) => ({
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
    })),
  });
}
