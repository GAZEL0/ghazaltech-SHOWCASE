import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { toNumber } from "@/lib/money";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  const url = new URL(request.url);
  const includeInactive =
    url.searchParams.get("includeInactive") === "true" &&
    isStaff;

  const services = await prisma.service.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(
    services.map((service) => ({
      id: service.id,
      title: service.title,
      slug: service.slug,
      description: service.description,
      priceBase: toNumber(service.priceBase),
      isActive: service.isActive,
    })),
  );
}
