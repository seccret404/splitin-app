import * as Linking from "expo-linking";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import type { Dict } from "../i18n/translations";
import type { Bill, DinerShare, User } from "../types";
import { rupiah } from "./format";

type ShareDict = Dict["share"];

/** Creative, copy-paste-ready WhatsApp recap of a split. */
export function buildWhatsAppText(bill: Bill, t: ShareDict): string {
  const lines: string[] = [];
  lines.push(`${bill.emoji} *${bill.title.toUpperCase()}*`);
  lines.push(`_${t.waSubtitle}_`);
  lines.push("");
  lines.push(t.waTotal(rupiah(bill.total)));
  lines.push(t.waPeople(bill.diners.length));
  lines.push("");
  lines.push(`─── *${t.waSharePart}* ───`);

  const sorted = [...bill.shares].sort((a, b) => b.total - a.total);
  sorted.forEach((s, i) => {
    const medal = i === 0 ? " 👑" : "";
    lines.push(`${s.emoji} ${s.name} → *${rupiah(s.total)}*${medal}`);
  });

  lines.push("");
  if (bill.serviceAmount > 0 || bill.taxAmount > 0 || bill.discount > 0) {
    lines.push(`─── *${t.waDetails}* ───`);
    lines.push(t.waSubtotal(rupiah(bill.subtotal)));
    if (bill.serviceAmount > 0) lines.push(t.waService(rupiah(bill.serviceAmount)));
    if (bill.taxAmount > 0) lines.push(t.waTax(rupiah(bill.taxAmount)));
    if (bill.discount > 0) lines.push(t.waDiscount(rupiah(bill.discount)));
    lines.push("");
  }
  lines.push(t.waFooter);
  return lines.join("\n");
}

/** Friendly, ready-to-send WA bill reminder for one person. */
export function buildTagihText(
  opts: { name: string; amount: number; title: string; emoji: string },
  user: User | null,
  t: ShareDict
): string {
  const lines: string[] = [];
  lines.push(t.tagihHello(opts.name));
  lines.push(t.tagihShare(opts.title, opts.emoji));
  lines.push(t.tagihAmount(rupiah(opts.amount)));
  lines.push("");
  if (user?.payNumber) {
    lines.push(t.tagihTransferTo);
    lines.push(t.tagihAccount(user.payApp ?? "Transfer", user.payNumber));
    lines.push(t.tagihName(user.name));
  } else {
    lines.push(t.tagihTransferSimple(user?.name ?? "—"));
  }
  lines.push("");
  lines.push(t.tagihThanks);
  lines.push(t.tagihFooter);
  return lines.join("\n");
}

/** Bulk reminder for everyone who hasn't settled a bill yet. */
export function buildBulkTagihText(
  bill: Bill,
  unpaid: DinerShare[],
  user: User | null,
  t: ShareDict
): string {
  const lines: string[] = [];
  lines.push(`${bill.emoji} *${bill.title}*`);
  lines.push("");
  unpaid.forEach((s) => lines.push(`• ${s.name}: *${rupiah(s.total)}*`));
  lines.push("");
  if (user?.payNumber) {
    lines.push(t.tagihAccount(user.payApp ?? "Transfer", user.payNumber));
    lines.push(t.tagihName(user.name));
  } else {
    lines.push(t.tagihTransferSimple(user?.name ?? "—"));
  }
  lines.push(t.tagihFooter);
  return lines.join("\n");
}

/** Open WhatsApp with the recap text prefilled. Falls back to wa.me on web. */
export async function shareToWhatsApp(text: string): Promise<void> {
  const encoded = encodeURIComponent(text);
  const appUrl = `whatsapp://send?text=${encoded}`;
  const webUrl = `https://wa.me/?text=${encoded}`;

  if (Platform.OS === "web") {
    await Linking.openURL(webUrl);
    return;
  }
  const canOpen = await Linking.canOpenURL(appUrl);
  await Linking.openURL(canOpen ? appUrl : webUrl);
}

/** Share a captured image (struk) through the native share sheet. */
export async function shareImage(uri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    await Linking.openURL(uri);
    return;
  }
  await Sharing.shareAsync(uri, {
    mimeType: "image/png",
    dialogTitle: "SplitIn",
    UTI: "public.png",
  });
}
