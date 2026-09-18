import api from "./axios";
import type { GalleryData, GalleryVerifyResponse } from "../types/gallery";

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface GalleryCredentials {
  galleryId: string;
  slug: string;
  url: string;
  isActive: boolean;
  publishedAt: string;
}

export interface PublishGalleryResult {
  galleryId: string;
  slug: string;
  pin: string;        // plain PIN — returned only once on publish
  url: string;
  publishedAt: string;
}

interface CredentialsResponse {
  success: boolean;
  data: GalleryCredentials;
}

interface PublishResponse {
  success: boolean;
  message: string;
  data: PublishGalleryResult;
}

interface DeactivateResponse {
  success: boolean;
  message: string;
}

export const galleriesApi = {
  // ── Public ────────────────────────────────────────────────────────────────

  /**
   * POST /api/galleries/:slug/verify
   * Public endpoint — no auth token required.
   * Verifies the customer PIN and returns the gallery photos.
   */
  verifyGallery: async (slug: string, pin: string): Promise<GalleryData> => {
    const response = await api.post<GalleryVerifyResponse>(
      `/galleries/${slug}/verify`,
      { pin }
    );
    return response.data.data;
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  /**
   * POST /api/galleries/publish
   * Publish (or republish) a gallery for an event. Admin only.
   * Returns the plain PIN — this is the only time it is sent.
   */
  publishGallery: async (
    eventId: string,
    customPin?: string
  ): Promise<PublishGalleryResult> => {
    const response = await api.post<PublishResponse>("/galleries/publish", {
      eventId,
      ...(customPin ? { customPin } : {}),
    });
    return response.data.data;
  },

  /**
   * GET /api/galleries/event/:eventId
   * Fetch gallery slug, URL, isActive status. Admin only.
   * PIN is never returned again after initial publish.
   */
  getGalleryCredentials: async (eventId: string): Promise<GalleryCredentials> => {
    const response = await api.get<CredentialsResponse>(
      `/galleries/event/${eventId}`
    );
    return response.data.data;
  },

  /**
   * PATCH /api/galleries/:id/deactivate
   * Deactivate a published gallery. Admin only.
   */
  deactivateGallery: async (galleryId: string): Promise<void> => {
    await api.patch<DeactivateResponse>(`/galleries/${galleryId}/deactivate`);
  },
};
