import { useEffect } from "react";
import {
  hideAppSplash,
  shouldPlayIntroMotion,
} from "../lib/motionPrefs";

export default function AppBoot() {
  useEffect(() => {
    const showSplash = shouldPlayIntroMotion();
    const startedAt = performance.now();
    const minSplashMs = showSplash ? 900 : 0;
    const maxSplashMs = 2200;

    const finish = () => {
      hideAppSplash();
    };

    const scheduleFinish = () => {
      const wait = Math.max(0, minSplashMs - (performance.now() - startedAt));
      window.setTimeout(finish, wait);
    };

    if (document.readyState === "complete") {
      scheduleFinish();
    } else {
      window.addEventListener("load", scheduleFinish, { once: true });
    }

    const cap = window.setTimeout(finish, maxSplashMs);
    return () => window.clearTimeout(cap);
  }, []);

  return null;
}
