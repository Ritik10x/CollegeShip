import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motionPrefs";

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export function useCountUp(
  target,
  { duration = 2200, decimals = 0, enabled = true } = {},
) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return undefined;
    }

    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    const runAnimation = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const next = target * easeOutCubic(progress);
        setValue(next);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setValue(target);
        }
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      runAnimation();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration, enabled, decimals]);

  const formatted =
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));

  return { ref, formatted };
}
