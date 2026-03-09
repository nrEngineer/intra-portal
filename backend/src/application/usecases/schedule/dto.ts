import type { User } from "../../../domain/models/user.js";

export interface CreateEventInputDTO {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  teamId: string;
  allDay?: boolean;
  userId: string;
}

export interface UpdateEventInputDTO {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
}

export interface CreateTeamInputDTO {
  name: string;
  memberIds: string[];
}
