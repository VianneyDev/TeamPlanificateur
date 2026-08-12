import { useWithdrawLeaveRequest } from "@/hooks/leave-requests/useWithdrawLeaveRequest";
import { useLeaveRequests } from "@/hooks/leave-requests/useLeaveRequests";
import type { LeaveRequestStatus } from "@/lib/types";

const STATUS_LABELS: Record<LeaveRequestStatus, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
  withdrawn: "Retirée",
};

const STATUS_CHIP: Record<LeaveRequestStatus, string> = {
  pending:
    "border-amber-500/30 bg-amber-500/15 text-amber-100 light:bg-amber-100 light:text-amber-950",
  approved:
    "border-emerald-500/30 bg-emerald-500/15 text-emerald-100 light:bg-emerald-100 light:text-emerald-950",
  rejected: "border-destructive/30 bg-destructive/10 text-destructive",
  withdrawn: "border-border bg-muted text-muted-foreground",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

type MyLeaveRequestsProps = {
  year: number;
};

export default function MyLeaveRequests({ year }: MyLeaveRequestsProps) {
  const { data, isLoading, error, refetch } = useLeaveRequests();
  const withdraw = useWithdrawLeaveRequest(year);
  const requests = data?.data ?? [];
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <section className="space-y-4" aria-labelledby="mes-demandes-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="mes-demandes-heading"
            className="flex items-center gap-2 text-base font-semibold text-foreground"
          >
            Mes demandes
            {pendingCount > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-md bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                {pendingCount}
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Statut de vos demandes - créez-les depuis le calendrier.
          </p>
        </div>
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
          <span>Impossible de charger vos demandes.</span>
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
          <p className="text-sm font-medium text-foreground">
            Aucune demande pour le moment
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sélectionnez des jours ouvrés sur le calendrier, puis confirmez.
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
            const status = request.status as LeaveRequestStatus;

            return (
              <li
                key={request.id}
                className="rounded-lg border border-border bg-muted/40 px-3 py-3 transition hover:bg-muted/60 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {request.dates.length} jour
                        {request.dates.length > 1 ? "s" : ""}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_CHIP[status] ?? STATUS_CHIP.withdrawn}`}
                      >
                        {STATUS_LABELS[status] ?? status}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {datesLabel}
                    </p>
                  </div>
                  {status === "pending" && (
                    <button
                      type="button"
                      onClick={() => withdraw.mutate(request.id)}
                      disabled={withdraw.isPending}
                      className="btn-outline shrink-0"
                    >
                      Retirer
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
