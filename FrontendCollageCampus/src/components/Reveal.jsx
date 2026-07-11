import { useEffect, useRef, useState } from "react";
import { useIntroMotion } from "../hooks/useIntroMotion";

export default function Reveal({
  children,
  className = "",
  delay = 0,
  from = "up",
  as: Tag = "div",
}) {
  const introMotion = useIntroMotion();
  const ref = useRef(null);
  const [visible, setVisible] = useState(!introMotion);
  const directionClass =
    from === "left"
      ? "reveal-from-left"
      : from === "right"
        ? "reveal-from-right"
        : "reveal-from-up";

  useEffect(() => {
    if (!introMotion) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [introMotion]);

  return (
    <Tag
      ref={ref}
      className={`reveal-motion ${directionClass} ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
