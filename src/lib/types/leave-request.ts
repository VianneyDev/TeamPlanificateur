export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "withdrawn";

export type LeaveRequestDate = {
  id: string;
  date: string;
};

export type LeaveRequest = {
  id: string;
  memberId: string;
  status: LeaveRequestStatus;
  dates: LeaveRequestDate[];
  createdAt?: string;
  updatedAt?: string;
};

export type PendingLeaveDate = {
  leaveRequestId: string;
  memberId: string;
  date: string;
};
