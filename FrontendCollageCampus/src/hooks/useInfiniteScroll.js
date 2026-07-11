import { useEffect, useRef, useState } from "react";

export function useInfiniteScroll(itemCount, { pageSize = 12, resetKey = "" } = {}) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, resetKey]);

  useEffect(() => {
    if (visibleCount >= itemCount) return undefined;

    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + pageSize, itemCount));
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [itemCount, visibleCount, pageSize]);

  return {
    visibleCount: Math.min(visibleCount, itemCount),
    sentinelRef,
    hasMore: visibleCount < itemCount,
  };
}
