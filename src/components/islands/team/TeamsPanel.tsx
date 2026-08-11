import { useEffect, useState } from "react";
import { X } from "lucide-react";
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

  const { data, isLoading, isFetching, error } = useTeams({
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
    <div className="bg-card border border-border rounded-lg">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground shrink-0">Équipes</h2>

        <div className="flex min-w-0 justify-center px-2">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-muted py-2 pl-3 pr-9 rounded border border-border text-foreground placeholder:text-muted-foreground"
            />
            {searchInput.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  flushSearch();
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Effacer la recherche"
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          <TeamModal />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-red-400 border-b border-border">
          Erreur lors du chargement des équipes
        </div>
      )}

      <div className="flex gap-1 p-2 border-b border-border">
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
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              teamsStatus === opt.value
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Membres</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="relative">
            {isLoading ? (
              <TeamsTableSkeletonBody rows={INITIAL_SKELETON_ROWS} />
            ) : (
              <>
                {teamsList.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      Aucune équipe trouvée
                    </td>
                  </tr>
                )}

                {teamsList.map((team: Team) => (
                  <tr
                    key={team.id}
                    className="border-t border-border hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {team.name}

                      {team.archived && (
                        <span className="ml-2 text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
                          Archivé
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {team._count.members ?? 0}
                    </td>

                    <td className="px-4 py-3 text-right">
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
            className="absolute left-0 right-0 bottom-0 top-12 z-10 overflow-hidden bg-card/45 backdrop-blur-[1px] pointer-events-none"
            aria-hidden
          >
            <table className="w-full text-sm table-fixed">
              <tbody>
                <TeamsTableSkeletonBody rows={overlayRowCount} />
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingTeam && (
        <TeamModal
          mode="update"
          team={editingTeam}
          open={true}
          onClose={() => setEditingTeam(null)}
        />
      )}

      <div className="flex justify-between p-4">
        <button
          type="button"
          disabled={pageNumber <= 1 || isLoading}
          onClick={() =>
            setTeamsPage((p) => String(Math.max(1, Number(p) - 1)))
          }
          className={pageNumber <= 1 ? "cursor-not-allowed" : "cursor-pointer"}
        >
          Précédent
        </button>

        <span>
          Page {pagination?.page} / {pagination?.totalPages}
        </span>

        <button
          type="button"
          disabled={
            isLoading ||
            (pagination?.totalPages != null &&
              pageNumber >= pagination.totalPages)
          }
          onClick={() => setTeamsPage((p) => String(Number(p) + 1))}
          className={
            pagination?.totalPages != null &&
            pageNumber >= pagination.totalPages
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
