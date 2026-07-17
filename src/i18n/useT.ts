import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { formatDate, relativeTime } from "../lib/format";
import { getDict, type Dict } from "./translations";

/** Current-language string dictionary. */
export function useT(): Dict {
  const { lang } = useApp();
  return useMemo(() => getDict(lang), [lang]);
}

/** Date/time formatters bound to the current language. */
export function useFmt() {
  const { lang } = useApp();
  return useMemo(
    () => ({
      formatDate: (epoch: number) => formatDate(epoch, lang),
      relativeTime: (epoch: number) => relativeTime(epoch, lang),
    }),
    [lang]
  );
}
