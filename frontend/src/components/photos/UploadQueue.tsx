import React from "react";
import { X, RotateCcw, CheckCircle2, AlertCircle, Image } from "lucide-react";
import type { UploadItem } from "../../types/photo";

interface UploadQueueProps {
  items: UploadItem[];
  onRetry: (item: UploadItem) => void;
  onRemove: (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const statusLabel: Record<UploadItem["status"], string> = {
  pending: "Waiting",
  uploading: "Uploading",
  complete: "Complete",
  failed: "Failed",
};

const statusColor: Record<UploadItem["status"], string> = {
  pending: "text-[#8290A5]",
  uploading: "text-[#1769FF]",
  complete: "text-[#20A66A]",
  failed: "text-red-500",
};

// ── Row ───────────────────────────────────────────────────────────────────────

const UploadRow: React.FC<{
  item: UploadItem;
  onRetry: (item: UploadItem) => void;
  onRemove: (id: string) => void;
}> = ({ item, onRetry, onRemove }) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E4E8EE] bg-[#FAFAFA] p-2.5">
      {/* Thumbnail */}
      <div className="shrink-0 h-[40px] w-[40px] rounded-[9px] overflow-hidden bg-[#E4E8EE] flex items-center justify-center">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.file.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <Image size={16} className="text-[#8290A5]" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[12.5px] font-bold text-[#111B33] leading-tight">
            {item.file.name}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status icon */}
            {item.status === "complete" && (
              <CheckCircle2 size={14} className="text-[#20A66A]" />
            )}
            {item.status === "failed" && (
              <AlertCircle size={14} className="text-red-500" />
            )}
            {/* Status text */}
            <span className={`text-[11px] font-bold ${statusColor[item.status]}`}>
              {item.status === "uploading"
                ? `${item.progress}%`
                : statusLabel[item.status]}
            </span>
          </div>
        </div>

        {/* Size */}
        <p className="text-[10.5px] text-[#8290A5] mt-0.5">
          {formatBytes(item.file.size)}
        </p>

        {/* Progress bar */}
        {(item.status === "uploading" || item.status === "complete") && (
          <div className="mt-1.5 h-1 w-full rounded-full bg-[#E4E8EE] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                item.status === "complete"
                  ? "bg-[#20A66A]"
                  : "bg-[#1769FF]"
              }`}
              style={{ width: `${item.status === "complete" ? 100 : item.progress}%` }}
            />
          </div>
        )}

        {/* Error message */}
        {item.status === "failed" && item.error && (
          <p className="text-[10.5px] text-red-500 mt-0.5 truncate" title={item.error}>
            {item.error}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {item.status === "failed" && (
          <button
            onClick={() => onRetry(item)}
            aria-label="Retry upload"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#1769FF] hover:bg-[#EEF4FF] transition-colors"
          >
            <RotateCcw size={13} />
          </button>
        )}
        {(item.status === "complete" || item.status === "failed" || item.status === "pending") && (
          <button
            onClick={() => onRemove(item.id)}
            aria-label="Remove from queue"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8290A5] hover:bg-[#F1F4F9] hover:text-[#586982] transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

// ── Queue list ────────────────────────────────────────────────────────────────

export const UploadQueue: React.FC<UploadQueueProps> = ({
  items,
  onRetry,
  onRemove,
}) => {
  const total = items.length;
  const done = items.filter((i) => i.status === "complete").length;
  const failed = items.filter((i) => i.status === "failed").length;
  const active = items.filter((i) => i.status === "uploading").length;

  return (
    <div className="rounded-xl border border-[#E4E8EE] bg-white overflow-hidden">
      {/* Queue header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#E4E8EE] bg-[#FAFAFA]">
        <p className="text-[12.5px] font-bold text-[#111B33]">
          Upload Queue
          {active > 0 && (
            <span className="ml-2 rounded-full bg-[#1769FF]/10 px-2 py-0.5 text-[10.5px] text-[#1769FF]">
              {active} uploading
            </span>
          )}
        </p>
        <p className="text-[11.5px] text-[#8290A5] font-semibold">
          {done}/{total} done
          {failed > 0 && (
            <span className="ml-2 text-red-500">{failed} failed</span>
          )}
        </p>
      </div>

      {/* Rows */}
      <div className="p-2.5 space-y-2 max-h-[260px] overflow-y-auto">
        {items.map((item) => (
          <UploadRow
            key={item.id}
            item={item}
            onRetry={onRetry}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};
