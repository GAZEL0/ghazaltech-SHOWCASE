import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { normalizeTagName, slugifySnippet, SnippetTagCategory } from "@/lib/snippets";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

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

async function ensureUniqueSlug(base: string, excludeId: string) {
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.frontEndSnippet.findFirst({
      where: { slug, id: { not: excludeId } },
      select: { id: true },
    });
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const snippet = await prisma.frontEndSnippet.findUnique({
    where: { id },
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

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.frontEndSnippet.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    data.title = title;
  }
  if (body.description !== undefined) {
    data.description = body.description?.trim() || null;
  }
  if (body.html !== undefined) data.html = body.html;
  if (body.css !== undefined) data.css = body.css;
  if (body.js !== undefined) data.js = body.js;
  if (body.status) {
    data.status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  }

  if (body.slug !== undefined) {
    const rawSlug = body.slug.trim() || slugifySnippet(String(body.title ?? existing.title));
    data.slug = await ensureUniqueSlug(rawSlug, id);
  }

  const tags = body.tags ? parseTags(body.tags) : null;
  if (body.tags && tags.length === 0) {
    return NextResponse.json({ error: "Tags are invalid" }, { status: 400 });
  }

  if (!tags) {
    const updated = await prisma.frontEndSnippet.update({
      where: { id },
      data,
      include: { tags: { include: { tag: true } } },
    });
    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      slug: updated.slug,
      html: updated.html,
      css: updated.css,
      js: updated.js,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      tags: updated.tags.map((rel) => ({
        name: rel.tag.name,
        category: rel.tag.category,
      })),
    });
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

  const [, updated] = await prisma.$transaction([
    prisma.frontEndSnippetTag.deleteMany({ where: { snippetId: id } }),
    prisma.frontEndSnippet.update({
      where: { id },
      data: {
        ...(data as object),
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: { tags: { include: { tag: true } } },
    }),
  ]);

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    slug: updated.slug,
    html: updated.html,
    css: updated.css,
    js: updated.js,
    status: updated.status,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    tags: updated.tags.map((rel) => ({
      name: rel.tag.name,
      category: rel.tag.category,
    })),
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.frontEndSnippet.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.frontEndSnippetTag.deleteMany({ where: { snippetId: id } }),
    prisma.frontEndSnippet.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
