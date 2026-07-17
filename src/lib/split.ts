import type { Bill, BillItem, Diner, DinerShare, SplitMode } from "../types";

export type SplitInput = {
  mode: SplitMode;
  diners: Diner[];
  items: BillItem[];
  taxPercent: number;
  servicePercent: number;
  discount: number;
};

export type SplitResult = {
  shares: DinerShare[];
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  total: number;
};

const lineTotal = (item: BillItem) => Math.max(0, item.price) * Math.max(1, item.qty);

/**
 * Core engine. Each diner pays for exactly what they ordered (per-item split),
 * and tax / service / discount are spread proportionally to each person's
 * share of the subtotal. Rounding remainder is absorbed by the person with the
 * largest bill so the parts always sum back to the grand total.
 */
export function computeSplit(input: SplitInput): SplitResult {
  const { mode, diners, items, taxPercent, servicePercent, discount } = input;

  const subtotal = items.reduce((sum, it) => sum + lineTotal(it), 0);
  const taxAmount = Math.round((subtotal * Math.max(0, taxPercent)) / 100);
  const serviceAmount = Math.round((subtotal * Math.max(0, servicePercent)) / 100);
  const safeDiscount = Math.min(Math.max(0, discount), subtotal);
  const total = subtotal + taxAmount + serviceAmount - safeDiscount;

  // Seed each diner's accumulator.
  const acc = new Map<string, DinerShare>();
  for (const d of diners) {
    acc.set(d.id, {
      dinerId: d.id,
      name: d.name,
      emoji: d.emoji,
      color: d.color,
      isMe: d.isMe,
      itemsTotal: 0,
      taxShare: 0,
      serviceShare: 0,
      discountShare: 0,
      total: 0,
      items: [],
    });
  }

  if (diners.length === 0) {
    return { shares: [], subtotal, taxAmount, serviceAmount, total };
  }

  if (mode === "even") {
    // Everyone splits the grand total equally.
    const per = Math.floor(total / diners.length);
    let remainder = total - per * diners.length;
    for (const d of diners) {
      const share = acc.get(d.id)!;
      const extra = remainder > 0 ? 1 : 0;
      remainder -= extra;
      share.itemsTotal = per + extra;
      share.total = per + extra;
      share.items = [{ name: "Patungan rata", amount: per + extra }];
    }
    return { shares: [...acc.values()], subtotal, taxAmount, serviceAmount, total };
  }

  // ITEM mode — assign each item's cost to the diners sharing it.
  for (const item of items) {
    const sharedBy = item.dinerIds.length > 0 ? item.dinerIds : diners.map((d) => d.id);
    const present = sharedBy.filter((id) => acc.has(id));
    if (present.length === 0) continue;

    const lt = lineTotal(item);
    const per = Math.floor(lt / present.length);
    let remainder = lt - per * present.length;

    for (const id of present) {
      const share = acc.get(id)!;
      const extra = remainder > 0 ? 1 : 0;
      remainder -= extra;
      const portion = per + extra;
      share.itemsTotal += portion;
      const label = item.qty > 1 ? `${item.name} ×${item.qty}` : item.name;
      share.items.push({ name: label, amount: portion });
    }
  }

  // Spread tax / service / discount proportionally to itemsTotal.
  const distribute = (pool: number, key: "taxShare" | "serviceShare" | "discountShare") => {
    if (pool <= 0 || subtotal <= 0) return;
    let assigned = 0;
    const list = [...acc.values()];
    list.forEach((share, i) => {
      let part: number;
      if (i === list.length - 1) {
        part = pool - assigned; // last one absorbs rounding
      } else {
        part = Math.round((share.itemsTotal / subtotal) * pool);
        assigned += part;
      }
      share[key] = part;
    });
  };

  distribute(taxAmount, "taxShare");
  distribute(serviceAmount, "serviceShare");
  distribute(safeDiscount, "discountShare");

  for (const share of acc.values()) {
    share.total = share.itemsTotal + share.taxShare + share.serviceShare - share.discountShare;
  }

  // Fix any net rounding drift on the person with the biggest bill.
  const shares = [...acc.values()];
  const sumTotals = shares.reduce((s, x) => s + x.total, 0);
  const drift = total - sumTotals;
  if (drift !== 0 && shares.length > 0) {
    const top = shares.reduce((a, b) => (b.total > a.total ? b : a));
    top.total += drift;
  }

  return { shares, subtotal, taxAmount, serviceAmount, total };
}

export function buildBill(
  meta: { id: string; title: string; emoji: string; createdAt: number; photoUri?: string | null },
  input: SplitInput
): Bill {
  const result = computeSplit(input);
  return {
    ...meta,
    mode: input.mode,
    diners: input.diners,
    items: input.items,
    taxPercent: input.taxPercent,
    servicePercent: input.servicePercent,
    discount: input.discount,
    paidDinerIds: [],
    ...result,
  };
}
