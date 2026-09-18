import type { User } from "./index";

export type EventStatus = "draft" | "active" | "published";

export interface Event {
  _id: string;
  title: string;
  description?: string;
  createdBy: User | string;
  teamMembers: User[];
  status?: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  teamMembers?: string[];
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  status?: EventStatus;
}

export interface UpdateTeamInput {
  teamMembers: string[];
}
