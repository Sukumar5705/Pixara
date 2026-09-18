import { useQuery } from "@tanstack/react-query";
import { photosApi } from "../../api/photos";
import type { Photo } from "../../types/photo";

/**
 * Fetch all photos for an event.
 * - Admin: all photos
 * - Team member: only their own photos
 *
 * The backend attaches temporary signed read URLs (1h TTL),
 * so we set a staleTime shorter than that.
 */
export const useEventPhotos = (eventId?: string) => {
  return useQuery<Photo[]>({
    queryKey: ["photos", eventId],
    queryFn: () => photosApi.getPhotosByEvent(eventId!),
    enabled: Boolean(eventId),
    staleTime: 45 * 60 * 1000, // 45 minutes (signed URL TTL is 1h)
  });
};
