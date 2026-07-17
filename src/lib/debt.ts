import type { Bill } from "../types";

export type DebtEntry = {
  key: string; // normalized name
  name: string;
  emoji: string;
  color: string;
  unpaid: number; // total belum dibayar ke kamu
  paid: number; // sudah lunas
  sessions: number; // berapa kali nongkrong bareng
  bills: {
    billId: string;
    dinerId: string;
    title: string;
    emoji: string;
    createdAt: number;
    amount: number;
    isPaid: boolean;
  }[];
};

const norm = (s: string) => s.trim().toLowerCase();

const isPaidIn = (bill: Bill, dinerId: string) => (bill.paidDinerIds ?? []).includes(dinerId);

/**
 * Aggregate, per friend (by name), how much they still owe the device owner
 * across every saved bill. The owner's own share (isMe) is never a debt.
 */
export function aggregateDebts(history: Bill[]): DebtEntry[] {
  const map = new Map<string, DebtEntry>();

  for (const bill of history) {
    for (const share of bill.shares) {
      if (share.isMe) continue; // jatah sendiri bukan utang
      if (share.total <= 0) continue;
      const key = norm(share.name);
      let entry = map.get(key);
      if (!entry) {
        entry = {
          key,
          name: share.name,
          emoji: share.emoji,
          color: share.color,
          unpaid: 0,
          paid: 0,
          sessions: 0,
          bills: [],
        };
        map.set(key, entry);
      }
      const paid = isPaidIn(bill, share.dinerId);
      entry.sessions += 1;
      if (paid) entry.paid += share.total;
      else entry.unpaid += share.total;
      entry.bills.push({
        billId: bill.id,
        dinerId: share.dinerId,
        title: bill.title,
        emoji: bill.emoji,
        createdAt: bill.createdAt,
        amount: share.total,
        isPaid: paid,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.unpaid - a.unpaid);
}

export function totalOwedToMe(history: Bill[]): number {
  return aggregateDebts(history).reduce((s, e) => s + e.unpaid, 0);
}

/** Per-bill settle progress, e.g. "2 dari 4 lunas". */
export function billPaidSummary(bill: Bill): { paid: number; total: number; settled: number; owed: number } {
  const others = bill.shares.filter((s) => !s.isMe && s.total > 0);
  const paidIds = bill.paidDinerIds ?? [];
  const paid = others.filter((s) => paidIds.includes(s.dinerId)).length;
  const owed = others
    .filter((s) => !paidIds.includes(s.dinerId))
    .reduce((sum, s) => sum + s.total, 0);
  return { paid, total: others.length, settled: paid, owed };
}
