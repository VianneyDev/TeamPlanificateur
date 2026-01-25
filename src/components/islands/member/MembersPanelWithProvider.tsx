import AppProviders from "@/components/islands/providers/AppProviders";
import MembersPanel from "@/components/islands/member/MembersPanel";

export default function TeamsPanelWithProvider() {
  return (
    <AppProviders>
      <MembersPanel />
    </AppProviders>
  );
}
