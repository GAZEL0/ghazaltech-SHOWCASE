import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local", override: false });

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Set it in .env.local or your environment before seeding.");
  }

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.ADMIN_NAME ?? "Admin";
  const adminReferralCode = process.env.ADMIN_REFERRAL_CODE ?? "ADMIN-DEMO";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: Role.ADMIN,
      passwordHash: adminHash,
      referralCode: adminReferralCode,
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: Role.ADMIN,
      passwordHash: adminHash,
      referralCode: adminReferralCode,
    },
  });

  console.log(`Seed completed for ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
