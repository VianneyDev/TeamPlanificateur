import type { Prisma } from "@prisma/client";

export type Team = Prisma.TeamGetPayload<{
  include: {
    _count: {
      select: {
        members: {
          where: { archived: false };
        };
      };
    };
  };
}>;
