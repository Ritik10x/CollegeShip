import { useEffect, useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { FIELD_LIMITS } from "../lib/fieldLimits";
import {
  shouldTruncateChars,
  truncateChars,
} from "../lib/reviewText";

function formatReviewDate(createdAt) {
  if (!createdAt?.toDate) return "Just now";
  return createdAt.toDate().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReviewCard({
  review,
  showDelete = false,
  currentUserId,
  onDelete,
  compact = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const previewLimit = FIELD_LIMITS.reviewPreviewChars;
  const reviewText = review.reviewText || "";
  const isLong = shouldTruncateChars(reviewText, previewLimit);
  const previewText = isLong
    ? `${truncateChars(reviewText, previewLimit)}…`
    : reviewText;
  const canDelete = showDelete && currentUserId === review.userId;

  useEffect(() => {
    if (!expanded) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setExpanded(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  return (
    <>
      <article
        className={`relative rounded-card border border-border-subtle bg-white shadow-xs transition-all hover:border-primary/20 hover:shadow-sm ${
          compact ? "p-3.5" : "p-4"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-bold uppercase text-white ${
              compact ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm"
            }`}
          >
            {review.userAvatar ? (
              <img
                src={review.userAvatar}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              review.userName?.charAt(0) || "S"
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={`truncate font-bold text-[#0D0D12] ${
                    compact ? "text-sm" : "text-sm"
                  }`}
                >
                  {review.userName}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={compact ? 10 : 11}
                        className={
                          star <= review.rating ? "text-accent" : "text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {formatReviewDate(review.createdAt)}
                  </span>
                </div>
              </div>

              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete?.(review.id)}
                  className="shrink-0 rounded-lg border border-[#B3261E]/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#B3261E] transition hover:bg-[#B3261E]/10"
                >
                  Delete
                </button>
              )}
            </div>

            <p
              className={`mt-2 break-words text-text-muted leading-relaxed [overflow-wrap:anywhere] ${
                compact ? "text-xs line-clamp-2" : "text-sm line-clamp-3"
              }`}
            >
              {previewText}
            </p>

            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mt-2 text-xs font-bold text-primary transition hover:text-accent"
              >
                Read full review
              </button>
            )}
          </div>
        </div>
      </article>

      {expanded && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#081229]/65 p-4 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-lg min-w-0 overflow-hidden rounded-card border border-brand-border bg-white p-5 shadow-glass-lg"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`review-dialog-${review.id}`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold uppercase text-white">
                  {review.userAvatar ? (
                    <img
                      src={review.userAvatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    review.userName?.charAt(0) || "S"
                  )}
                </div>
                <div className="min-w-0">
                  <h3
                    id={`review-dialog-${review.id}`}
                    className="truncate text-base font-bold text-[#0D0D12]"
                  >
                    {review.userName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          size={12}
                          className={
                            star <= review.rating
                              ? "text-accent"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-text-muted">
                      {formatReviewDate(review.createdAt)}
                    </span>
                    <span className="text-xs text-text-muted">
                      • {reviewText.length} characters
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Close review"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-border text-text-muted transition hover:bg-brand-bg hover:text-[#0D0D12]"
              >
                <FaTimes />
              </button>
            </div>

            <div className="max-h-[min(50vh,320px)] overflow-x-hidden overflow-y-auto rounded-card border border-brand-border bg-brand-bg/40 px-5 py-4 custom-scrollbar">
              <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-[#0D0D12] [overflow-wrap:anywhere]">
                {reviewText}
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-card border border-brand-border px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-brand-bg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
