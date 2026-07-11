import { useEffect, useState } from "react";
import { FaCopy, FaTimes } from "react-icons/fa";

export default function FooterContactDialog({
  open,
  title,
  value,
  onClose,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center bg-[#081229]/70 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-card border border-brand-border bg-white p-5 sm:p-6 shadow-glass-lg my-4 sm:my-auto"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="footer-contact-dialog-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Contact Detail
            </p>
            <h3
              id="footer-contact-dialog-title"
              className="mt-1 text-lg font-bold text-[#0D0D12]"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-border text-text-muted transition hover:bg-brand-bg hover:text-[#0D0D12]"
          >
            <FaTimes />
          </button>
        </div>

        <div className="rounded-card border border-brand-border bg-brand-bg/40 p-4">
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#0D0D12]">
            {value}
          </p>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-card border border-brand-border px-5 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-brand-bg"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 rounded-card bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0D0D12]"
          >
            <FaCopy />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
