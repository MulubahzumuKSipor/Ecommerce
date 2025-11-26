import { PrismaClient } from '@prisma/client';

// Use a global variable in development to prevent hot-reloading from creating multiple instances
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;