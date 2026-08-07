export type DayOffMember = {
  id: string;
  name: string;
};

export type DayOff = {
  id: string;
  date: string;
  memberId: string;
  member?: DayOffMember;
};

export type ToggleDayOffResult = {
  active: boolean;
  dayOff: DayOff | null;
};

export type ToggleDayOffRangeResult = {
  active: boolean;
  dayOffs: DayOff[];
};
