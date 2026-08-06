import AppProviders from "@/components/islands/providers/AppProviders";
import MonthlyWorkedDaysPanel from "@/components/islands/monthly-worked-days/MonthlyWorkedDaysPanel";

type Props = {
  actingMemberId: string;
  isManager: boolean;
  isExternal: boolean;
};

export default function MonthlyWorkedDaysPanelWithProvider(props: Props) {
  return (
    <AppProviders>
      <MonthlyWorkedDaysPanel {...props} />
    </AppProviders>
  );
}
