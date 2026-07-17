import { getDict, type Lang } from "../i18n/translations";

/** Format a number as Indonesian Rupiah, e.g. 125000 -> "Rp125.000". */
export function rupiah(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}Rp${digits}`;
}

/** Compact rupiah for tight spots, e.g. 125000 -> "125rb", 1500000 -> "1,5jt". */
export function rupiahShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const v = (n / 1_000_000).toFixed(1).replace(".0", "").replace(".", ",");
    return `${v}jt`;
  }
  if (abs >= 1_000) {
    return `${Math.round(n / 1000)}rb`;
  }
  return `${Math.round(n)}`;
}

/** Parse a raw money string ("125.000", "125000", "125rb") into a number. */
export function parseRupiah(raw: string): number {
  const cleaned = raw.toLowerCase().replace(/\s/g, "");
  const numeric = cleaned.replace(/rb$/, "000").replace(/[^0-9]/g, "");
  return numeric ? parseInt(numeric, 10) : 0;
}

export function formatDate(epoch: number, lang: Lang = "id"): string {
  const d = new Date(epoch);
  const months = getDict(lang).fmt.monthsShort;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function relativeTime(epoch: number, lang: Lang = "id"): string {
  const t = getDict(lang).fmt;
  const diff = Date.now() - epoch;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t.justNow;
  if (mins < 60) return t.minsAgo(mins);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t.hoursAgo(hours);
  const days = Math.floor(hours / 24);
  if (days < 7) return t.daysAgo(days);
  return formatDate(epoch, lang);
}
