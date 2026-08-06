export type DayOff = {
  id: string;
  date: string;
  memberId: string;
};

export type ToggleDayOffResult = {
  active: boolean;
  dayOff: DayOff | null;
};
