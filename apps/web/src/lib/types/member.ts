import type { Prisma } from "@prisma/client";

export type Member = Prisma.MemberGetPayload<{
  include: {
    teams: true;
  };
}>;
