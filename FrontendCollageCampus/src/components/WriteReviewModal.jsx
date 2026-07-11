import React, { useState } from "react";
import { FaTimes, FaStar } from "react-icons/fa";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import { FIELD_LIMITS } from "../lib/fieldLimits";

export default function WriteReviewModal({
  isOpen,
  onClose,
  collegeId,
  collegeName,
  onReviewAdded,
}) {
  const { user, showToast } = useUser();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const charCount = reviewText.length;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login to write a review", "error");
      return;
    }
    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }
    if (charCount < FIELD_LIMITS.reviewMinChars) {
      showToast(
        `Review must be at least ${FIELD_LIMITS.reviewMinChars} characters`,
        "error",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const reviewData = {
        collegeId,
        collegeName,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Student",
        userEmail: user.email,
        userAvatar: user.photoURL || null,
        rating,
        reviewText: reviewText.trim(),
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "collegeReviews"), reviewData);
      showToast("Review submitted successfully!", "success");
      setRating(0);
      setReviewText("");
      if (onReviewAdded) onReviewAdded();
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast("Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-start sm:items-center justify-center p-3 sm:p-6 glass-overlay overflow-y-auto">
      <div
        className="glass-modal w-full max-w-lg max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 my-4 sm:my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close review form"
          >
            <FaTimes />
          </button>
          <h2 className="text-2xl font-bold">Write a Review</h2>
          <p className="text-primary text-sm mt-1">For {collegeName}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5 flex flex-col items-center">
            <label className="block text-sm font-bold text-text-main mb-2">
              Overall Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="p-2 min-w-[44px] min-h-[44px] focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <FaStar
                    size={32}
                    className={`transition-colors ${star <= (hoverRating || rating) ? "text-accent" : "text-gray-200"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-bold text-text-main mb-2">
              Your Review
            </label>
            <textarea
              required
              value={reviewText}
              maxLength={FIELD_LIMITS.reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              className="w-full px-4 py-3 border border-brand-border rounded-card focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              placeholder="Share your experience at this college..."
              rows="4"
            ></textarea>
            <p className="text-xs text-text-muted mt-2 text-right">
              {charCount}/{FIELD_LIMITS.reviewText} characters (min{" "}
              {FIELD_LIMITS.reviewMinChars})
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-card text-text-muted font-bold hover:bg-brand-bg/80 transition-colors duration-200 border border-brand-border transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                rating === 0 ||
                charCount < FIELD_LIMITS.reviewMinChars
              }
              className="px-6 py-2.5 rounded-card bg-primary text-white font-bold hover:bg-accent hover: transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-card flex items-center gap-2"
            >
              {isSubmitting ? "Submitting..." : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
