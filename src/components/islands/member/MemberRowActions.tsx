import { useArchiveMember } from "@/hooks/members/useArchiveMember";

export default function MemberRowActions({ member }: { member: any }) {
  const { mutate: archiveMember } = useArchiveMember();

  return (
    <button
      onClick={() => archiveMember(member.id)}
      className="text-red-400 hover:text-red-300"
    >
      Archiver
    </button>
  );
}
