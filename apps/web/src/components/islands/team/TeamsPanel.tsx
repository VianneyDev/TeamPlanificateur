import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useTeams } from "@/hooks/teams/useTeams";
import { useDebounce } from "@/hooks/useDebounce";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { applyQueryStates, useQueryState } from "@/hooks/useQueryState";
import type { TeamStatus } from "@/lib/schemas";
import type { Team } from "@/lib/types";
import TeamModal from "@/components/islands/team/TeamModal";
import TeamRowActions from "@/components/islands/team/TeamRowActions";

const STATUS_OPTIONS: { value: TeamStatus; label: string }[] = [
  { value: "active", label: "Actives" },
  { value: "archived", label: "Archivées" },
  { value: "all", label: "Toutes" },
];

const SEARCH_DEBOUNCE_MS = 300;
const FETCH_INDICATOR_DELAY_MS = 200;
const INITIAL_SKELETON_ROWS = 4;
const TEAMS_PAGE_SIZE = 10;

function TeamsTableSkeletonBody({ rows }: { rows: number }) {
  const bar = (className: string) => (
    <div
      className={`rounded-md bg-muted animate-pulse motion-reduce:animate-none ${className}`}
    />
  );
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i} className="border-t border-border">
          <td className="px-4 py-3 align-middle">{bar("h-3.5 max-w-48")}</td>
          <td className="px-4 py-3 align-middle">{bar("h-3.5 w-10")}</td>
          <td className="px-4 py-3 text-right align-middle">
            {bar("ml-auto h-7 max-w-14")}
          </td>
        </tr>
      ))}
    </>
  );
}

type TeamsPanelProps = {
  /** SSR snapshots from Astro so first paint matches the request URL. */
  initialTeamsStatus?: string;
  initialTeamsPage?: string;
  initialTeamsSearch?: string;
};

export default function TeamsPanel({
  initialTeamsStatus = "active",
  initialTeamsPage = "1",
  initialTeamsSearch = "",
}: TeamsPanelProps) {
  const [teamsStatus] = useQueryState(
    "teamsStatus",
    "active",
    initialTeamsStatus,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamsPage, setTeamsPage] = useQueryState(
    "teamsPage",
    "1",
    initialTeamsPage,
  );
  const [urlTeamsSearch, setUrlTeamsSearch] = useQueryState(
    "teamsSearch",
    "",
    initialTeamsSearch,
  );
  const [searchInput, setSearchInput] = useState(urlTeamsSearch);

  const [debouncedSearch, flushSearch] = useDebounce(
    searchInput,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearchInput(urlTeamsSearch);
    flushSearch();
  }, [urlTeamsSearch, flushSearch]);

  useEffect(() => {
    if (debouncedSearch !== urlTeamsSearch) {
      setUrlTeamsSearch(debouncedSearch);
      setTeamsPage((p) => (p === "1" ? p : "1"));
    }
  }, [debouncedSearch, urlTeamsSearch, setUrlTeamsSearch, setTeamsPage]);

  const statusTyped = teamsStatus as TeamStatus;
  const pageNumber = Number(teamsPage);

  const { data, isLoading, isFetching, error, refetch } = useTeams({
    status: statusTyped,
    page: pageNumber,
    search: debouncedSearch,
    limit: TEAMS_PAGE_SIZE,
  });

  const teamsList = data?.data ?? [];
  const pagination = data?.pagination;

  const showFetchingOverlay = useDelayedFlag(
    isFetching && !isLoading,
    FETCH_INDICATOR_DELAY_MS,
  );

  const overlayRowCount = Math.max(1, teamsList.length);

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:gap-3 sm:p-5">
        <h2 className="sr-only">Équipes</h2>

        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <input
            type="search"
            placeholder="Rechercher…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="field pr-9"
            aria-label="Rechercher une équipe"
          />
          {searchInput.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                flushSearch();
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-primary w-full gap-1.5 sm:ml-auto sm:w-auto"
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={16} aria-hidden />
          Nouvelle équipe
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <span className="text-sm text-destructive">
            Impossible de charger les équipes.
          </span>
          <button
            type="button"
            className="btn-outline shrink-0"
            onClick={() => refetch()}
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-b border-border p-2 sm:px-3">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              applyQueryStates([
                {
                  key: "teamsStatus",
                  value: opt.value,
                  defaultValue: "active",
                },
                { key: "teamsPage", value: "1", defaultValue: "1" },
              ]);
            }}
            className={`filter-chip ${teamsStatus === opt.value ? "filter-chip-active" : ""}`}
            aria-pressed={teamsStatus === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Liste des équipes</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Nom
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Membres
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right font-medium sm:px-5"
              >
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="relative">
            {isLoading ? (
              <TeamsTableSkeletonBody rows={INITIAL_SKELETON_ROWS} />
            ) : (
              <>
                {teamsList.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 sm:px-5">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <p className="text-sm text-muted-foreground">
                          Aucune équipe pour ce filtre. Créez une équipe pour y
                          rattacher des membres.
                        </p>
                        <button
                          type="button"
                          className="btn-primary gap-1.5"
                          onClick={() => setCreateOpen(true)}
                        >
                          <Plus size={16} aria-hidden />
                          Nouvelle équipe
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {teamsList.map((team: Team) => (
                  <tr
                    key={team.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/35"
                  >
                    <td className="px-4 py-3 text-foreground sm:px-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{team.name}</span>
                        {team.archived && (
                          <span className="badge-archived">Archivée</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 tabular-nums text-muted-foreground sm:px-5">
                      {team._count.members ?? 0}
                    </td>

                    <td className="px-4 py-3 text-right sm:px-5">
                      <TeamRowActions
                        team={team}
                        onEdit={(team: Team) => setEditingTeam(team)}
                      />
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>

        {showFetchingOverlay && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 top-10 z-10 overflow-hidden bg-card/50 backdrop-blur-[1px]"
            aria-hidden
          >
            <table className="w-full table-fixed text-sm">
              <tbody>
                <TeamsTableSkeletonBody rows={overlayRowCount} />
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TeamModal
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {editingTeam && (
        <TeamModal
          mode="update"
          team={editingTeam}
          open={true}
          onClose={() => setEditingTeam(null)}
        />
      )}

      {(isLoading || teamsList.length > 0 || pageNumber > 1) && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
          <button
            type="button"
            disabled={pageNumber <= 1 || isLoading}
            onClick={() =>
              setTeamsPage((p) => String(Math.max(1, Number(p) - 1)))
            }
            className="pager-btn"
          >
            Précédent
          </button>

          <span className="text-sm text-muted-foreground">
            Page {pagination?.page ?? pageNumber} /{" "}
            {pagination?.totalPages ?? "—"}
            {pagination?.total != null ? (
              <span className="tabular-nums">
                {" "}
                · {pagination.total} équipe{pagination.total > 1 ? "s" : ""}
              </span>
            ) : null}
          </span>

          <button
            type="button"
            disabled={
              isLoading ||
              (pagination?.totalPages != null &&
                pageNumber >= pagination.totalPages)
            }
            onClick={() => setTeamsPage((p) => String(Number(p) + 1))}
            className="pager-btn"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
