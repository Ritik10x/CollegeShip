import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronLeft, FaChevronRight, FaStar, FaTimes } from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FIELD_LIMITS } from "../lib/fieldLimits";
import { shouldTruncateChars, truncateChars } from "../lib/reviewText";
import Reveal from "./Reveal";

const CARD_SLIDE_CLASS =
  "flex-shrink-0 w-1/2 sm:w-1/3 lg:w-1/4 xl:w-1/5 px-2";

function useSlideStep() {
  const [step, setStep] = useState(50);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width >= 1280) setStep(20);
      else if (width >= 1024) setStep(25);
      else if (width >= 640) setStep(33.333333);
      else setStep(50);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return step;
}

const getInitials = (name) =>
  (name || "Student")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
  const quote = review.quote || "";
  const previewLimit = FIELD_LIMITS.reviewPreviewChars;
  const isLong = shouldTruncateChars(quote, previewLimit);
  const previewText = isLong ? truncateChars(quote, previewLimit) : quote;

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
      <article className="group flex h-full min-h-[220px] w-full min-w-0 flex-col items-center overflow-hidden rounded-card border border-brand-border/70 bg-white p-5 text-center shadow-card transition-all duration-200 ease-out hover:-translate-y-1 hover:border-accent/30 hover:shadow-glass-lg">
        {review.avatarUrl ? (
          <img
            src={review.avatarUrl}
            alt={`${review.name || "Student"} profile`}
            className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-brand-bg shadow-card"
          />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-card"
            style={{ backgroundColor: review.avatarColor || "#0A2647" }}
          >
            {getInitials(review.name)}
          </div>
        )}

        <h3 className="mt-3 line-clamp-1 w-full break-words text-sm font-semibold text-[#0D0D12]">
          {review.name}
        </h3>

        <p className="mt-1.5 line-clamp-2 max-w-full break-words rounded-full bg-brand-bg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary [overflow-wrap:anywhere]">
          {review.institution}
        </p>

        <div
          className="mt-2.5 flex gap-0.5"
          aria-label={`${rating} out of 5 stars`}
        >
          {[...Array(rating)].map((_, i) => (
            <FaStar key={i} className="text-accent" size={12} />
          ))}
        </div>

        <blockquote className="mt-3 w-full min-w-0 flex-1 text-xs leading-relaxed text-text-muted">
          <p className="break-words [overflow-wrap:anywhere]">
            &ldquo;{previewText}
            {isLong ? "…" : ""}&rdquo;
            {isLong && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setExpanded(true);
                  }}
                  className="relative z-10 inline font-bold text-primary transition hover:text-accent"
                >
                  more
                </button>
              </>
            )}
          </p>
        </blockquote>
      </article>

      {expanded &&
        createPortal(
          <div
            className="fixed inset-0 z-[1100] flex items-start sm:items-center justify-center bg-[#081229]/65 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto"
            onClick={() => setExpanded(false)}
            role="presentation"
          >
            <div
              className="my-4 w-full max-w-lg min-w-0 overflow-hidden rounded-card border border-brand-border bg-white p-5 shadow-glass-lg sm:my-auto"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`showcase-review-dialog-${review.id}`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  {review.avatarUrl ? (
                    <img
                      src={review.avatarUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        backgroundColor: review.avatarColor || "#0A2647",
                      }}
                    >
                      {getInitials(review.name)}
                    </div>
                  )}
                  <div className="min-w-0 text-left">
                    <h3
                      id={`showcase-review-dialog-${review.id}`}
                      className="truncate text-base font-bold text-[#0D0D12]"
                    >
                      {review.name}
                    </h3>
                    <p className="mt-1 break-words text-xs font-bold uppercase tracking-wide text-primary [overflow-wrap:anywhere]">
                      {review.institution}
                    </p>
                    <div className="mt-1.5 flex gap-0.5">
                      {[...Array(rating)].map((_, i) => (
                        <FaStar key={i} className="text-accent" size={12} />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Close review"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-border text-text-muted transition hover:bg-brand-bg hover:text-[#0D0D12]"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="max-h-[min(50vh,320px)] overflow-x-hidden overflow-y-auto rounded-card border border-brand-border bg-brand-bg/40 px-5 py-4 custom-scrollbar">
                <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-[#0D0D12] [overflow-wrap:anywhere]">
                  &ldquo;{quote}&rdquo;
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
          </div>,
          document.body,
        )}
    </>
  );
}

function CTACard({ compact = false }) {
  return (
    <div
      className={`group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-card bg-primary text-center text-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-glass-lg ${
        compact ? "min-h-[220px] p-5" : "min-h-[220px] p-6"
      }`}
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:scale-105">
          <FaStar className="text-white" size={18} />
        </div>
        <h3 className="text-base font-bold">You Could Be Next!</h3>
        <p className="mt-2 max-w-[200px] text-xs leading-relaxed text-white/85">
          Start your success story with personalized college recommendations.
        </p>
      </div>
    </div>
  );
}

function SectionIntro() {
  return (
    <Reveal from="up" className="px-6 py-16 text-center">
      <h2 className="text-2xl font-bold sm:text-4xl">
        Trusted by <span className="text-accent">50,000+</span> Successful
        Students
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
        Join thousands of students who have found their dream colleges and
        accelerated their careers.
      </p>
    </Reveal>
  );
}

function ReviewStripHeader({ count, onPrev, onNext, showNav }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="text-left">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Student Reviews
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {count} showcase review{count === 1 ? "" : "s"}
        </p>
      </div>
      {showNav && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous reviews"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-text-muted shadow-card transition-all duration-200 hover:border-primary hover:text-primary"
          >
            <FaChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next reviews"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-text-muted shadow-card transition-all duration-200 hover:border-primary hover:text-primary"
          >
            <FaChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewCarousel({ reviews, showCta = true }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const slideStep = useSlideStep();
  const isCarousel = reviews.length > 3;

  const infiniteReviews = useMemo(() => {
    if (!isCarousel) return reviews;
    return [...reviews, ...reviews, ...reviews];
  }, [reviews, isCarousel]);

  useEffect(() => {
    if (!isCarousel) {
      setActiveIndex(0);
      return;
    }
    setActiveIndex(reviews.length);
  }, [reviews.length, isCarousel]);

  useEffect(() => {
    if (!isCarousel || isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, [isCarousel, isHovered]);

  useEffect(() => {
    if (!isCarousel) return;
    if (activeIndex >= reviews.length * 2) {
      setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(reviews.length);
        setTimeout(() => setIsTransitioning(true), 50);
      }, 500);
    } else if (activeIndex < reviews.length) {
      setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(reviews.length + activeIndex);
        setTimeout(() => setIsTransitioning(true), 50);
      }, 500);
    }
  }, [activeIndex, reviews.length, isCarousel]);

  if (!isCarousel) {
    return (
      <div className="flex gap-0 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {reviews.map((review) => (
          <div key={review.id} className={CARD_SLIDE_CLASS}>
            <ReviewCard review={review} />
          </div>
        ))}
        {showCta && (
          <div className={CARD_SLIDE_CLASS}>
            <CTACard compact />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <ReviewStripHeader
        count={reviews.length}
        showNav
        onPrev={() => setActiveIndex((prev) => prev - 1)}
        onNext={() => setActiveIndex((prev) => prev + 1)}
      />
      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`flex ${isTransitioning ? "transition-transform duration-500 ease-out" : ""}`}
          style={{
            transform: `translateX(-${activeIndex * slideStep}%)`,
          }}
        >
          {infiniteReviews.map((review, idx) => (
            <div key={`${review.id}-${idx}`} className={CARD_SLIDE_CLASS}>
              <ReviewCard review={review} />
            </div>
          ))}
          {showCta && (
            <div className={CARD_SLIDE_CLASS}>
              <CTACard compact />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "showcaseReviews"),
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) =>
          items.push({ id: docSnap.id, ...docSnap.data() }),
        );
        setReviews(items.filter((review) => review.showOnHome === true));
        setLoading(false);
      },
      (error) => {
        console.error("[Testimonials] Error:", error.code, error.message);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section className="glass-section py-6">
        <SectionIntro />
        <div className="mx-auto mt-4 flex max-w-7xl gap-4 overflow-hidden px-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="min-h-[220px] min-w-[220px] animate-pulse rounded-card border border-brand-border bg-white p-5"
            >
              <div className="mx-auto h-14 w-14 rounded-full bg-gray-200" />
              <div className="mx-auto mt-4 h-3 w-20 rounded bg-gray-200" />
              <div className="mx-auto mt-2 h-2 w-24 rounded bg-gray-200" />
              <div className="mx-auto mt-4 h-2 w-full rounded bg-gray-200" />
              <div className="mx-auto mt-2 h-2 w-4/5 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="glass-section py-6">
      <SectionIntro />

      <div className="mx-auto max-w-7xl px-6 pb-16">
        <Reveal from="left" delay={80}>
        {reviews.length === 0 ? (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="w-full max-w-sm">
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-card border border-brand-border bg-white p-8 text-center shadow-card">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg">
                  <FaStar className="text-xl text-primary" />
                </div>
                <p className="text-sm font-medium text-text-muted">
                  No testimonials available at this time.
                </p>
              </div>
            </div>
            <div className="w-full max-w-[240px]">
              <CTACard compact />
            </div>
          </div>
        ) : reviews.length > 3 ? (
          <div className="mt-8">
            <ReviewCarousel reviews={reviews} />
          </div>
        ) : (
          <div className="mt-8">
            <ReviewStripHeader count={reviews.length} showNav={false} />
            <ReviewCarousel reviews={reviews} />
          </div>
        )}
        </Reveal>
      </div>
    </section>
  );
}
