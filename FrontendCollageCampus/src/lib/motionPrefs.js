export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Play intro / scroll motion on every page load (respects reduced-motion only). */
export function shouldPlayIntroMotion() {
  return !prefersReducedMotion();
}

export function hideAppSplash() {
  const splash = document.getElementById("app-splash");
  if (!splash || splash.dataset.hidden === "true") return;
  splash.dataset.hidden = "true";
  splash.classList.add("app-splash--hide");
  window.setTimeout(() => splash.remove(), 450);
}
