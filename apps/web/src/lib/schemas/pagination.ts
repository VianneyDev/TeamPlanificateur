import { z } from "zod";

/** Plafond `limit` des listes paginées (modal membre : jusqu’à 200 équipes). */
export const MAX_LIST_PAGE_SIZE = 200;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().pipe(z.int().min(1)),
  limit: z.coerce
    .number()
    .pipe(z.int().min(1).max(MAX_LIST_PAGE_SIZE)),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export function parseListPagination(input: { page?: string; limit?: string }) {
  return PaginationQuerySchema.safeParse({
    page: input.page ?? "1",
    limit: input.limit ?? "10",
  });
}
