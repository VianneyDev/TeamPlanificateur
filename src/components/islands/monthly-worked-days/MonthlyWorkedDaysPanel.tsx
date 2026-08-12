import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useMembers } from "@/hooks/members/useMembers";
import { useMonthlyWorkedDays } from "@/hooks/monthly-worked-days/useMonthlyWorkedDays";
import { useUpsertMonthlyWorkedDays } from "@/hooks/monthly-worked-days/useUpsertMonthlyWorkedDays";
import {
  formatMonthLabel,
  listDeclarableMonths,
  normalizeWorkedDaysInput,
  shouldReplaceDaysInputValue,
} from "@/lib/monthly-worked-days-ui";
import {
  daysInMonth,
  isWorkedDaysInRange,
} from "@/lib/monthly-worked-days-rules";
import type { MonthlyWorkedDays } from "@/lib/types";

type MonthlyWorkedDaysPanelProps = {
  actingMemberId: string;
  isManager: boolean;
  isExternal: boolean;
};

const MONTH_OPTIONS = listDeclarableMonths();
const EXTERNAL_MEMBERS_LIMIT = 200;

function daysLabel(count: number): string {
  return `${count} jour${count > 1 ? "s" : ""}`;
}

export default function MonthlyWorkedDaysPanel({
  actingMemberId,
  isManager,
  isExternal,
}: MonthlyWorkedDaysPanelProps) {
  const defaultMemberId = isExternal ? actingMemberId : "";
  const formRef = useRef<HTMLFormElement>(null);
  const daysInputRef = useRef<HTMLInputElement>(null);

  const [memberId, setMemberId] = useState(defaultMemberId);
  const [memberQuery, setMemberQuery] = useState("");
  const [yearMonth, setYearMonth] = useState(
    () => `${MONTH_OPTIONS[0].year}-${MONTH_OPTIONS[0].month}`,
  );
  const [days, setDays] = useState("");
  /** Clean arrival / post-save: no correction chrome until the user engages. */
  const [pristine, setPristine] = useState(true);

  const clearLoneZeroInput = (input: HTMLInputElement) => {
    // Sync DOM clear beats the click caret: setState alone still lets "5"+"0" → "50"/"05".
    input.value = "";
    setDays("");
  };

  const markDirty = () => {
    if (pristine) setPristine(false);
  };

  const listFilterMemberId = isManager ? undefined : actingMemberId;

  const { data, isLoading, error, refetch, isFetching } = useMonthlyWorkedDays({
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

  const rows = useMemo(() => {
    const list = data?.data ?? [];
    return [...list].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== b.month) return b.month - a.month;
      const nameA = a.member?.name ?? a.memberId;
      const nameB = b.member?.name ?? b.memberId;
      return nameA.localeCompare(nameB, "fr");
    });
  }, [data?.data]);

  const externals = useMemo(
    () => externalsData?.data ?? [],
    [externalsData?.data],
  );

  const filteredExternals = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    const list = !query
      ? externals
      : externals.filter((member) =>
          member.name.toLowerCase().includes(query),
        );
    if (memberId && !list.some((member) => member.id === memberId)) {
      const selected = externals.find((member) => member.id === memberId);
      if (selected) return [selected, ...list];
    }
    return list;
  }, [externals, memberId, memberQuery]);

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

  const existingDeclaration = useMemo(() => {
    if (!memberId) return null;
    return (
      rows.find(
        (row) =>
          row.memberId === memberId &&
          row.year === selectedYearMonth.year &&
          row.month === selectedYearMonth.month,
      ) ?? null
    );
  }, [memberId, rows, selectedYearMonth.month, selectedYearMonth.year]);

  const maxDays = daysInMonth(
    selectedYearMonth.year,
    selectedYearMonth.month,
  );
  const daysNumber = Number(days);
  const daysValid =
    days.trim() !== "" &&
    Number.isInteger(daysNumber) &&
    isWorkedDaysInRange(
      selectedYearMonth.year,
      selectedYearMonth.month,
      daysNumber,
    );
  const daysError =
    days.trim() !== "" && Number.isInteger(daysNumber) && daysNumber > maxDays
      ? `Maximum ${maxDays} jours pour ce mois`
      : days.trim() !== "" && !Number.isInteger(daysNumber)
        ? "Entrez un nombre entier"
        : null;

  const isCorrection = Boolean(existingDeclaration) && !pristine;
  const daysUnchanged =
    isCorrection && daysValid && daysNumber === existingDeclaration?.days;
  const willReplace =
    isCorrection &&
    daysValid &&
    existingDeclaration !== null &&
    daysNumber !== existingDeclaration.days;
  const canSubmit = Boolean(memberId) && daysValid && !daysUnchanged;

  const selectedMemberName = useMemo(() => {
    if (!memberId) return null;
    const fromExternals = externals.find((m) => m.id === memberId)?.name;
    if (fromExternals) return fromExternals;
    const fromRows = rows.find((r) => r.memberId === memberId)?.member?.name;
    return fromRows ?? null;
  }, [memberId, externals, rows]);

  const monthLabel = formatMonthLabel(
    selectedYearMonth.year,
    selectedYearMonth.month,
  );

  const formTitle = isCorrection
    ? `Correction - ${selectedMemberName ?? "membre"}, ${monthLabel}`
    : isManager
      ? "Nouvelle déclaration"
      : "Déclarer mon volume";

  const resetForm = () => {
    setMemberId(defaultMemberId);
    setMemberQuery("");
    setYearMonth(`${MONTH_OPTIONS[0].year}-${MONTH_OPTIONS[0].month}`);
    setDays("");
    setPristine(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const focusDaysField = () => {
    daysInputRef.current?.focus({ preventScroll: true });
  };

  const fillFromRow = (row: MonthlyWorkedDays) => {
    setPristine(false);
    setMemberId(row.memberId);
    setMemberQuery("");
    setYearMonth(`${row.year}-${row.month}`);
    setDays(String(row.days));
    scrollToTop();
    window.requestAnimationFrame(focusDaysField);
  };

  const beginEditExisting = () => {
    if (!existingDeclaration) return;
    setPristine(false);
    setDays(String(existingDeclaration.days));
    window.requestAnimationFrame(focusDaysField);
  };

  const focusDeclareCurrentMonth = () => {
    setPristine(false);
    setYearMonth(`${MONTH_OPTIONS[0].year}-${MONTH_OPTIONS[0].month}`);
    setDays("");
    scrollToTop();
    window.requestAnimationFrame(focusDaysField);
  };

  useEffect(() => {
    if (days === "") return;
    const n = Number(days);
    if (!Number.isInteger(n)) return;
    if (n > maxDays) setDays(String(maxDays));
  }, [maxDays, days]);

  const declarationFor = (targetMemberId: string, targetYearMonth: string) => {
    if (!targetMemberId) return null;
    const [yearStr, monthStr] = targetYearMonth.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    return (
      rows.find(
        (row) =>
          row.memberId === targetMemberId &&
          row.year === year &&
          row.month === month,
      ) ?? null
    );
  };

  const handleMemberChange = (nextMemberId: string) => {
    markDirty();
    setMemberId(nextMemberId);
    const existing = declarationFor(nextMemberId, yearMonth);
    setDays(existing ? String(existing.days) : "");
  };

  const handleMonthChange = (nextYearMonth: string) => {
    markDirty();
    setYearMonth(nextYearMonth);
    const existing = declarationFor(memberId, nextYearMonth);
    setDays(existing ? String(existing.days) : "");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !memberId) return;

    const previousDays = existingDeclaration?.days;
    const targetName = selectedMemberName;

    mutate(
      {
        memberId,
        year: selectedYearMonth.year,
        month: selectedYearMonth.month,
        days: daysNumber,
      },
      {
        onSuccess: () => {
          const who = isManager && targetName ? `${targetName} · ` : "";
          const replaceNote =
            previousDays !== undefined && previousDays !== daysNumber
              ? ` (remplace ${previousDays})`
              : "";
          toast.success(
            `${who}${daysNumber} j. · ${monthLabel}${replaceNote}`,
          );
          resetForm();
        },
      },
    );
  };

  const showReset = !pristine;

  const layoutClass = isManager
    ? "grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start"
    : "mx-auto flex w-full max-w-xl flex-col gap-6";

  const memberFilterActive = memberQuery.trim() !== "";
  const memberMatchCount = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    if (!query) return externals.length;
    return externals.filter((member) =>
      member.name.toLowerCase().includes(query),
    ).length;
  }, [externals, memberQuery]);

  return (
    <div className={layoutClass}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        aria-labelledby="worked-days-form-heading"
        className={`panel-accent space-y-4 p-4 sm:p-5 ${
          isCorrection ? "ring-1 ring-primary/40" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="worked-days-form-heading"
              className="text-base font-semibold text-foreground"
            >
              {formTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isManager
                ? "Mois courant et passés uniquement."
                : "Mois courant et passés - indépendant des jours de repos."}
            </p>
          </div>
          {showReset && (
            <button
              type="button"
              onClick={resetForm}
              className="btn-ghost shrink-0 px-2 py-1 text-xs"
            >
              Annuler
            </button>
          )}
        </div>

        {pristine && existingDeclaration && (
          <p className="text-sm text-muted-foreground">
            {monthLabel} est déjà déclaré (
            {daysLabel(existingDeclaration.days)}).{" "}
            <button
              type="button"
              onClick={beginEditExisting}
              className="font-medium text-foreground underline underline-offset-2 hover:text-accent-foreground"
            >
              Corriger
            </button>
            {" "}
            ou saisissez une nouvelle valeur ci-dessous.
          </p>
        )}

        {isCorrection && existingDeclaration && (
          <div
            role="status"
            className="rounded-md border border-primary/25 bg-accent px-3 py-2 text-sm text-accent-foreground"
          >
            <p>
              Déclaration actuelle :{" "}
              <span className="font-semibold text-foreground">
                {daysLabel(existingDeclaration.days)}
              </span>
              .
            </p>
            {willReplace && (
              <p className="mt-1">
                Mettre à jour remplacera cette valeur par{" "}
                <span className="font-semibold text-foreground">
                  {daysLabel(daysNumber)}
                </span>
                .
              </p>
            )}
            {daysUnchanged && (
              <p className="mt-1 text-muted-foreground">
                Aucune modification - changez le nombre de jours pour
                enregistrer.
              </p>
            )}
          </div>
        )}

        {isManager && (
          <fieldset className="space-y-2 border-0 p-0">
            <legend className="mb-0 text-sm font-medium text-foreground">
              Membre externe
            </legend>
            <input
              type="search"
              className="field"
              value={memberQuery}
              onChange={(e) => {
                markDirty();
                setMemberQuery(e.target.value);
              }}
              placeholder="Rechercher un membre…"
              autoComplete="off"
              disabled={externalsLoading}
              aria-label="Rechercher un membre externe"
            />
            <select
              className="field"
              value={memberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              disabled={externalsLoading}
              required
              aria-label="Liste des membres externes"
            >
              <option value="" disabled>
                {externalsLoading
                  ? "Chargement…"
                  : "Sélectionner un membre"}
              </option>
              {filteredExternals.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                  {member.id === actingMemberId ? " (vous)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {externalsLoading
                ? "Chargement des membres…"
                : memberFilterActive
                  ? `${memberMatchCount} résultat${memberMatchCount > 1 ? "s" : ""}`
                  : `${externals.length} membre${externals.length > 1 ? "s" : ""} externe${externals.length > 1 ? "s" : ""}`}
            </p>
          </fieldset>
        )}

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Mois</span>
          <select
            className="field"
            value={yearMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
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

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">
            Jours travaillés (0–{maxDays})
          </span>
          <input
            ref={daysInputRef}
            type="number"
            min={0}
            max={maxDays}
            step={1}
            inputMode="numeric"
            placeholder="0"
            className={`field tabular-nums ${daysError ? "border-destructive" : ""}`}
            value={days}
            aria-invalid={Boolean(daysError)}
            aria-describedby={daysError ? "worked-days-error" : undefined}
            onFocus={(e) => {
              if (pristine && existingDeclaration && days === "") {
                setDays(String(existingDeclaration.days));
              }
              markDirty();
              if (shouldReplaceDaysInputValue(e.currentTarget.value)) {
                clearLoneZeroInput(e.currentTarget);
              }
            }}
            onMouseUp={(e) => {
              if (shouldReplaceDaysInputValue(e.currentTarget.value)) {
                e.preventDefault();
                clearLoneZeroInput(e.currentTarget);
              }
            }}
            onChange={(e) => {
              markDirty();
              setDays(normalizeWorkedDaysInput(e.target.value));
            }}
            required
          />
          {daysError && (
            <span
              id="worked-days-error"
              className="block text-xs text-destructive"
            >
              {daysError}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={!canSubmit || isPending}
          aria-busy={isPending}
          className="btn-primary w-full"
        >
          {isPending
            ? "Enregistrement…"
            : isCorrection
              ? "Mettre à jour"
              : "Enregistrer"}
        </button>
      </form>

      <section
        className="panel-accent overflow-hidden"
        aria-labelledby="worked-days-history-heading"
      >
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2
              id="worked-days-history-heading"
              className="text-base font-semibold text-foreground"
            >
              {isManager ? "Déclarations" : "Mes déclarations"}
            </h2>
            {rows.length > 0 && (
              <span className="text-xs tabular-nums text-muted-foreground">
                {rows.length}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isManager
              ? "Historique des volumes mensuels."
              : "Historique de vos volumes."}
          </p>
        </div>

        {(isLoading || (isFetching && rows.length === 0)) && (
          <p
            role="status"
            className="px-4 py-6 text-sm text-muted-foreground sm:px-5"
          >
            Chargement…
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <span className="text-sm text-destructive">
              Impossible de charger les déclarations.
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn-outline shrink-0"
            >
              Réessayer
            </button>
          </div>
        )}
        {!isLoading && !error && rows.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center sm:px-5">
            <p className="text-sm text-muted-foreground">
              Aucune déclaration pour le moment.
            </p>
            <button
              type="button"
              onClick={focusDeclareCurrentMonth}
              className="btn-outline"
            >
              Déclarer {MONTH_OPTIONS[0].label}
            </button>
          </div>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Historique des jours travaillés déclarés
              </caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  {isManager && (
                    <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                      Membre
                    </th>
                  )}
                  <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                    Mois
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-medium sm:px-5"
                  >
                    Jours
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right font-medium sm:px-5"
                  >
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isActive =
                    !pristine &&
                    row.memberId === memberId &&
                    row.year === selectedYearMonth.year &&
                    row.month === selectedYearMonth.month;
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-border last:border-b-0 ${
                        isActive ? "bg-accent/40" : "hover:bg-muted/35"
                      }`}
                    >
                      {isManager && (
                        <td className="px-4 py-3 font-medium text-foreground sm:px-5">
                          {row.member?.name ?? row.memberId}
                        </td>
                      )}
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">
                        {formatMonthLabel(row.year, row.month)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-foreground sm:px-5">
                        {row.days}
                      </td>
                      <td className="px-4 py-3 text-right sm:px-5">
                        <button
                          type="button"
                          className={
                            isActive
                              ? "btn-outline px-2.5 py-1 text-xs font-medium"
                              : "btn-ghost px-2.5 py-1 text-xs text-foreground"
                          }
                          onClick={() => fillFromRow(row)}
                        >
                          {isActive ? "En cours" : "Modifier"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
