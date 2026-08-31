import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge, Button, TextField } from "@vianneytraina/ui";
import { useMembers } from "@/hooks/members/useMembers";
import { useTeams } from "@/hooks/teams/useTeams";
import { useDebounce } from "@/hooks/useDebounce";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { applyQueryStates, useQueryState } from "@/hooks/useQueryState";
import type { MemberStatus } from "@/lib/api/member";
import { memberBaseRoleLabel } from "@/lib/member-role-label";
import type { Member } from "@/lib/types";
import MemberModal from "@/components/islands/member/MemberModal";
import MemberRowActions from "@/components/islands/member/MemberRowActions";

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: "active", label: "Actifs" },
  { value: "archived", label: "Archivés" },
  { value: "all", label: "Tous" },
];

const SEARCH_DEBOUNCE_MS = 300;
const FETCH_INDICATOR_DELAY_MS = 200;
const INITIAL_SKELETON_ROWS = 4;
/** Liste équipes pour modales / actions (hors pagination tableau). */
const TEAM_SELECT_LIMIT = 200;

function MembersTableSkeletonBody({ rows }: { rows: number }) {
  const bar = (className: string) => (
    <div
      className={`rounded-md bg-muted animate-pulse motion-reduce:animate-none ${className}`}
    />
  );
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i} className="border-t border-border">
          <td className="px-4 py-3 align-middle">{bar("h-3.5 max-w-44")}</td>
          <td className="px-4 py-3 align-middle">{bar("h-3.5 max-w-28")}</td>
          <td className="px-4 py-3 align-middle">{bar("h-3.5 w-14")}</td>
          <td className="px-4 py-3 text-right align-middle">
            {bar("ml-auto h-7 max-w-14")}
          </td>
        </tr>
      ))}
    </>
  );
}

type MembersPanelProps = {
  /** When true, lists only External Members and creates them as external. */
  externalOnly?: boolean;
  /** SSR snapshots from Astro so first paint matches the request URL. */
  initialStatus?: string;
  initialPage?: string;
  initialSearch?: string;
};

export default function MembersPanel({
  externalOnly = false,
  initialStatus = "active",
  initialPage = "1",
  initialSearch = "",
}: MembersPanelProps) {
  const [status] = useQueryState("status", "active", initialStatus);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [page, setPage] = useQueryState("page", "1", initialPage);
  const [urlSearch, setUrlSearch] = useQueryState("search", "", initialSearch);
  const [searchInput, setSearchInput] = useState(urlSearch);

  const [debouncedSearch, flushSearch] = useDebounce(
    searchInput,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearchInput(urlSearch);
    flushSearch();
  }, [urlSearch, flushSearch]);

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      setUrlSearch(debouncedSearch);
      setPage((p) => (p === "1" ? p : "1"));
    }
  }, [debouncedSearch, urlSearch, setUrlSearch, setPage]);

  const statusTyped = status as MemberStatus;
  const pageNumber = Number(page);

  const { data, isLoading, isFetching, error, refetch } = useMembers({
    status: statusTyped,
    page: pageNumber,
    search: debouncedSearch,
    ...(externalOnly ? { isExternal: true } : {}),
  });

  const { data: teamsData, isLoading: teamsLoading } = useTeams({
    status: "active",
    page: 1,
    search: "",
    limit: TEAM_SELECT_LIMIT,
  });
  const teams = teamsData?.data ?? [];

  const membersList = data?.data ?? [];
  const pagination = data?.pagination;

  const showFetchingOverlay = useDelayedFlag(
    isFetching && !isLoading,
    FETCH_INDICATOR_DELAY_MS,
  );

  const overlayRowCount = Math.max(1, membersList.length);

  const title = externalOnly ? "Externes" : "Membres";
  const createLabel = externalOnly ? "Nouvel externe" : "Nouveau membre";
  const emptyCopy = externalOnly
    ? "Aucun membre externe pour ce filtre. Les externes déclarent leurs jours travaillés mensuels."
    : "Aucun membre pour ce filtre. Créez un membre et rattachez-le à une équipe.";
  const errorLabel = externalOnly
    ? "Impossible de charger les externes."
    : "Impossible de charger les membres.";
  const entityWord = externalOnly ? "externe" : "membre";

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:gap-3 sm:p-5">
        <h2 className="sr-only">{title}</h2>

        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <TextField
            type="search"
            placeholder="Rechercher…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pr-9"
            aria-label={`Rechercher un ${entityWord}`}
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

        <Button
          type="button"
          className="w-full sm:ml-auto sm:w-auto"
          onClick={() => setCreateOpen(true)}
          disabled={teamsLoading}
        >
          <Plus size={16} aria-hidden />
          {createLabel}
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <span className="text-sm text-destructive">{errorLabel}</span>
          <Button type="button" variant="outline" className="shrink-0" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-b border-border p-2 sm:px-3">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              applyQueryStates([
                { key: "status", value: opt.value, defaultValue: "active" },
                { key: "page", value: "1", defaultValue: "1" },
              ]);
            }}
            className={`filter-chip ${status === opt.value ? "filter-chip-active" : ""}`}
            aria-pressed={status === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Liste des {externalOnly ? "membres externes" : "membres"}
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Nom
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Équipe
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Rôle
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
              <MembersTableSkeletonBody rows={INITIAL_SKELETON_ROWS} />
            ) : (
              <>
                {membersList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 sm:px-5">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <p className="max-w-md text-sm text-muted-foreground">
                          {emptyCopy}
                        </p>
                        <Button
                          type="button"
                          onClick={() => setCreateOpen(true)}
                          disabled={teamsLoading}
                        >
                          <Plus size={16} aria-hidden />
                          {createLabel}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}

                {membersList.map((member: Member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/35"
                  >
                    <td className="px-4 py-3 text-foreground sm:px-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        {member.archived && <Badge>Archivé</Badge>}
                        {!externalOnly && member.isExternal && (
                          <Badge variant="accent">Externe</Badge>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground sm:px-5">
                      {member.teams?.length
                        ? member.teams.map((t) => t.name).join(", ")
                        : "—"}
                    </td>

                    <td className="px-4 py-3 sm:px-5">
                      <Badge>{memberBaseRoleLabel(member.role)}</Badge>
                    </td>

                    <td className="px-4 py-3 text-right sm:px-5">
                      <MemberRowActions
                        member={member}
                        onEdit={(member: Member) => setEditingMember(member)}
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
                <MembersTableSkeletonBody rows={overlayRowCount} />
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MemberModal
        teams={teams}
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultIsExternal={externalOnly}
      />

      {editingMember && (
        <MemberModal
          teams={teams}
          mode="update"
          member={editingMember}
          open={true}
          onClose={() => setEditingMember(null)}
          defaultIsExternal={externalOnly || editingMember.isExternal}
        />
      )}

      {(isLoading || membersList.length > 0 || pageNumber > 1) && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
          <button
            type="button"
            disabled={pageNumber <= 1 || isLoading}
            onClick={() => setPage((p) => String(Math.max(1, Number(p) - 1)))}
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
                · {pagination.total} {entityWord}
                {pagination.total > 1 ? "s" : ""}
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
            onClick={() => setPage((p) => String(Number(p) + 1))}
            className="pager-btn"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
