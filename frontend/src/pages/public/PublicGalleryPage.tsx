import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Camera, RefreshCw, Loader2 } from "lucide-react";
import type { GalleryData } from "../../types/gallery";
import { useVerifyGallery } from "../../hooks/galleries/useVerifyGallery";
import PinGate from "../../components/gallery/PinGate";
import GalleryHeader from "../../components/gallery/GalleryHeader";
import GalleryGrid from "../../components/gallery/GalleryGrid";
import GalleryLightbox from "../../components/gallery/GalleryLightbox";
import { SkeletonCard } from "../../components/gallery/GalleryGrid";

// ─── Error page ───────────────────────────────────────────────────────────────

interface GalleryErrorPageProps {
  title: string;
  message: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

const GalleryErrorPage: React.FC<GalleryErrorPageProps> = ({
  title,
  message,
  showRetry,
  onRetry,
}) => (
  <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
    <header className="px-6 py-5 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1769FF]">
        <Camera size={14} className="text-white" strokeWidth={2.5} />
      </div>
      <span className="text-[15px] font-extrabold tracking-tight text-[#111B33]">
        Photo<span className="text-[#1769FF]">Share</span>
      </span>
    </header>
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-[380px]">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F4F9]">
          <Camera size={22} className="text-[#8290A5]" />
        </div>
        <h2 className="text-[20px] font-extrabold tracking-tight text-[#111B33]">{title}</h2>
        <p className="mt-2 text-[13.5px] text-[#586982] leading-relaxed">{message}</p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#E4E8EE] bg-white px-5 py-2.5 text-[13px] font-bold text-[#111B33] hover:bg-[#F7F9FC] transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        )}
      </div>
    </main>
  </div>
);

// ─── Loading page ─────────────────────────────────────────────────────────────

const GalleryLoadingPage: React.FC = () => (
  <div className="min-h-screen bg-[#F7F9FC]">
    {/* Minimal brand bar */}
    <div className="bg-white border-b border-[#E4E8EE]">
      <div className="px-6 py-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1769FF]">
          <Camera size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-extrabold tracking-tight text-[#111B33]">
          Photo<span className="text-[#1769FF]">Share</span>
        </span>
      </div>
      {/* Skeleton header identity */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="h-3 w-24 rounded-full bg-[#E4E8EE] mb-3 animate-pulse" />
        <div className="h-8 w-64 rounded-xl bg-[#E4E8EE] mb-2 animate-pulse" />
        <div className="h-4 w-48 rounded-lg bg-[#E4E8EE] animate-pulse" />
      </div>
    </div>

    {/* Skeleton grid */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>

    {/* Centered loader */}
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-md border border-[#E4E8EE]">
      <Loader2 size={14} className="animate-spin text-[#1769FF]" />
      <span className="text-[12.5px] font-bold text-[#586982]">Loading gallery…</span>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

type PageState =
  | { kind: "pin" }
  | { kind: "loading" }
  | { kind: "gallery"; data: GalleryData }
  | { kind: "not_found" }
  | { kind: "server_error" };

/**
 * Public gallery page at /gallery/:slug.
 *
 * Flow:
 *   PIN screen → verify POST → gallery view
 *
 * This page has NO dependency on auth state, ProtectedRoute, or the admin layout.
 * It must remain accessible to unauthenticated customers.
 */
const PublicGalleryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [state, setState] = useState<PageState>({ kind: "pin" });
  const [pinError, setPinError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { mutate: verifyPin, isPending } = useVerifyGallery({
    onSuccess: (data) => {
      setPinError(null);
      setState({ kind: "gallery", data });
    },
    onError: (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message ?? "";

      if (status === 404) {
        // Gallery doesn't exist or isActive = false
        setPinError(message || "Gallery not found or inactive");
        // Keep on pin state so the not-found message shows inside PinGate
        setState({ kind: "pin" });
      } else if (status === 401) {
        // Wrong PIN — stay on pin screen, show inline error
        setPinError(message || "Incorrect PIN");
        setState({ kind: "pin" });
      } else {
        // Network / server error
        setPinError(message || "server_error");
        setState({ kind: "pin" });
      }
    },
  });

  const handlePinSubmit = useCallback(
    (pin: string) => {
      if (!slug) return;
      setPinError(null);
      verifyPin({ slug, pin });
    },
    [slug, verifyPin]
  );

  const handleRetry = useCallback(() => {
    setState({ kind: "pin" });
    setPinError(null);
  }, []);

  // ── Lightbox helpers ────────────────────────────────────────────────────
  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const handlePrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);
  const handleNext = useCallback(
    (totalPhotos: number) => {
      setLightboxIndex((i) => (i !== null && i < totalPhotos - 1 ? i + 1 : i));
    },
    []
  );

  // ── Renders ─────────────────────────────────────────────────────────────

  if (state.kind === "loading") {
    return <GalleryLoadingPage />;
  }

  if (state.kind === "not_found") {
    return (
      <GalleryErrorPage
        title="Gallery not found"
        message="This gallery link is invalid or no longer available. Please check the link provided by your photographer."
      />
    );
  }

  if (state.kind === "server_error") {
    return (
      <GalleryErrorPage
        title="Something went wrong"
        message="We couldn't load this gallery right now. Please check your connection and try again."
        showRetry
        onRetry={handleRetry}
      />
    );
  }

  if (state.kind === "pin") {
    return (
      <PinGate
        apiError={pinError}
        isLoading={isPending}
        onSubmit={handlePinSubmit}
      />
    );
  }

  // ── Gallery view ──────────────────────────────────────────────────────────
  const { data } = state;

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <GalleryHeader
        title={data.event.title}
        description={data.event.description}
        photoCount={data.totalPhotos}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <GalleryGrid photos={data.photos} onPhotoClick={openLightbox} />
      </main>

      {lightboxIndex !== null && (
        <GalleryLightbox
          photos={data.photos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={handlePrev}
          onNext={() => handleNext(data.photos.length)}
        />
      )}

      <footer className="border-t border-[#E4E8EE] bg-white py-5 text-center text-[11.5px] text-[#8290A5]">
        Protected by Pixara &middot; This gallery is private and confidential
      </footer>
    </div>
  );
};

export default PublicGalleryPage;
