import { useWithdrawLeaveRequest } from "@/hooks/leave-requests/useWithdrawLeaveRequest";
import { useLeaveRequests } from "@/hooks/leave-requests/useLeaveRequests";
import type { LeaveRequestStatus } from "@/lib/types";

const STATUS_LABELS: Record<LeaveRequestStatus, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
  withdrawn: "Retirée",
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

  return (
    <section className="space-y-4" aria-labelledby="mes-demandes-heading">
      <div>
        <h2
          id="mes-demandes-heading"
          className="text-lg font-semibold text-foreground"
        >
          Mes demandes
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Suivez le statut de vos demandes de congés.
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
        <p className="text-sm text-muted-foreground">Aucune demande pour le moment.</p>
      )}

      {requests.length > 0 && (
        <ul className="space-y-3">
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
                className="rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {request.dates.length} jour
                      {request.dates.length > 1 ? "s" : ""} —{" "}
                      {STATUS_LABELS[status] ?? status}
                    </p>
                    <p className="text-sm text-muted-foreground">{datesLabel}</p>
                  </div>
                  {status === "pending" && (
                    <button
                      type="button"
                      onClick={() => withdraw.mutate(request.id)}
                      disabled={withdraw.isPending}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-muted disabled:opacity-50"
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
