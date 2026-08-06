import TeamCalendar from "@/components/islands/calendar/TeamCalendar";
import AppProviders from "@/components/islands/providers/AppProviders";

type Props = {
  actingMemberName: string;
};

export default function TeamCalendarWithProvider(props: Props) {
  return (
    <AppProviders>
      <TeamCalendar {...props} />
    </AppProviders>
  );
}
