const MONTH_LABELS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

export function formatMonthLabel(year: number, month: number): string {
  const label = MONTH_LABELS_FR[month - 1] ?? String(month);
  return `${label} ${year}`;
}

/** Current month and past months only (newest first). */
export function listDeclarableMonths(
  count = 24,
  now = new Date(),
): { year: number; month: number; label: string }[] {
  const result: { year: number; month: number; label: string }[] = [];
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  for (let i = 0; i < count; i++) {
    result.push({
      year,
      month,
      label: formatMonthLabel(year, month),
    });
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
  }

  return result;
}
