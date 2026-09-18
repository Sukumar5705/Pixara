import React, { useRef, useState, useCallback, useEffect } from "react";
import { Camera, LockKeyhole, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

const PIN_LENGTH = 6;

interface PinGateProps {
  /** Error from the API — null when clean */
  apiError: string | null;
  /** Whether the verify mutation is in flight */
  isLoading: boolean;
  /** Called with the full 6-digit PIN string when the customer submits */
  onSubmit: (pin: string) => void;
}

/**
 * Premium customer-facing PIN entry screen for private photography galleries.
 * - 6 segmented digit inputs
 * - Auto-advance on keystroke, backspace to previous cell
 * - Full paste support
 * - Submit on Enter or button click
 * - Accessible: labels, focus management, aria-live error
 */
const PinGate: React.FC<PinGateProps> = ({ apiError, isLoading, onSubmit }) => {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Clear digits when a server-side error appears so the customer can re-enter
  useEffect(() => {
    if (apiError) {
      setDigits(Array(PIN_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
  }, [apiError]);

  const pin = digits.join("");
  const pinComplete = pin.length === PIN_LENGTH;

  const handleSubmit = useCallback(() => {
    if (pinComplete && !isLoading) {
      onSubmit(pin);
    }
  }, [pin, pinComplete, isLoading, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = "";
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      return;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const raw = e.target.value.replace(/\D/g, ""); // numeric only
    if (!raw) return;

    // Support pasting a full PIN into any cell
    if (raw.length > 1) {
      const chars = raw.slice(0, PIN_LENGTH).split("");
      const next = [...digits];
      chars.forEach((ch, i) => {
        if (index + i < PIN_LENGTH) next[index + i] = ch;
      });
      setDigits(next);
      const nextFocus = Math.min(index + chars.length, PIN_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = raw;
    setDigits(next);
    if (index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Determine error type for message copy
  const isNotFound = apiError?.toLowerCase().includes("not found") ||
    apiError?.toLowerCase().includes("inactive");
  const isWrongPin = apiError?.toLowerCase().includes("incorrect") ||
    apiError?.toLowerCase().includes("pin");

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      {/* ── Minimal header ───────────────────────────────────────────────── */}
      <header className="px-6 py-5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1769FF]">
          <Camera size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-extrabold tracking-tight text-[#111B33]">
          Photo<span className="text-[#1769FF]">Share</span>
        </span>
      </header>

      {/* ── Pin card ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-[420px] bg-white rounded-2xl border border-[#E4E8EE] px-8 py-10 animate-fade-up"
          style={{ boxShadow: "0 1px 4px 0 rgba(17,27,51,0.06), 0 4px 20px 0 rgba(17,27,51,0.04)" }}
        >
          {/* Lock icon */}
          <div className="flex justify-center mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FF]">
              <LockKeyhole size={22} className="text-[#1769FF]" strokeWidth={2} />
            </div>
          </div>

          {/* Eyebrow + title */}
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#8290A5] mb-1">
              Private Gallery
            </p>
            <h1 className="text-[20px] font-extrabold tracking-tight text-[#111B33]">
              Enter your access PIN
            </h1>
            <p className="mt-2 text-[13.5px] text-[#586982] leading-relaxed">
              This gallery is protected. Enter the PIN provided by your photographer.
            </p>
          </div>

          {/* ── Error state: gallery not found / inactive ──────────────── */}
          {isNotFound && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3">
              <AlertCircle size={15} className="text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-[#DC2626]">Gallery unavailable</p>
                <p className="text-[12.5px] text-[#DC2626]/80 mt-0.5">
                  This gallery link is invalid or has been deactivated by the photographer.
                </p>
              </div>
            </div>
          )}

          {/* ── Error state: wrong PIN ─────────────────────────────────── */}
          {isWrongPin && (
            <div
              className="mb-5 flex items-start gap-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={15} className="text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-[#DC2626]">Incorrect PIN</p>
                <p className="text-[12.5px] text-[#DC2626]/80 mt-0.5">
                  Please check the PIN provided with your gallery link and try again.
                </p>
              </div>
            </div>
          )}

          {/* ── Network/server error (generic) ────────────────────────── */}
          {apiError && !isNotFound && !isWrongPin && (
            <div
              className="mb-5 flex items-start gap-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={15} className="text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-[#DC2626]">Something went wrong</p>
                <p className="text-[12.5px] text-[#DC2626]/80 mt-0.5">
                  We couldn't reach the server. Please check your connection and try again.
                </p>
              </div>
            </div>
          )}

          {/* ── PIN inputs ────────────────────────────────────────────── */}
          {!isNotFound && (
            <>
              <div
                className="flex items-center justify-center gap-2 mb-6"
                role="group"
                aria-label="6-digit PIN input"
              >
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    id={`pin-digit-${i}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6} /* allow paste of full PIN into first cell */
                    value={digit}
                    aria-label={`PIN digit ${i + 1}`}
                    autoComplete="off"
                    autoFocus={i === 0}
                    disabled={isLoading}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className={[
                      "h-12 w-11 rounded-xl border text-center text-[18px] font-bold caret-transparent",
                      "text-[#111B33] transition-all outline-none",
                      "focus:border-[#1769FF] focus:ring-2 focus:ring-[#1769FF]/20",
                      digit
                        ? "border-[#1769FF] bg-[#EEF4FF]"
                        : "border-[#E4E8EE] bg-[#F7F9FC]",
                      isLoading ? "opacity-50 cursor-not-allowed" : "",
                    ].join(" ")}
                  />
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!pinComplete || isLoading}
                className={[
                  "w-full flex items-center justify-center gap-2 h-11 rounded-xl text-[14px] font-bold transition-all",
                  pinComplete && !isLoading
                    ? "bg-[#1769FF] text-white hover:bg-[#0F5BE7] active:bg-[#0E52D1]"
                    : "bg-[#E4E8EE] text-[#8290A5] cursor-not-allowed",
                ].join(" ")}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Verifying…</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Gallery</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-5 text-center text-[11.5px] text-[#8290A5]">
        Protected by PhotoShare &middot; Gallery link is private
      </footer>
    </div>
  );
};

export default PinGate;
