import { aggregateDebts, billPaidSummary, totalOwedToMe } from "../src/lib/debt";
import { buildBill } from "../src/lib/split";
import { computeWrapped } from "../src/lib/stats";
import type { Bill, Diner, User } from "../src/types";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${detail}`); }
}

const me: Diner = { id: "me", name: "Aku", emoji: "😎", color: "#7C5CFF", isMe: true };
const budi: Diner = { id: "budi", name: "Budi", emoji: "🦊", color: "#FF5CAA" };
const cici: Diner = { id: "cici", name: "Cici", emoji: "🐼", color: "#43E0FF" };

const mkBill = (id: string, when: number, diners: Diner[], items: { name: string; price: number; ids: string[] }[]): Bill =>
  buildBill(
    { id, title: `Sesi ${id}`, emoji: "🍜", createdAt: when, photoUri: null },
    {
      mode: "items",
      diners,
      items: items.map((it, i) => ({ id: `i${i}`, name: it.name, price: it.price, qty: 1, dinerIds: it.ids })),
      taxPercent: 0,
      servicePercent: 0,
      discount: 0,
    }
  );

const JAN = new Date(2026, 0, 10).getTime();
const FEB = new Date(2026, 1, 12).getTime();

/* Bill 1: Aku 0, Budi 20.000 */
const b1 = mkBill("1", JAN, [me, budi], [{ name: "Mie", price: 20000, ids: ["budi"] }]);
/* Bill 2: Aku 0, Budi 30.000 (lunas), Cici 15.000 */
const b2 = mkBill("2", FEB, [me, budi, cici], [
  { name: "Nasi", price: 30000, ids: ["budi"] },
  { name: "Es Teh", price: 15000, ids: ["cici"] },
]);
b2.paidDinerIds = ["budi"]; // Budi sudah bayar di sesi 2

const history = [b2, b1]; // newest first

console.log("\n[Debt] Agregasi utang");
{
  const debts = aggregateDebts(history);
  const budiE = debts.find((d) => d.key === "budi")!;
  const ciciE = debts.find((d) => d.key === "cici")!;
  check("Aku (isMe) tidak dihitung sebagai utang", !debts.some((d) => d.key === "aku"));
  check("Budi unpaid = 20.000 (sesi1 blm bayar)", budiE.unpaid === 20000, `got ${budiE.unpaid}`);
  check("Budi paid = 30.000 (sesi2 lunas)", budiE.paid === 30000, `got ${budiE.paid}`);
  check("Budi sessions = 2", budiE.sessions === 2, `got ${budiE.sessions}`);
  check("Cici unpaid = 15.000", ciciE.unpaid === 15000, `got ${ciciE.unpaid}`);
  check("Total owed = 35.000", totalOwedToMe(history) === 35000, `got ${totalOwedToMe(history)}`);
}

console.log("\n[Debt] Ringkasan per bill");
{
  const s2 = billPaidSummary(b2);
  check("Sesi2: 1 dari 2 lunas", s2.settled === 1 && s2.total === 2, JSON.stringify(s2));
  check("Sesi2: sisa belum kebayar = 15.000 (Cici)", s2.owed === 15000, `got ${s2.owed}`);
}

console.log("\n[Wrapped] Recap");
{
  const user: User = { deviceId: "d", name: "Aku", emoji: "😎", color: "#7C5CFF", createdAt: JAN };
  const w = computeWrapped(history, user);
  check("hasData true", w.hasData);
  check("sessions = 2", w.sessions === 2, `got ${w.sessions}`);
  check("totalSpent = 65.000", w.totalSpent === 65000, `got ${w.totalSpent}`);
  check("uniqueFriends = 2 (Budi, Cici)", w.uniqueFriends === 2, `got ${w.uniqueFriends}`);
  check("topFriend = Budi (2×)", w.topFriend?.name === "Budi" && w.topFriend?.times === 2, JSON.stringify(w.topFriend));
  check("biggest = sesi2 (45.000)", w.biggest?.amount === 45000, `got ${w.biggest?.amount}`);
  check("avgPerSession = 32.500", w.avgPerSession === 32500, `got ${w.avgPerSession}`);
  check("persona terisi (key valid)", typeof w.persona === "string" && w.persona.length > 0, w.persona);
}

console.log("\n[Wrapped] Empty state");
{
  const w = computeWrapped([], null);
  check("hasData false saat kosong", w.hasData === false);
}

console.log(`\n──────────────\nHASIL: ${pass} lulus, ${fail} gagal\n`);
process.exit(fail === 0 ? 0 : 1);
