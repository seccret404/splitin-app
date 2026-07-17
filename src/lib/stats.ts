import type { PersonaKey } from "../i18n/translations";
import type { Bill, User } from "../types";

export const PERSONA_EMOJI: Record<PersonaKey, string> = {
  socialite: "🦋",
  sultan: "👑",
  budget: "🐜",
  treasurer: "🤝",
  newcomer: "✨",
};

export type Wrapped = {
  hasData: boolean;
  sessions: number;
  totalSpent: number;
  myTotal: number;
  avgPerSession: number;
  biggest: { title: string; emoji: string; amount: number } | null;
  topFriend: { name: string; emoji: string; color: string; times: number } | null;
  topMenu: { name: string; times: number } | null;
  busiestMonth: { monthIndex: number; count: number } | null;
  uniqueFriends: number;
  persona: PersonaKey;
};

function topEntry<T>(counts: Map<string, { count: number; meta: T }>) {
  let best: { key: string; count: number; meta: T } | null = null;
  for (const [key, { count, meta }] of counts) {
    if (!best || count > best.count) best = { key, count, meta };
  }
  return best;
}

function derivePersona(w: {
  avgPerSession: number;
  sessions: number;
  uniqueFriends: number;
}): PersonaKey {
  if (w.sessions >= 10 && w.uniqueFriends >= 8) return "socialite";
  if (w.avgPerSession >= 150000) return "sultan";
  if (w.avgPerSession > 0 && w.avgPerSession <= 50000) return "budget";
  if (w.sessions >= 5) return "treasurer";
  return "newcomer";
}

/** Build a Spotify-Wrapped-style recap from the saved bills. */
export function computeWrapped(history: Bill[], _user: User | null): Wrapped {
  const base: Wrapped = {
    hasData: false,
    sessions: 0,
    totalSpent: 0,
    myTotal: 0,
    avgPerSession: 0,
    biggest: null,
    topFriend: null,
    topMenu: null,
    busiestMonth: null,
    uniqueFriends: 0,
    persona: "newcomer",
  };
  if (history.length === 0) return base;

  let totalSpent = 0;
  let myTotal = 0;
  let biggest: Wrapped["biggest"] = null;

  const friends = new Map<string, { count: number; meta: { name: string; emoji: string; color: string } }>();
  const menus = new Map<string, { count: number; meta: { name: string } }>();
  const months = new Map<string, { count: number; meta: { index: number } }>();

  for (const bill of history) {
    totalSpent += bill.total;
    if (!biggest || bill.total > biggest.amount) {
      biggest = { title: bill.title, emoji: bill.emoji, amount: bill.total };
    }

    for (const s of bill.shares) {
      if (s.isMe) {
        myTotal += s.total;
      } else {
        const key = s.name.trim().toLowerCase();
        const cur = friends.get(key);
        if (cur) cur.count += 1;
        else friends.set(key, { count: 1, meta: { name: s.name, emoji: s.emoji, color: s.color } });
      }
    }

    for (const it of bill.items) {
      const key = it.name.trim().toLowerCase();
      const cur = menus.get(key);
      if (cur) cur.count += 1;
      else menus.set(key, { count: 1, meta: { name: it.name } });
    }

    const d = new Date(bill.createdAt);
    const idx = d.getMonth();
    const mk = `${d.getFullYear()}-${idx}`;
    const cm = months.get(mk);
    if (cm) cm.count += 1;
    else months.set(mk, { count: 1, meta: { index: idx } });
  }

  const tf = topEntry(friends);
  const tm = topEntry(menus);
  const bm = topEntry(months);

  const sessions = history.length;
  const avgPerSession = Math.round(totalSpent / sessions);
  const uniqueFriends = friends.size;

  return {
    hasData: true,
    sessions,
    totalSpent,
    myTotal,
    avgPerSession,
    biggest,
    topFriend: tf ? { ...tf.meta, times: tf.count } : null,
    topMenu: tm ? { name: tm.meta.name, times: tm.count } : null,
    busiestMonth: bm ? { monthIndex: bm.meta.index, count: bm.count } : null,
    uniqueFriends,
    persona: derivePersona({ avgPerSession, sessions, uniqueFriends }),
  };
}
