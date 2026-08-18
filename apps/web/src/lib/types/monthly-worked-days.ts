export type MonthlyWorkedDays = {
  id: string;
  memberId: string;
  year: number;
  month: number;
  days: number;
  member?: {
    id: string;
    name: string;
    isExternal: boolean;
  };
};
