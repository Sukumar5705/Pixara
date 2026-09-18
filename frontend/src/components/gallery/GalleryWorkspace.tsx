import React, { useState } from "react";
import {
  Share2,
  Globe,
  Lock,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Loader2,
  PowerOff,
  Send,
} from "lucide-react";
import {
  useGalleryCredentials,
  usePublishGallery,
  useDeactivateGallery,
} from "../../hooks/galleries/useGallery";
import type { PublishGalleryResult } from "../../api/galleries";

interface GalleryWorkspaceProps {
  eventId: string;
}

// ── Copy helper hook ──────────────────────────────────────────────────────────
function useCopyText() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  return { copied, copy };
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface CopyRowProps {
  label: string;
  value: string;
  copyKey: string;
  mono?: boolean;
  href?: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}

const CopyRow: React.FC<CopyRowProps> = ({
  label,
  value,
  copyKey,
  mono,
  href,
  copied,
  onCopy,
}) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E4E8EE] bg-[#F7F9FC] px-4 py-3">
    <div className="min-w-0 flex-1">
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#8290A5] mb-0.5">
        {label}
      </p>
      <p
        className={[
          "truncate text-[13.5px] text-[#111B33]",
          mono ? "font-mono font-bold tracking-widest" : "font-medium",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open gallery in new tab"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E8EE] bg-white text-[#586982] hover:text-[#1769FF] hover:border-[#1769FF] transition-colors"
        >
          <ExternalLink size={14} />
        </a>
      )}
      <button
        onClick={() => onCopy(value, copyKey)}
        aria-label={`Copy ${label}`}
        className={[
          "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-bold transition-colors",
          copied === copyKey
            ? "border-[#20A66A] bg-[#20A66A]/10 text-[#20A66A]"
            : "border-[#E4E8EE] bg-white text-[#586982] hover:border-[#1769FF] hover:text-[#1769FF]",
        ].join(" ")}
      >
        {copied === copyKey ? (
          <>
            <Check size={12} /> Copied
          </>
        ) : (
          <>
            <Copy size={12} /> Copy
          </>
        )}
      </button>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Admin Gallery Workspace — shows inside EventDetailPage.
 *
 * States:
 *   1. Not yet published → "Publish Gallery" CTA
 *   2. Active gallery → shows link, deactivate option
 *   3. Inactive gallery → shows "Republish" CTA
 *   4. Just published → PIN reveal panel (only shown once)
 */
const GalleryWorkspace: React.FC<GalleryWorkspaceProps> = ({ eventId }) => {
  const { copied, copy } = useCopyText();

  // The PIN is only returned once (on publish). We hold it in local state
  // so we can show it to the admin immediately after publishing.
  const [justPublished, setJustPublished] = useState<PublishGalleryResult | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const {
    data: credentials,
    isLoading: credentialsLoading,
    isError: credentialsError,
    error: credentialsErr,
  } = useGalleryCredentials(eventId);

  const publishMutation = usePublishGallery(eventId);
  const deactivateMutation = useDeactivateGallery(eventId);

  const handlePublish = () => {
    publishMutation.mutate(
      {},
      {
        onSuccess: (result) => {
          setJustPublished(result);
          setShowDeactivateConfirm(false);
        },
      }
    );
  };

  const handleDeactivate = () => {
    if (!credentials) return;
    // Use galleryId from credentials (backend now returns it),
    // fall back to justPublished.galleryId if on same session.
    const galleryId = credentials.galleryId || justPublished?.galleryId;
    if (!galleryId) return;
    deactivateMutation.mutate(
      galleryId,
      {
        onSuccess: () => {
          setJustPublished(null);
          setShowDeactivateConfirm(false);
        },
        onError: () => {
          setShowDeactivateConfirm(false);
        },
      }
    );
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (credentialsLoading) {
    return (
      <WorkspaceShell>
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin text-[#8290A5]" />
        </div>
      </WorkspaceShell>
    );
  }

  // ── Error fetching (not 404) ─────────────────────────────────────────────
  const httpStatus = (credentialsErr as { response?: { status?: number } })?.response?.status;
  if (credentialsError && httpStatus !== 404) {
    return (
      <WorkspaceShell>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E8EE] bg-[#FAFAFA] py-10 text-center">
          <AlertCircle size={20} className="text-[#DC4C4C] mb-2" />
          <p className="text-[13.5px] font-bold text-[#111B33]">Unable to load gallery status</p>
          <p className="text-[12px] text-[#586982] mt-1">Something went wrong checking this event's gallery.</p>
        </div>
      </WorkspaceShell>
    );
  }

  // ── Just-published PIN reveal ────────────────────────────────────────────
  if (justPublished) {
    return (
      <WorkspaceShell badge="Active">
        {/* Success notice */}
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-[#EDFBF4] border border-[#20A66A]/30 px-4 py-3">
          <Globe size={15} className="text-[#20A66A] shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-[#20A66A]">Gallery published successfully</p>
            <p className="text-[12px] text-[#20A66A]/80 mt-0.5">
              Save the PIN below — it won't be shown again after you leave this page.
            </p>
          </div>
        </div>

        {/* PIN */}
        <div className="mb-3 rounded-xl border-2 border-[#1769FF]/30 bg-[#EEF4FF] px-4 py-4 text-center">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#8290A5] mb-1">Customer PIN (shown once)</p>
          <p className="text-[28px] font-black tracking-[0.22em] text-[#1769FF] font-mono">
            {justPublished.pin}
          </p>
          <button
            onClick={() => copy(justPublished.pin, "pin")}
            className={[
              "mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors",
              copied === "pin"
                ? "bg-[#20A66A]/10 text-[#20A66A]"
                : "bg-[#1769FF]/10 text-[#1769FF] hover:bg-[#1769FF]/20",
            ].join(" ")}
          >
            {copied === "pin" ? <Check size={12} /> : <Copy size={12} />}
            {copied === "pin" ? "Copied!" : "Copy PIN"}
          </button>
        </div>

        {/* Gallery URL */}
        <CopyRow
          label="Gallery Link"
          value={justPublished.url}
          copyKey="url"
          href={justPublished.url}
          copied={copied}
          onCopy={copy}
        />

        <div className="mt-4 flex items-center justify-between border-t border-[#E4E8EE] pt-4">
          <p className="text-[12px] text-[#8290A5]">
            Share the link + PIN with your customer.
          </p>
          <button
            onClick={() => setJustPublished(null)}
            className="text-[12px] font-bold text-[#586982] hover:text-[#111B33] transition-colors"
          >
            Done
          </button>
        </div>
      </WorkspaceShell>
    );
  }

  // ── Not yet published (404 from credentials endpoint) ───────────────────
  if (!credentials) {
    return (
      <WorkspaceShell badge="Unpublished">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F4F9] text-[#8290A5] mb-4">
            <Lock size={22} />
          </div>
          <h3 className="text-[15px] font-extrabold text-[#111B33]">Gallery not published yet</h3>
          <p className="mt-1.5 text-[13px] text-[#586982] max-w-[340px]">
            Publishing creates a secure PIN-protected link you can share with your customer.
            Only selected photos will be visible.
          </p>

          <button
            onClick={handlePublish}
            disabled={publishMutation.isPending}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#1769FF] px-6 py-2.5 text-[13.5px] font-bold text-white hover:bg-[#0F5BE7] disabled:opacity-60 transition-colors"
          >
            {publishMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {publishMutation.isPending ? "Publishing…" : "Publish Gallery"}
          </button>

          {publishMutation.isError && (
            <p className="mt-3 text-[12px] text-[#DC4C4C] font-medium">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </WorkspaceShell>
    );
  }

  // ── Active gallery ────────────────────────────────────────────────────────
  if (credentials.isActive) {
    const publishedDate = new Date(credentials.publishedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return (
      <WorkspaceShell badge="Active">
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-[#EDFBF4] border border-[#20A66A]/30 px-4 py-3">
          <Globe size={15} className="text-[#20A66A] shrink-0 mt-0.5" />
          <p className="text-[13px] font-bold text-[#20A66A]">
            Gallery is live · Published {publishedDate}
          </p>
        </div>

        <div className="space-y-2.5 mb-4">
          <CopyRow
            label="Gallery Link"
            value={credentials.url}
            copyKey="url"
            href={credentials.url}
            copied={copied}
            onCopy={copy}
          />
          <div className="flex items-center gap-3 rounded-xl border border-[#E4E8EE] bg-[#F7F9FC] px-4 py-3">
            <div className="flex-1">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#8290A5] mb-0.5">PIN</p>
              <p className="text-[13.5px] text-[#111B33] font-medium">
                ••••••&nbsp;&nbsp;
                <span className="text-[12px] text-[#8290A5] font-normal">
                  PIN was shown once at publish time. Republish to generate a new one.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#E4E8EE] pt-4">
          <button
            onClick={handlePublish}
            disabled={publishMutation.isPending}
            className="flex items-center gap-1.5 rounded-xl border border-[#E4E8EE] bg-white px-4 py-2 text-[13px] font-bold text-[#111B33] hover:bg-[#F7F9FC] disabled:opacity-60 transition-colors"
          >
            {publishMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Republish (new PIN)
          </button>

          {!showDeactivateConfirm ? (
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              <PowerOff size={14} />
              Deactivate
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] text-[#586982] font-medium">
                Customers will lose access. Confirm?
              </span>
              <button
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-[12.5px] font-bold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {deactivateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                Yes, deactivate
              </button>
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                className="text-[12.5px] font-bold text-[#586982] hover:text-[#111B33]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {(publishMutation.isError || deactivateMutation.isError) && (
          <p className="mt-2 text-[12px] text-[#DC4C4C] font-medium">
            Something went wrong. Please try again.
          </p>
        )}
      </WorkspaceShell>
    );
  }

  // ── Inactive / deactivated gallery ───────────────────────────────────────
  return (
    <WorkspaceShell badge="Inactive">
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-[#FEF9EC] border border-amber-200 px-4 py-3">
        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[13px] font-bold text-amber-700">
          This gallery has been deactivated. Customers can no longer access it.
        </p>
      </div>

      <div className="flex flex-col items-center py-4 text-center">
        <p className="text-[13px] text-[#586982] max-w-[320px]">
          Republish to create a new PIN-protected link for this event.
        </p>
        <button
          onClick={handlePublish}
          disabled={publishMutation.isPending}
          className="mt-4 flex items-center gap-2 rounded-xl bg-[#1769FF] px-6 py-2.5 text-[13.5px] font-bold text-white hover:bg-[#0F5BE7] disabled:opacity-60 transition-colors"
        >
          {publishMutation.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
          {publishMutation.isPending ? "Publishing…" : "Republish Gallery"}
        </button>
        {publishMutation.isError && (
          <p className="mt-3 text-[12px] text-[#DC4C4C] font-medium">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </WorkspaceShell>
  );
};

// ── Shell wrapper ─────────────────────────────────────────────────────────────

const badgeColors: Record<string, string> = {
  Active: "bg-[#EDFBF4] text-[#20A66A]",
  Inactive: "bg-[#FEF9EC] text-amber-700",
  Unpublished: "bg-[#F1F4F9] text-[#586982]",
};

const WorkspaceShell: React.FC<{
  badge?: string;
  children: React.ReactNode;
}> = ({ badge, children }) => (
  <div className="rounded-2xl border border-[#E4E8EE] bg-white p-6 shadow-[0_2px_12px_rgba(17,27,51,0.04)]">
    <div className="flex items-center justify-between pb-3 border-b border-[#E4E8EE] mb-5">
      <div className="flex items-center gap-2">
        <Share2 size={18} className="text-[#20A66A]" />
        <h2 className="text-[15px] font-extrabold text-[#111B33]">Gallery</h2>
      </div>
      {badge && (
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badgeColors[badge] ?? "bg-[#F1F4F9] text-[#586982]"}`}
        >
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

export default GalleryWorkspace;
