import { useApproveLeaveRequest } from "@/hooks/leave-requests/useApproveLeaveRequest";
import { useLeaveRequests } from "@/hooks/leave-requests/useLeaveRequests";
import { useRejectLeaveRequest } from "@/hooks/leave-requests/useRejectLeaveRequest";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type PendingLeaveRequestsProps = {
  year: number;
};

export default function PendingLeaveRequests({
  year,
}: PendingLeaveRequestsProps) {
  const { data, isLoading, error, refetch } = useLeaveRequests("pending");
  const approve = useApproveLeaveRequest(year);
  const reject = useRejectLeaveRequest(year);
  const requests = data?.data ?? [];
  const decisionPending = approve.isPending || reject.isPending;

  return (
    <section className="space-y-4" aria-labelledby="a-valider-heading">
      <div>
        <h2
          id="a-valider-heading"
          className="flex items-center gap-2 text-base font-semibold text-foreground"
        >
          À valider
          {!isLoading && !error && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-md bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
              {requests.length}
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Approuvez ou refusez les demandes en attente.
        </p>
      </div>

      {isLoading && (
        <p role="status" className="text-sm text-muted-foreground">
          Chargement…
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <span>Impossible de charger la file à valider.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-medium underline underline-offset-2 hover:text-foreground"
          >
            Réessayer
          </button>
        </div>
      )}

      {!isLoading && !error && requests.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
          <p className="text-sm font-medium text-foreground">File à jour</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Aucune demande en attente pour le moment.
          </p>
        </div>
      )}

      {requests.length > 0 && (
        <ul className="space-y-2">
          {requests.map((request) => {
            const datesLabel = request.dates
              .map((entry) =>
                DATE_FORMATTER.format(new Date(entry.date)),
              )
              .join(", ");
            const memberName = request.member?.name ?? "Membre";

            return (
              <li
                key={request.id}
                className="rounded-lg border border-border bg-muted/40 px-3 py-3 transition hover:bg-muted/60 hover:shadow-md"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
                      aria-hidden="true"
                    >
                      {initials(memberName) || "?"}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {memberName}
                        </p>
                        <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-100 light:bg-amber-100 light:text-amber-950">
                          En attente
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.dates.length} jour
                        {request.dates.length > 1 ? "s" : ""} · {datesLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-11">
                    <button
                      type="button"
                      onClick={() => approve.mutate(request.id)}
                      disabled={decisionPending}
                      className="btn-primary"
                    >
                      Approuver
                    </button>
                    <button
                      type="button"
                      onClick={() => reject.mutate(request.id)}
                      disabled={decisionPending}
                      className="btn-outline"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
