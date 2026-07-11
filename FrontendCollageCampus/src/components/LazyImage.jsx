import { useEffect, useRef, useState } from "react";
import { COLLEGE_IMAGE_FALLBACK } from "../lib/assets";

export default function LazyImage({
  src,
  alt,
  className = "",
  fallback = COLLEGE_IMAGE_FALLBACK,
  wrapperClassName = "relative w-full h-full",
}) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={wrapperClassName}>
      {!loaded && (
        <div
          className="absolute inset-0 bg-brand-bg animate-pulse"
          aria-hidden="true"
        />
      )}
      {inView && (
        <img
          src={src || fallback}
          alt={alt}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className={className}
          onLoad={() => setLoaded(true)}
          onError={(event) => {
            event.currentTarget.src = fallback;
            setLoaded(true);
          }}
        />
      )}
    </div>
  );
}
