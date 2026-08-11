import { useApproveLeaveRequest } from "@/hooks/leave-requests/useApproveLeaveRequest";
import { useLeaveRequests } from "@/hooks/leave-requests/useLeaveRequests";
import { useRejectLeaveRequest } from "@/hooks/leave-requests/useRejectLeaveRequest";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

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
          className="text-lg font-semibold text-white"
        >
          À valider
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Approuvez ou refusez les demandes en attente.
        </p>
      </div>

      {isLoading && (
        <p role="status" className="text-sm text-slate-500">
          Chargement…
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200"
        >
          <span>Impossible de charger la file à valider.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-medium underline underline-offset-2 hover:text-white"
          >
            Réessayer
          </button>
        </div>
      )}

      {!isLoading && !error && requests.length === 0 && (
        <p className="text-sm text-slate-500">
          Aucune demande en attente.
        </p>
      )}

      {requests.length > 0 && (
        <ul className="space-y-3">
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
                className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      {memberName} — {request.dates.length} jour
                      {request.dates.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-slate-400">{datesLabel}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => approve.mutate(request.id)}
                      disabled={decisionPending}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      Approuver
                    </button>
                    <button
                      type="button"
                      onClick={() => reject.mutate(request.id)}
                      disabled={decisionPending}
                      className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
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
