import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "../api/events";
import type { Event, CreateEventInput, UpdateEventInput } from "../types/event";

export const useEvents = () => {
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: eventsApi.getEvents,
  });
};

export const useEvent = (id?: string) => {
  return useQuery<Event>({
    queryKey: ["event", id],
    queryFn: () => eventsApi.getEvent(id!),
    enabled: Boolean(id),
  });
};

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: eventsApi.getTeamMembers,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventInput) => eventsApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventInput }) =>
      eventsApi.updateEvent(id, data),
    onSuccess: (updatedEvent: Event) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", updatedEvent._id] });
    },
  });
};

export const useUpdateEventTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, teamMembers }: { id: string; teamMembers: string[] }) =>
      eventsApi.updateTeamMembers(id, teamMembers),
    onSuccess: (updatedEvent: Event) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", updatedEvent._id] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsApi.deleteEvent(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.removeQueries({ queryKey: ["event", deletedId] });
    },
  });
};
