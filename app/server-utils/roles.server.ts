import type { User } from "@prisma/client";

export function isAdmin(user: User) {
  return user.role === "ADMIN";
}
