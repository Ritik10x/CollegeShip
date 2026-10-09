import { useEffect, useState } from "react";
import { FaExpandAlt, FaTimes } from "react-icons/fa";

/**
 * Compact input/textarea with optional dialog for editing long text without breaking layout.
 */
export default function ExpandableTextField({
  label,
  name,
  value,
  onChange,
  maxLength,
  placeholder,
  required = false,
  previewLength = 28,
  dialogTitle,
  multiline = false,
  sanitize,
  inputMode = "text",
  optional = false,
  className = "",
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!dialogOpen) setDraft(value);
  }, [dialogOpen, value]);

  useEffect(() => {
    if (!dialogOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setDialogOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [dialogOpen]);

  const applySanitize = (next) => (sanitize ? sanitize(next) : next);

  const handleInlineChange = (e) => {
    onChange({ target: { name, value: applySanitize(e.target.value) } });
  };

  const handleDraftChange = (e) => {
    setDraft(applySanitize(e.target.value));
  };

  const saveDialog = () => {
    onChange({ target: { name, value: draft } });
    setDialogOpen(false);
  };

  const showExpand = value.length > previewLength;
  const InputTag = multiline ? "textarea" : "input";

  return (
    <>
      <div className={className}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-text-muted">
            {label}
            {optional && (
              <span className="ml-1 font-normal normal-case text-text-muted/80">
                (optional)
              </span>
            )}
          </label>
          {showExpand && (
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary hover:text-accent"
            >
              <FaExpandAlt size={10} />
              Expand
            </button>
          )}
        </div>
        <InputTag
          name={name}
          required={required && !optional}
          maxLength={maxLength}
          value={value}
          onChange={handleInlineChange}
          inputMode={inputMode}
          rows={multiline ? 2 : undefined}
          placeholder={placeholder}
          className={`w-full min-w-0 break-words rounded-card border border-border-subtle bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 [overflow-wrap:anywhere] ${
            multiline ? "min-h-[72px] resize-none" : ""
          }`}
        />
        <p className="mt-1 text-right text-[10px] text-text-muted">
          {value.length}/{maxLength}
        </p>
      </div>

      {dialogOpen && (
        <div
          className="fixed inset-0 z-[1200] flex items-start sm:items-center justify-center bg-[#081229]/70 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto"
          onClick={() => setDialogOpen(false)}
          role="presentation"
        >
          <div
            className="my-4 w-full max-w-lg rounded-card border border-brand-border bg-white p-5 shadow-glass-lg sm:my-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-[#0D0D12]">
                {dialogTitle || label}
              </h3>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                aria-label="Close"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border text-text-muted hover:bg-brand-bg"
              >
                <FaTimes />
              </button>
            </div>
            <textarea
              value={draft}
              onChange={handleDraftChange}
              maxLength={maxLength}
              rows={5}
              className="w-full min-w-0 resize-none break-words rounded-card border border-brand-border bg-brand-bg/40 px-4 py-3 text-sm leading-relaxed outline-none focus:border-primary [overflow-wrap:anywhere]"
              placeholder={placeholder}
            />
            <p className="mt-1 text-right text-[10px] text-text-muted">
              {draft.length}/{maxLength}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-card border border-brand-border px-4 py-2 text-sm font-semibold text-text-muted hover:bg-brand-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveDialog}
                className="rounded-card bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#0D0D12]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
