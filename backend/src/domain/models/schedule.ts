export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  teamId: string;
  createdBy: string;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
}
