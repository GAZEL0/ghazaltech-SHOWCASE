import { Prisma } from "@prisma/client";

export type MoneyInput = Prisma.Decimal | number | string | null | undefined;

export function toNumber(value: MoneyInput): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}
