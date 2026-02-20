import type { Prisma } from "@prisma/client";

export type Team = Prisma.TeamGetPayload<{
  include: {
    members: true;
  };
}>;
