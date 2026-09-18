import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { galleriesApi } from "../../api/galleries";
import type { GalleryCredentials, PublishGalleryResult } from "../../api/galleries";
import type { AxiosError } from "axios";

// ── Fetch gallery credentials for an event (admin) ───────────────────────────

export const useGalleryCredentials = (eventId: string) => {
  return useQuery<GalleryCredentials, AxiosError>({
    queryKey: ["gallery-credentials", eventId],
    queryFn: () => galleriesApi.getGalleryCredentials(eventId),
    // 404 means "not published yet" — don't treat as a fatal error in the UI
    retry: false,
  });
};

// ── Publish / republish gallery ───────────────────────────────────────────────

export const usePublishGallery = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation<PublishGalleryResult, AxiosError, { customPin?: string }>({
    mutationFn: ({ customPin }) =>
      galleriesApi.publishGallery(eventId, customPin),
    onSuccess: () => {
      // Refresh credentials so the workspace shows the new state
      queryClient.invalidateQueries({
        queryKey: ["gallery-credentials", eventId],
      });
      // Refresh event so status badge updates to "published"
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// ── Deactivate gallery ────────────────────────────────────────────────────────

export const useDeactivateGallery = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, string>({
    mutationFn: (galleryId) => galleriesApi.deactivateGallery(galleryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gallery-credentials", eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
