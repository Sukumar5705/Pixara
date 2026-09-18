import api from "./axios";
import type {
  Photo,
  SignedUrlResponse,
  GetSignedUrlInput,
  SaveMetadataInput,
} from "../types/photo";

// ─── Response shapes ────────────────────────────────────────────────────────

interface PhotosResponse {
  success: boolean;
  count: number;
  data: Photo[];
}

interface SinglePhotoResponse {
  success: boolean;
  data: Photo;
}

interface SignedUrlApiResponse {
  success: boolean;
  data: SignedUrlResponse;
}

interface DeletePhotoResponse {
  success: boolean;
  message: string;
}

// ─── API functions ───────────────────────────────────────────────────────────

export const photosApi = {
  /**
   * POST /api/photos/signed-url
   * Request a presigned B2 upload URL for a single file.
   * Returns { uploadUrl, storageKey }.
   */
  getSignedUrl: async (params: GetSignedUrlInput): Promise<SignedUrlResponse> => {
    const response = await api.post<SignedUrlApiResponse>(
      "/photos/signed-url",
      params
    );
    return response.data.data;
  },

  /**
   * POST /api/photos
   * Save photo metadata after a successful direct-to-B2 upload.
   */
  saveMetadata: async (data: SaveMetadataInput): Promise<Photo> => {
    const response = await api.post<SinglePhotoResponse>("/photos", data);
    return response.data.data;
  },

  /**
   * GET /api/photos/event/:eventId
   * Fetch all photos for an event.
   * Admins see all; team members see only their own.
   * Backend attaches a signed read URL to each photo.
   */
  getPhotosByEvent: async (eventId: string): Promise<Photo[]> => {
    const response = await api.get<PhotosResponse>(
      `/photos/event/${eventId}`
    );
    return response.data.data;
  },

  /**
   * PATCH /api/photos/:id/select
   * Toggle isSelected on a photo. Admin only (enforced by backend).
   */
  toggleSelect: async (photoId: string): Promise<Photo> => {
    const response = await api.patch<SinglePhotoResponse>(
      `/photos/${photoId}/select`
    );
    return response.data.data;
  },

  /**
   * DELETE /api/photos/:id
   * Delete a photo. Allowed for owner or admin (enforced by backend).
   */
  deletePhoto: async (
    photoId: string
  ): Promise<DeletePhotoResponse> => {
    const response = await api.delete<DeletePhotoResponse>(
      `/photos/${photoId}`
    );
    return response.data;
  },
};
