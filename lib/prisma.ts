import { PrismaClient } from "@prisma/client";

// One shared client per server process (dev hot-reload would otherwise open
// a new connection pool on every change).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
