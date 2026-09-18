import { useMutation, useQueryClient } from "@tanstack/react-query";
import { photosApi } from "../../api/photos";
import type { Photo } from "../../types/photo";

/**
 * Toggle photo selection. Admin-only (backend enforces).
 * Uses an optimistic update for instant UI feedback.
 */
export const useTogglePhotoSelection = (eventId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => photosApi.toggleSelect(photoId),

    // Optimistic update
    onMutate: async (photoId) => {
      await queryClient.cancelQueries({ queryKey: ["photos", eventId] });
      const previous = queryClient.getQueryData<Photo[]>(["photos", eventId]);

      if (previous) {
        queryClient.setQueryData<Photo[]>(
          ["photos", eventId],
          previous.map((p) =>
            p._id === photoId ? { ...p, isSelected: !p.isSelected } : p
          )
        );
      }

      return { previous };
    },

    onError: (_err, _photoId, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(["photos", eventId], context.previous);
      }
    },

    onSettled: () => {
      // Always sync with server after mutation
      queryClient.invalidateQueries({ queryKey: ["photos", eventId] });
    },
  });
};
