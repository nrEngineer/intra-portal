import type { ScheduleEvent } from "../../../domain/models/schedule.js";

export interface TeamRow {
  id: string;
  name: string;
  createdAt: string;
}

export interface TeamMemberRow {
  teamId: string;
  userId: string;
}

export interface ScheduleRepository {
  // Teams
  findTeamsByUserId(userId: string): Promise<Array<TeamRow & { memberIds: string[] }>>;
  createTeam(data: { id: string; name: string; createdAt: string }): Promise<TeamRow>;
  addTeamMembers(members: Array<{ id: string; teamId: string; userId: string }>): Promise<void>;
  findTeamById(id: string): Promise<TeamRow | null>;
  updateTeam(id: string, name: string): Promise<TeamRow | null>;
  deleteTeam(id: string): Promise<boolean>;
  isTeamMember(teamId: string, userId: string): Promise<boolean>;

  // Events
  findEvents(teamId: string, start?: string, end?: string): Promise<ScheduleEvent[]>;
  findEventById(id: string): Promise<ScheduleEvent | null>;
  createEvent(data: ScheduleEvent): Promise<ScheduleEvent>;
  updateEvent(id: string, data: Partial<ScheduleEvent>): Promise<ScheduleEvent | null>;
  deleteEvent(id: string): Promise<boolean>;
}
