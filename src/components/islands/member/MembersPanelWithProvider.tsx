import AppProviders from "@/components/islands/providers/AppProviders";
import MembersPanel from "@/components/islands/member/MembersPanel";

type MembersPanelWithProviderProps = {
  externalOnly?: boolean;
  initialStatus?: string;
  initialPage?: string;
  initialSearch?: string;
};

export default function MembersPanelWithProvider({
  externalOnly = false,
  initialStatus,
  initialPage,
  initialSearch,
}: MembersPanelWithProviderProps) {
  return (
    <AppProviders>
      <MembersPanel
        externalOnly={externalOnly}
        initialStatus={initialStatus}
        initialPage={initialPage}
        initialSearch={initialSearch}
      />
    </AppProviders>
  );
}
