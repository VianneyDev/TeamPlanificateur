import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useMembers } from "@/hooks/members/useMembers";
import { useTeams } from "@/hooks/teams/useTeams";
import { useDebounce } from "@/hooks/useDebounce";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { useQueryState } from "@/hooks/useQueryState";
import type { MemberStatus } from "@/lib/api/member";
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

function MembersTableSkeletonBody({ rows }: { rows: number }) {
  const bar = (className: string) => (
    <div
      className={`rounded-md bg-slate-700/35 animate-pulse motion-reduce:animate-none ${className}`}
    />
  );
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i} className="border-t border-slate-800/80">
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

export default function MembersPanel() {
  const [status, setStatus] = useQueryState("status", "active");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [page, setPage] = useQueryState("page", "1");
  const [urlSearch, setUrlSearch] = useQueryState("search", "");
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

  const { data, isLoading, isFetching, error } = useMembers({
    status: statusTyped,
    page: pageNumber,
    search: debouncedSearch,
  });

  const { data: teams = [], isLoading: teamsLoading } = useTeams();

  const membersList = data?.data ?? [];
  const pagination = data?.pagination;

  const showFetchingOverlay = useDelayedFlag(
    isFetching && !isLoading,
    FETCH_INDICATOR_DELAY_MS,
  );

  const overlayRowCount = Math.max(1, membersList.length);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white shrink-0">Membres</h2>

        <div className="flex min-w-0 justify-center px-2">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-800 py-2 pl-3 pr-9 rounded border border-slate-600 text-white placeholder:text-slate-500"
            />
            {searchInput.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  flushSearch();
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                aria-label="Effacer la recherche"
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          {teamsLoading ? (
            <span className="invisible h-10 w-10 shrink-0" aria-hidden />
          ) : (
            <MemberModal teams={teams} />
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-red-400 border-b border-slate-700">
          Erreur lors du chargement des membres
        </div>
      )}

      <div className="flex gap-1 p-2 border-b border-slate-700">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatus(opt.value)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              status === opt.value
                ? "bg-slate-600 text-white"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <table className="w-full text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Équipe</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="relative">
            {isLoading ? (
              <MembersTableSkeletonBody rows={INITIAL_SKELETON_ROWS} />
            ) : (
              <>
                {membersList.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-slate-400"
                    >
                      Aucun membre trouvé
                    </td>
                  </tr>
                )}

                {membersList.map((member: Member) => (
                  <tr
                    key={member.id}
                    className="border-t border-slate-800 hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-2">
                        {member.name}

                        {member.archived && (
                          <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
                            Archivé
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {member.teams?.length
                        ? member.teams.map((t) => t.name).join(", ")
                        : "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-300 capitalize">
                      {member.role}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <MemberRowActions
                        teams={teams}
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
            className="absolute left-0 right-0 bottom-0 top-12 z-10 overflow-hidden bg-slate-900/45 backdrop-blur-[1px] pointer-events-none"
            aria-hidden
          >
            <table className="w-full text-sm table-fixed">
              <tbody>
                <MembersTableSkeletonBody rows={overlayRowCount} />
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingMember && (
        <MemberModal
          teams={teams}
          mode="update"
          member={editingMember}
          open={true}
          onClose={() => setEditingMember(null)}
        />
      )}

      <div className="flex justify-between p-4">
        <button
          type="button"
          disabled={pageNumber <= 1 || isLoading}
          onClick={() => setPage((p) => String(Math.max(1, Number(p) - 1)))}
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
          onClick={() => setPage((p) => String(Number(p) + 1))}
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
