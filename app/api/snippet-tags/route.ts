import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const tags = await prisma.snippetTag.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(
    tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      category: tag.category,
    })),
  );
}
