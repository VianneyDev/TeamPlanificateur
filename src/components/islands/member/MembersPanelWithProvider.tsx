import AppProviders from "@/components/islands/providers/AppProviders";
import MembersPanel from "@/components/islands/member/MembersPanel";

type MembersPanelWithProviderProps = {
  externalOnly?: boolean;
};

export default function MembersPanelWithProvider({
  externalOnly = false,
}: MembersPanelWithProviderProps) {
  return (
    <AppProviders>
      <MembersPanel externalOnly={externalOnly} />
    </AppProviders>
  );
}
