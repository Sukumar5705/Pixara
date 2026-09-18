// ─── Public Gallery Types ────────────────────────────────────────────────────

/**
 * A photo returned by POST /api/galleries/:slug/verify.
 * Intentionally minimal — only the fields the backend exposes
 * to public gallery visitors (no admin metadata).
 */
export interface GalleryPhoto {
  _id: string;
  originalName: string;
  url: string;
  createdAt: string;
}

/**
 * The full payload returned on successful PIN verification.
 */
export interface GalleryData {
  event: {
    title: string;
    description?: string;
  };
  photos: GalleryPhoto[];
  totalPhotos: number;
}

/**
 * API response wrapper for gallery verify.
 */
export interface GalleryVerifyResponse {
  success: boolean;
  data: GalleryData;
}
