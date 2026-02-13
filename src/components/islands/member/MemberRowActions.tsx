import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/islands/ui/dropdown-menu";
import { useArchiveMember } from "@/hooks/members/useArchiveMember";
import { useRestoreMember } from "@/hooks/members/useRestoreMember";

export default function MemberRowActions({ teams, member, onEdit }: any) {
  const { mutate: archive } = useArchiveMember();
  const { mutate: restore } = useRestoreMember();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <MoreHorizontal size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(member)}>
          Modifier
        </DropdownMenuItem>

        {!member.archived && (
          <DropdownMenuItem onClick={() => archive(member.id)}>
            Archiver
          </DropdownMenuItem>
        )}

        {member.archived && (
          <DropdownMenuItem onClick={() => restore(member.id)}>
            Restaurer
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
