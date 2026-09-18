import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import type { Photo } from "../../types/photo";

export interface UploadFileParams {
  file: File;
  eventId: string;
  /** Called with 0–100 as the file bytes travel to the backend */
  onProgress: (pct: number) => void;
}

interface SinglePhotoResponse {
  success: boolean;
  data: Photo;
}

/**
 * Upload a photo via the backend proxy endpoint.
 *
 * WHY PROXY:
 * Backblaze B2 presigned PUT URLs require CORS configured on the B2 bucket.
 * Without that bucket-level config, browsers block the preflight OPTIONS
 * request and the upload fails with "Network Error".
 *
 * Instead we POST the raw binary to our own Express API which has no CORS
 * restrictions (same-origin request), and the backend streams it to B2 using
 * the AWS SDK — no browser-side CORS involved.
 *
 * Upload flow:
 *  1. POST /api/photos/upload?eventId=<id>
 *     Headers: x-file-name, x-file-type, x-file-size
 *     Body:    raw binary (application/octet-stream)
 *  2. Backend uploads to B2, saves Photo document, returns Photo
 *  3. Invalidate ["photos", eventId] so the grid refreshes
 */
export const useUploadPhoto = () => {
  const queryClient = useQueryClient();

  const uploadFile = async ({
    file,
    eventId,
    onProgress,
  }: UploadFileParams): Promise<Photo> => {
    const response = await api.post<SinglePhotoResponse>(
      `/photos/upload?eventId=${encodeURIComponent(eventId)}`,
      file, // axios sends File/Blob as raw binary body
      {
        headers: {
          // Tell express.raw() what content-type to expect
          "Content-Type": file.type || "application/octet-stream",
          // Pass file metadata via custom headers
          "x-file-name": encodeURIComponent(file.name),
          "x-file-type": file.type || "application/octet-stream",
          "x-file-size": String(file.size),
        },
        onUploadProgress: (evt) => {
          if (evt.total && evt.total > 0) {
            onProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      }
    );

    await queryClient.invalidateQueries({ queryKey: ["photos", eventId] });
    return response.data.data;
  };

  return { uploadFile };
};
