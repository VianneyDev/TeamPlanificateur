import { useMemo, useState } from "react";
import { useMembers } from "@/hooks/members/useMembers";
import { useMonthlyWorkedDays } from "@/hooks/monthly-worked-days/useMonthlyWorkedDays";
import { useUpsertMonthlyWorkedDays } from "@/hooks/monthly-worked-days/useUpsertMonthlyWorkedDays";
import {
  formatMonthLabel,
  listDeclarableMonths,
} from "@/lib/monthly-worked-days-ui";
import type { MonthlyWorkedDays } from "@/lib/types";

type MonthlyWorkedDaysPanelProps = {
  actingMemberId: string;
  isManager: boolean;
  isExternal: boolean;
};

const MONTH_OPTIONS = listDeclarableMonths();
const EXTERNAL_MEMBERS_LIMIT = 200;

export default function MonthlyWorkedDaysPanel({
  actingMemberId,
  isManager,
  isExternal,
}: MonthlyWorkedDaysPanelProps) {
  const defaultMemberId = isExternal ? actingMemberId : "";
  const [memberId, setMemberId] = useState(defaultMemberId);
  const [yearMonth, setYearMonth] = useState(
    () => `${MONTH_OPTIONS[0].year}-${MONTH_OPTIONS[0].month}`,
  );
  const [days, setDays] = useState("0");

  const listFilterMemberId = isManager ? undefined : actingMemberId;

  const { data, isLoading, error } = useMonthlyWorkedDays({
    memberId: listFilterMemberId,
  });

  const { data: externalsData, isLoading: externalsLoading } = useMembers({
    status: "active",
    page: 1,
    search: "",
    isExternal: true,
    limit: EXTERNAL_MEMBERS_LIMIT,
    enabled: isManager,
  });

  const { mutate, isPending } = useUpsertMonthlyWorkedDays();

  const rows = data?.data ?? [];
  const externals = externalsData?.data ?? [];

  const monthOptions = useMemo(() => {
    const byKey = new Map(
      MONTH_OPTIONS.map((option) => [
        `${option.year}-${option.month}`,
        option,
      ]),
    );
    for (const row of rows) {
      const key = `${row.year}-${row.month}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          year: row.year,
          month: row.month,
          label: formatMonthLabel(row.year, row.month),
        });
      }
    }
    return [...byKey.values()].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [rows]);

  const selectedYearMonth = useMemo(() => {
    const [yearStr, monthStr] = yearMonth.split("-");
    return { year: Number(yearStr), month: Number(monthStr) };
  }, [yearMonth]);

  const canSubmit =
    Boolean(memberId) &&
    Number.isInteger(Number(days)) &&
    Number(days) >= 0 &&
    Number(days) <= 31;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !memberId) return;

    mutate({
      memberId,
      year: selectedYearMonth.year,
      month: selectedYearMonth.month,
      days: Number(days),
    });
  };

  const fillFromRow = (row: MonthlyWorkedDays) => {
    setMemberId(row.memberId);
    setYearMonth(`${row.year}-${row.month}`);
    setDays(String(row.days));
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-lg border border-slate-700 bg-slate-900/50 p-5"
      >
        <h2 className="text-lg font-semibold text-white">
          Déclarer ou corriger
        </h2>

        {isManager && (
          <label className="block space-y-1 text-sm">
            <span className="text-slate-300">Membre externe</span>
            <select
              className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              disabled={externalsLoading}
              required
            >
              <option value="" disabled>
                Sélectionner un membre
              </option>
              {externals.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                  {member.id === actingMemberId ? " (vous)" : ""}
                </option>
              ))}
            </select>
          </label>
        )}

        {!isManager && (
          <p className="text-sm text-slate-400">
            Déclaration pour votre compte uniquement.
          </p>
        )}

        <label className="block space-y-1 text-sm">
          <span className="text-slate-300">Mois</span>
          <select
            className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
          >
            {monthOptions.map((option) => (
              <option
                key={`${option.year}-${option.month}`}
                value={`${option.year}-${option.month}`}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-slate-300">Jours travaillés</span>
          <input
            type="number"
            min={0}
            max={31}
            step={1}
            className="w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit || isPending}
          className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Déclarations</h2>

        {isLoading && (
          <p className="text-sm text-slate-400">Chargement…</p>
        )}
        {error && (
          <p className="text-sm text-red-400">
            Impossible de charger les déclarations.
          </p>
        )}
        {!isLoading && !error && rows.length === 0 && (
          <p className="text-sm text-slate-400">Aucune déclaration pour le moment.</p>
        )}

        {rows.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  {isManager && <th className="px-4 py-3 font-medium">Membre</th>}
                  <th className="px-4 py-3 font-medium">Mois</th>
                  <th className="px-4 py-3 font-medium">Jours</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-800 text-slate-200"
                  >
                    {isManager && (
                      <td className="px-4 py-3">
                        {row.member?.name ?? row.memberId}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {formatMonthLabel(row.year, row.month)}
                    </td>
                    <td className="px-4 py-3">{row.days}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => fillFromRow(row)}
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
