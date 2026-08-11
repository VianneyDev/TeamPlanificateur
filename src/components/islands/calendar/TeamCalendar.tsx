import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import MyLeaveRequests from "@/components/islands/calendar/MyLeaveRequests";
import PendingLeaveRequests from "@/components/islands/calendar/PendingLeaveRequests";
import { useDaysOff } from "@/hooks/days-off/useDaysOff";
import { useToggleDayOff } from "@/hooks/days-off/useToggleDayOff";
import { useCreateLeaveRequest } from "@/hooks/leave-requests/useCreateLeaveRequest";
import { useMembers } from "@/hooks/members/useMembers";
import {
  currentYearMonth,
  shiftMonth,
} from "@/lib/calendar/month-navigation";
import {
  groupDayOffsByDate,
  memberInitials,
} from "@/lib/day-off-calendar";
import {
  enumerateWeekdayDates,
  isWeekendDate,
  orderedCalendarRange,
} from "@/lib/day-off-range";
import { mergeDraftWeekdays } from "@/lib/leave-request-draft";
import { MAX_LIST_PAGE_SIZE } from "@/lib/schemas/pagination";
import type { PendingLeaveDate } from "@/lib/types";

type TeamCalendarProps = {
  actingMemberId: string;
  actingMemberName: string;
  isManager: boolean;
};

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
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
  actingMemberId,
  actingMemberName,
  isManager,
}: TeamCalendarProps) {
  const [yearMonth, setYearMonth] = useState(currentYearMonth);
  const { year, month } = yearMonth;
  const [editTargetId, setEditTargetId] = useState(actingMemberId);
  const [rangeAnchor, setRangeAnchor] = useState<string | null>(null);
  const [rangeHover, setRangeHover] = useState<string | null>(null);
  const [draftDates, setDraftDates] = useState<string[]>([]);
  const rangeAnchorRef = useRef<string | null>(null);
  const rangeHoverRef = useRef<string | null>(null);
  const editTargetIdRef = useRef(editTargetId);
  const dayOffsByDateRef = useRef<ReturnType<typeof groupDayOffsByDate>>(
    new Map(),
  );

  const { data, isLoading, isFetching, error, refetch } = useDaysOff(year);
  const toggle = useToggleDayOff(year);
  const createLeaveRequest = useCreateLeaveRequest(year);

  useEffect(() => {
    rangeAnchorRef.current = rangeAnchor;
  }, [rangeAnchor]);

  useEffect(() => {
    rangeHoverRef.current = rangeHover;
  }, [rangeHover]);

  useEffect(() => {
    editTargetIdRef.current = editTargetId;
  }, [editTargetId]);
  const { data: membersData, isLoading: membersLoading } = useMembers({
    status: "active",
    page: 1,
    search: "",
    limit: MAX_LIST_PAGE_SIZE,
    enabled: isManager,
  });

  const members = membersData?.data ?? [];
  const editTargetName =
    members.find((member) => member.id === editTargetId)?.name ??
    (editTargetId === actingMemberId ? actingMemberName : "membre sélectionné");

  const dayOffsByDate = useMemo(
    () =>
      groupDayOffsByDate(data?.data ?? [], actingMemberId, editTargetId),
    [actingMemberId, data, editTargetId],
  );

  useEffect(() => {
    dayOffsByDateRef.current = dayOffsByDate;
  }, [dayOffsByDate]);

  const pendingByDate = useMemo(() => {
    const map = new Map<string, PendingLeaveDate[]>();
    for (const entry of data?.pending ?? []) {
      const key = entry.date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return map;
  }, [data?.pending]);

  const pendingDateKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const [key, entries] of pendingByDate) {
      if (
        isManager ||
        entries.some((entry) => entry.memberId === actingMemberId)
      ) {
        keys.add(key);
      }
    }
    return keys;
  }, [actingMemberId, isManager, pendingByDate]);

  const draftDateSet = useMemo(() => new Set(draftDates), [draftDates]);

  const previewRange = useMemo(() => {
    if (!rangeAnchor || !rangeHover) return null;
    return orderedCalendarRange(rangeAnchor, rangeHover);
  }, [rangeAnchor, rangeHover]);

  const previewWeekdays = useMemo(() => {
    if (!previewRange) return null;
    return new Set(
      enumerateWeekdayDates(previewRange.from, previewRange.to),
    );
  }, [previewRange]);

  const currentDate = todayKey();
  const days = monthDays(year, month);
  const monthLabel = MONTH_YEAR_FORMATTER.format(
    new Date(Date.UTC(year, month, 1)),
  );

  const mutationPending =
    toggle.isPending || createLeaveRequest.isPending;

  useEffect(() => {
    if (!rangeAnchor) return;

    const finish = () => {
      const anchor = rangeAnchorRef.current;
      if (!anchor) return;
      const end = rangeHoverRef.current ?? anchor;
      const { from, to } = orderedCalendarRange(anchor, end);
      const weekdays = enumerateWeekdayDates(from, to);
      const memberId = editTargetIdRef.current;

      setRangeAnchor(null);
      setRangeHover(null);
      rangeAnchorRef.current = null;
      rangeHoverRef.current = null;

      if (mutationPending || weekdays.length === 0) return;

      if (isManager) {
        if (weekdays.length === 1) {
          toggle.mutate({ date: weekdays[0], memberId });
        } else {
          toggle.mutate({
            from: weekdays[0],
            to: weekdays[weekdays.length - 1],
            memberId,
          });
        }
        return;
      }

      const allOwnDayOffs = weekdays.every(
        (key) => dayOffsByDateRef.current.get(key)?.primary,
      );

      if (allOwnDayOffs) {
        if (weekdays.length === 1) {
          toggle.mutate({ date: weekdays[0] });
        } else {
          toggle.mutate({
            from: weekdays[0],
            to: weekdays[weekdays.length - 1],
          });
        }
        return;
      }

      setDraftDates((current) => mergeDraftWeekdays(current, weekdays));
    };

    const cancel = () => {
      setRangeAnchor(null);
      setRangeHover(null);
      rangeAnchorRef.current = null;
      rangeHoverRef.current = null;
    };

    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [isManager, mutationPending, rangeAnchor, toggle]);

  const handlePointerDown = (key: string) => {
    if (isLoading || Boolean(error) || mutationPending) return;
    if (isWeekendDate(key)) return;
    rangeAnchorRef.current = key;
    rangeHoverRef.current = key;
    setRangeAnchor(key);
    setRangeHover(key);
  };

  const handlePointerEnter = (key: string) => {
    if (!rangeAnchorRef.current || mutationPending) return;
    if (isWeekendDate(key)) return;
    rangeHoverRef.current = key;
    setRangeHover(key);
  };

  const handleSubmitDraft = () => {
    if (draftDates.length === 0 || createLeaveRequest.isPending) return;
    createLeaveRequest.mutate(
      { dates: draftDates },
      {
        onSuccess: () => setDraftDates([]),
      },
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:items-start">
      <section className="panel space-y-5 p-4 sm:p-5" aria-labelledby="calendar-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="calendar-heading"
              className="text-base font-semibold text-foreground"
            >
              Calendrier mensuel
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isManager ? (
                <>
                  Cliquez pour basculer un jour, ou glissez pour une plage
                  continue (édition pour{" "}
                  <span className="font-medium text-foreground">
                    {editTargetName}
                  </span>
                  ).
                </>
              ) : (
                <>
                  Sélectionnez des jours ouvrés (clics ou plage), confirmez
                  votre demande, ou effacez vos jours de repos déjà validés (
                  <span className="font-medium text-foreground">
                    {actingMemberName}
                  </span>
                  ).
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1 self-start rounded-md border border-border bg-background p-0.5 sm:self-auto">
            <button
              type="button"
              onClick={() => setYearMonth((value) => shiftMonth(value, -1))}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
              aria-label="Afficher le mois précédent"
              disabled={mutationPending}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <span className="min-w-36 text-center text-sm font-semibold capitalize text-foreground">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => setYearMonth((value) => shiftMonth(value, 1))}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
              aria-label="Afficher le mois suivant"
              disabled={mutationPending}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isManager && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="day-off-edit-target"
              className="text-sm font-medium text-foreground"
            >
              Membre à éditer
            </label>
            <select
              id="day-off-edit-target"
              value={editTargetId}
              onChange={(event) => setEditTargetId(event.target.value)}
              disabled={membersLoading || mutationPending}
              className="max-w-md rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
            >
              {!members.some((member) => member.id === actingMemberId) && (
                <option value={actingMemberId}>{actingMemberName}</option>
              )}
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                  {member.id === actingMemberId ? " (vous)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isManager && draftDates.length > 0 && (
          <div className="flex flex-col gap-3 rounded-lg border border-primary/25 bg-accent px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">
              <span className="font-semibold">
                {draftDates.length} jour{draftDates.length > 1 ? "s" : ""}
              </span>{" "}
              sélectionné{draftDates.length > 1 ? "s" : ""} - non envoyés tant
              que vous ne confirmez pas.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDraftDates([])}
                disabled={createLeaveRequest.isPending}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmitDraft}
                disabled={createLeaveRequest.isPending}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:brightness-105 disabled:opacity-50"
              >
                Demander {draftDates.length} jour
                {draftDates.length > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="size-3 rounded-sm bg-primary" aria-hidden="true" />
            Vos jours de repos
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="size-3 rounded-sm border border-dashed border-primary/50 bg-accent"
              aria-hidden="true"
            />
            Demande en attente
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="size-3 rounded-sm bg-amber-500/80"
              aria-hidden="true"
            />
            Autres membres (initiales)
          </span>
          {isManager && editTargetId !== actingMemberId && (
            <span className="inline-flex items-center gap-2">
              <span
                className="size-3 rounded-sm bg-sky-600"
                aria-hidden="true"
              />
              Cible d&apos;édition
            </span>
          )}
          <span className="inline-flex items-center gap-2">
            <span
              className="size-3 rounded-sm border border-primary"
              aria-hidden="true"
            />
            Aujourd&apos;hui
          </span>
          {(isLoading || isFetching) && (
            <span role="status">Chargement…</span>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <span>Impossible de charger les jours de repos.</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="font-medium underline underline-offset-2 hover:text-foreground"
            >
              Réessayer
            </button>
          </div>
        )}

        <article className="w-full rounded-lg border border-border bg-background p-3 sm:p-4">
          <div
            className="grid grid-cols-7 gap-1 select-none"
            aria-label={monthLabel}
          >
            {WEEKDAYS.map((weekday, index) => (
              <span
                key={`${weekday}-${index}`}
                className="pb-1 text-center text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground"
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
              const entry = dayOffsByDate.get(key);
              const primary = entry?.primary ?? false;
              const editTargetOff = entry?.editTargetOff ?? false;
              const others = entry?.others ?? [];
              const secondary = others.length > 0;
              const isToday = key === currentDate;
              const isWeekend = isWeekendDate(key);
              const isPending = pendingDateKeys.has(key);
              const inDraft = draftDateSet.has(key);
              const formattedDate = DATE_FORMATTER.format(
                new Date(Date.UTC(year, month, day)),
              );
              const inPreview = previewWeekdays?.has(key) ?? false;
              const otherNames = others.map((member) => member.name).join(", ");
              const selectionBlocked =
                isLoading || Boolean(error) || mutationPending;
              const interactionBlocked = selectionBlocked || isWeekend;

              return (
                <button
                  key={key}
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    handlePointerDown(key);
                  }}
                  onPointerEnter={() => handlePointerEnter(key)}
                  disabled={interactionBlocked}
                  aria-disabled={interactionBlocked}
                  aria-pressed={isWeekend ? undefined : editTargetOff}
                  aria-label={[
                    isWeekend
                      ? `Week-end le ${formattedDate}, non sélectionnable`
                      : primary
                        ? `Jour de repos pour ${actingMemberName} le ${formattedDate}`
                        : isPending
                          ? `Demande en attente pour ${actingMemberName} le ${formattedDate}`
                          : `Jour ouvrable le ${formattedDate}`,
                    !isWeekend && secondary
                      ? `aussi en repos : ${otherNames}`
                      : null,
                    !isWeekend &&
                    isManager &&
                    editTargetId !== actingMemberId
                      ? editTargetOff
                        ? `cible d'édition (${editTargetName}) en repos`
                        : `cible d'édition (${editTargetName}) disponible`
                      : null,
                    isWeekend
                      ? null
                      : isManager
                        ? "Cliquer ou glisser pour modifier"
                        : primary
                          ? "Cliquer pour effacer ce jour de repos"
                          : "Cliquer ou glisser pour sélectionner",
                  ]
                    .filter(Boolean)
                    .join(". ")}
                  title={
                    isWeekend
                      ? "Week-end non sélectionnable"
                      : secondary
                        ? `Aussi en repos : ${otherNames}`
                        : undefined
                  }
                  className={[
                    "relative aspect-square rounded-md text-sm font-medium transition",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    selectionBlocked && !isWeekend
                      ? "disabled:cursor-wait disabled:opacity-60"
                      : "",
                    isWeekend
                      ? "cursor-default bg-muted text-muted-foreground disabled:opacity-100"
                      : primary
                        ? "bg-primary text-primary-foreground shadow-sm hover:brightness-105"
                        : isPending
                          ? "border border-dashed border-primary/40 bg-accent text-accent-foreground hover:bg-accent/80"
                          : editTargetOff
                            ? "bg-sky-600 text-white shadow-sm hover:bg-sky-500"
                            : secondary
                              ? "bg-amber-100 text-amber-950 hover:bg-amber-200"
                              : "text-foreground hover:bg-muted",
                    isToday ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : "",
                    inPreview || inDraft ? "ring-2 ring-primary/50" : "",
                  ].join(" ")}
                >
                  <span className="relative z-10">{day}</span>
                  {secondary && (
                    <span
                      className="absolute inset-x-0.5 bottom-0.5 flex max-h-[42%] flex-wrap items-end justify-center gap-0.5 overflow-hidden"
                      aria-hidden="true"
                    >
                      {others.map((member) => (
                        <span
                          key={member.id}
                          title={member.name}
                          className="rounded-[2px] bg-amber-500 px-0.5 text-[0.55rem] leading-tight font-semibold tracking-tight text-amber-950"
                        >
                          {memberInitials(member.name)}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <aside className="panel p-4 sm:p-5">
        {!isManager && <MyLeaveRequests year={year} />}
        {isManager && <PendingLeaveRequests year={year} />}
      </aside>
    </div>
  );
}
