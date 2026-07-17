import { getLocales } from "expo-localization";
import type { Lang } from "./translations";

/** Best-effort device language → app language ("id" or fallback "en"). */
export function detectLang(): Lang {
  try {
    const code = getLocales()?.[0]?.languageCode?.toLowerCase();
    return code === "id" ? "id" : "en";
  } catch {
    return "en";
  }
}
