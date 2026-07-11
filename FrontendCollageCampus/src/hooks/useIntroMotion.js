import { useMemo } from "react";
import { shouldPlayIntroMotion } from "../lib/motionPrefs";

export function useIntroMotion() {
  return useMemo(() => shouldPlayIntroMotion(), []);
}
