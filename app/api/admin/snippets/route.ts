import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { normalizeTagName, slugifySnippet, SnippetTagCategory } from "@/lib/snippets";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TAG_LIMIT = 12;

function isCategory(value: string): value is SnippetTagCategory {
  return [
    "COMPONENT",
    "STYLE",
    "INTERACTION",
    "LAYOUT",
    "TECH",
    "COLOR",
    "USE_CASE",
  ].includes(value);
}

function parseTags(tags: { name?: string; category?: string }[] | undefined) {
  if (!tags || !Array.isArray(tags)) return [];
  const seen = new Set<string>();
  const normalized = tags
    .map((tag) => {
      const name = normalizeTagName(tag?.name ?? "");
      const category = tag?.category ?? "";
      if (!name || !isCategory(category)) return null;
      const key = `${category}:${name}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return { name, category };
    })
    .filter(Boolean) as { name: string; category: SnippetTagCategory }[];
  return normalized.slice(0, TAG_LIMIT);
}

async function ensureUniqueSlug(base: string, excludeId?: string) {
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.frontEndSnippet.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const rawTags = searchParams.get("tags") ?? "";
  const tags = rawTags
    .split(",")
    .map(normalizeTagName)
    .filter(Boolean);
  const status = searchParams.get("status")?.toUpperCase() ?? "ALL";
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || 20), 5), 50);
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
    ...(status === "DRAFT" || status === "PUBLISHED" ? { status } : {}),
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string | null;
    html?: string;
    css?: string;
    js?: string;
    status?: "DRAFT" | "PUBLISHED";
    slug?: string;
    tags?: { name?: string; category?: string }[];
  };

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const html = body.html ?? "";
  const css = body.css ?? "";
  const js = body.js ?? "";

  const rawSlug = body.slug?.trim() || slugifySnippet(title);
  const slug = await ensureUniqueSlug(rawSlug);

  const tags = parseTags(body.tags);
  if (body.tags && tags.length === 0) {
    return NextResponse.json({ error: "Tags are invalid" }, { status: 400 });
  }

  const tagRecords = await Promise.all(
    tags.map((tag) =>
      prisma.snippetTag.upsert({
        where: {
          name_category: {
            name: tag.name,
            category: tag.category,
          },
        },
        update: {},
        create: { name: tag.name, category: tag.category },
      }),
    ),
  );

  const created = await prisma.frontEndSnippet.create({
    data: {
      title,
      description: body.description?.trim() || null,
      html,
      css,
      js,
      status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      slug,
      tags: {
        create: tagRecords.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  return NextResponse.json({
    id: created.id,
    title: created.title,
    description: created.description,
    slug: created.slug,
    html: created.html,
    css: created.css,
    js: created.js,
    status: created.status,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    tags: created.tags.map((rel) => ({
      name: rel.tag.name,
      category: rel.tag.category,
    })),
  });
}
