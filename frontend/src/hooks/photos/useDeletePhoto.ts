import { useMutation, useQueryClient } from "@tanstack/react-query";
import { photosApi } from "../../api/photos";

/**
 * Delete a photo by ID.
 * The backend enforces ownership/admin check.
 * On success, the photo list for the event is invalidated.
 */
export const useDeletePhoto = (eventId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => photosApi.deletePhoto(photoId),
    onSuccess: () => {
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ["photos", eventId] });
      }
    },
  });
};
