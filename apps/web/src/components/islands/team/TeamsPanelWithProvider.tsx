import AppProviders from "@/components/islands/providers/AppProviders";
import TeamsPanel from "@/components/islands/team/TeamsPanel";

type TeamsPanelWithProviderProps = {
  initialTeamsStatus?: string;
  initialTeamsPage?: string;
  initialTeamsSearch?: string;
};

export default function TeamsPanelWithProvider({
  initialTeamsStatus,
  initialTeamsPage,
  initialTeamsSearch,
}: TeamsPanelWithProviderProps) {
  return (
    <AppProviders>
      <TeamsPanel
        initialTeamsStatus={initialTeamsStatus}
        initialTeamsPage={initialTeamsPage}
        initialTeamsSearch={initialTeamsSearch}
      />
    </AppProviders>
  );
}
