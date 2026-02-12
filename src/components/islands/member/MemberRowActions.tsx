import { useArchiveMember } from "@/hooks/members/useArchiveMember";
import { useRestoreMember } from "@/hooks/members/useRestoreMember";

export default function MemberRowActions({ member }: { member: any }) {
  const { mutate: archive } = useArchiveMember();
  const { mutate: restore } = useRestoreMember();

  if (member.archived) {
    return (
      <button
        onClick={() => restore(member.id)}
        className="text-emerald-400 hover:text-emerald-300"
      >
        Restaurer
      </button>
    );
  }

  return (
    <button
      onClick={() => archive(member.id)}
      className="text-red-400 hover:text-red-300"
    >
      Archiver
    </button>
  );
}
