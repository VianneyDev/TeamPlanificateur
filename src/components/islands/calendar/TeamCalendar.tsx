import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useDaysOff } from "@/hooks/days-off/useDaysOff";
import { useToggleDayOff } from "@/hooks/days-off/useToggleDayOff";

type TeamCalendarProps = {
  actingMemberName: string;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  timeZone: "UTC",
});
const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayKey() {
  const today = new Date();
  return dateKey(today.getFullYear(), today.getMonth(), today.getDate());
}

function monthDays(year: number, month: number) {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const leadingEmptyDays = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return [
    ...Array.from({ length: leadingEmptyDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

export default function TeamCalendar({
  actingMemberName,
}: TeamCalendarProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data, isLoading, isFetching, error, refetch } = useDaysOff(year);
  const toggle = useToggleDayOff(year);

  const activeDates = useMemo(
    () => new Set((data?.data ?? []).map((dayOff) => dayOff.date.slice(0, 10))),
    [data],
  );
  const currentDate = todayKey();

  const handleToggle = (date: string) => {
    if (toggle.isPending) return;
    toggle.mutate({ date });
  };

  return (
    <section className="space-y-5" aria-labelledby="calendar-heading">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="calendar-heading" className="text-lg font-semibold text-white">
            Calendrier annuel
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Cliquez sur une date pour ajouter ou retirer un jour de repos pour{" "}
            <span className="font-medium text-slate-200">{actingMemberName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-950/70 p-1 sm:self-auto">
          <button
            type="button"
            onClick={() => setYear((value) => value - 1)}
            className="rounded-md p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-40"
            aria-label="Afficher l'année précédente"
            disabled={toggle.isPending}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="min-w-16 text-center text-sm font-semibold text-white">
            {year}
          </span>
          <button
            type="button"
            onClick={() => setYear((value) => value + 1)}
            className="rounded-md p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-40"
            aria-label="Afficher l'année suivante"
            disabled={toggle.isPending}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-sm bg-blue-500" aria-hidden="true" />
          Jour de repos
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="size-3 rounded-sm border border-blue-400"
            aria-hidden="true"
          />
          Aujourd'hui
        </span>
        {(isLoading || isFetching) && (
          <span role="status" className="text-slate-500">
            Chargement…
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200"
        >
          <span>Impossible de charger les jours de repos.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-medium underline underline-offset-2 hover:text-white"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }, (_, month) => {
          const days = monthDays(year, month);
          const monthLabel = MONTH_FORMATTER.format(
            new Date(Date.UTC(year, month, 1)),
          );

          return (
            <article
              key={month}
              className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 shadow-sm"
            >
              <h3 className="mb-3 capitalize text-sm font-semibold text-white">
                {monthLabel}
              </h3>
              <div
                className="grid grid-cols-7 gap-1"
                aria-label={`${monthLabel} ${year}`}
              >
                {WEEKDAYS.map((weekday, index) => (
                  <span
                    key={`${weekday}-${index}`}
                    className="pb-1 text-center text-[0.65rem] font-medium text-slate-500"
                    aria-hidden="true"
                  >
                    {weekday}
                  </span>
                ))}

                {days.map((day, index) => {
                  if (day === null) {
                    return <span key={`empty-${index}`} aria-hidden="true" />;
                  }

                  const key = dateKey(year, month, day);
                  const active = activeDates.has(key);
                  const isToday = key === currentDate;
                  const weekday = new Date(
                    Date.UTC(year, month, day),
                  ).getUTCDay();
                  const isWeekend = weekday === 0 || weekday === 6;
                  const formattedDate = DATE_FORMATTER.format(
                    new Date(Date.UTC(year, month, day)),
                  );

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleToggle(key)}
                      disabled={isLoading || Boolean(error) || toggle.isPending}
                      aria-pressed={active}
                      aria-label={
                        active
                          ? `Retirer le jour de repos du ${formattedDate}`
                          : `Ajouter un jour de repos le ${formattedDate}`
                      }
                      className={[
                        "aspect-square rounded-md text-xs font-medium transition",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                        "disabled:cursor-wait disabled:opacity-60",
                        active
                          ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500"
                          : isWeekend
                            ? "bg-slate-800/70 text-slate-400 hover:bg-slate-700 hover:text-white"
                            : "text-slate-200 hover:bg-slate-700",
                        isToday ? "ring-1 ring-blue-400 ring-offset-1 ring-offset-slate-900" : "",
                      ].join(" ")}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
