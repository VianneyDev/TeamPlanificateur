import TeamsPanel from "./TeamsPanel";
import AppProviders from "../providers/AppProviders";

export default function TeamsPanelWithProvider() {
  return (
    <AppProviders>
      <TeamsPanel />
    </AppProviders>
  );
}
