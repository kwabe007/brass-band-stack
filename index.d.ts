/**
 * Since Prisma doesn't provide enum types when using sqlite engine, we
 * redeclare the role property to narrow the type.
 */
declare module "@prisma/client" {
  import type { User as PrismaUser } from "@prisma/client/index";
  type User = Omit<PrismaUser, 'role'> & {
    role: 'MEMBER' | 'ADMIN';
  }
}

export {}
