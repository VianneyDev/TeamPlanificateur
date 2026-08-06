# Monthly Worked Days bound is calendar length of the month

The PRD did not specify a maximum for the monthly integer count. We cap declared days at the number of calendar days in that month (28-31 depending on year/month), with a minimum of 0. The bound is computed once by `daysInMonth` in `src/lib/monthly-worked-days-rules.ts` and reused by Zod API validation and the `/external` form. Exceeding the bound is rejected with `DAYS_EXCEED_MONTH`.
