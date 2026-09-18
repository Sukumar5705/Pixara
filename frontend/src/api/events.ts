import api from "./axios";
import type { Event, CreateEventInput, UpdateEventInput } from "../types/event";
import type { User } from "../types";

export interface EventsResponse {
  success: boolean;
  count: number;
  data: Event[];
}

export interface SingleEventResponse {
  success: boolean;
  data: Event;
}

export interface TeamMembersResponse {
  success: boolean;
  count: number;
  data: User[];
}

export const eventsApi = {
  getEvents: async (): Promise<Event[]> => {
    const response = await api.get<EventsResponse>("/events");
    return response.data.data;
  },

  getEvent: async (id: string): Promise<Event> => {
    const response = await api.get<SingleEventResponse>(`/events/${id}`);
    return response.data.data;
  },

  createEvent: async (data: CreateEventInput): Promise<Event> => {
    const response = await api.post<SingleEventResponse>("/events", data);
    return response.data.data;
  },

  updateEvent: async (id: string, data: UpdateEventInput): Promise<Event> => {
    const response = await api.put<SingleEventResponse>(`/events/${id}`, data);
    return response.data.data;
  },

  updateTeamMembers: async (id: string, teamMembers: string[]): Promise<Event> => {
    const response = await api.put<SingleEventResponse>(`/events/${id}/team`, {
      teamMembers,
    });
    return response.data.data;
  },

  deleteEvent: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/events/${id}`);
    return response.data;
  },

  getTeamMembers: async (): Promise<User[]> => {
    const response = await api.get<TeamMembersResponse>("/auth/team-members");
    return response.data.data;
  },
};
