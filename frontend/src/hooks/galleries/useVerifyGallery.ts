import { useMutation } from "@tanstack/react-query";
import { galleriesApi } from "../../api/galleries";
import type { GalleryData } from "../../types/gallery";
import type { AxiosError } from "axios";

interface VerifyError {
  success: false;
  message: string;
}

/**
 * useMutation hook to verify a gallery PIN.
 *
 * Usage:
 *   const { mutate, isPending } = useVerifyGallery();
 *   mutate({ slug, pin });
 */
export const useVerifyGallery = (options?: {
  onSuccess?: (data: GalleryData) => void;
  onError?: (error: AxiosError<VerifyError>) => void;
}) => {
  return useMutation<GalleryData, AxiosError<VerifyError>, { slug: string; pin: string }>({
    mutationFn: ({ slug, pin }) => galleriesApi.verifyGallery(slug, pin),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
