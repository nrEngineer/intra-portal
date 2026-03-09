export interface Team {
  id: number;
  name: string;
  members: TeamMember[];
  createdAt: string;
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  userName: string;
}

export interface ScheduleEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  teamId: number | null;
  teamName: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  teamId?: number;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  teamId?: number;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export interface CreateTeamRequest {
  name: string;
}

export interface UpdateTeamRequest {
  name: string;
}
