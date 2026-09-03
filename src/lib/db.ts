import { PrismaClient } from "@prisma/client";

// Next.js dev mode hot-reloads modules, which would otherwise open a new pool
// on every reload and exhaust the database's connection limit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
