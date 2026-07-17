import { computeSplit } from "../src/lib/split";
import type { BillItem, Diner } from "../src/types";

let pass = 0;
let fail = 0;

function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name} ${detail}`);
  }
}

const A: Diner = { id: "a", name: "Andi", emoji: "😎", color: "#fff" };
const B: Diner = { id: "b", name: "Budi", emoji: "🦊", color: "#fff" };
const C: Diner = { id: "c", name: "Cici", emoji: "🐼", color: "#fff" };

const item = (id: string, price: number, qty: number, dinerIds: string[]): BillItem => ({
  id,
  name: id,
  price,
  qty,
  dinerIds,
});

const sumTotals = (r: ReturnType<typeof computeSplit>) =>
  r.shares.reduce((s, x) => s + x.total, 0);

/* 1) Per-item: Andi 30k, Budi 20k, shared 10k (both) */
console.log("\n[1] Per pesanan tanpa pajak");
{
  const r = computeSplit({
    mode: "items",
    diners: [A, B],
    items: [item("Nasi", 30000, 1, ["a"]), item("Ayam", 20000, 1, ["b"]), item("Teh", 10000, 1, ["a", "b"])],
    taxPercent: 0,
    servicePercent: 0,
    discount: 0,
  });
  const andi = r.shares.find((s) => s.dinerId === "a")!.total;
  const budi = r.shares.find((s) => s.dinerId === "b")!.total;
  check("Andi = 35.000", andi === 35000, `got ${andi}`);
  check("Budi = 25.000", budi === 25000, `got ${budi}`);
  check("Total = 60.000", r.total === 60000, `got ${r.total}`);
  check("Σ jatah = total", sumTotals(r) === r.total, `got ${sumTotals(r)}`);
}

/* 2) Item kosong dinerIds = dibagi semua */
console.log("\n[2] Item tanpa assign = semua kebagian");
{
  const r = computeSplit({
    mode: "items",
    diners: [A, B, C],
    items: [item("Pizza", 99000, 1, [])],
    taxPercent: 0,
    servicePercent: 0,
    discount: 0,
  });
  check("3 orang dibagi rata 99k (33k each)", r.shares.every((s) => s.total === 33000), JSON.stringify(r.shares.map((s) => s.total)));
  check("Σ jatah = 99.000", sumTotals(r) === 99000, `got ${sumTotals(r)}`);
}

/* 3) Pajak + service proporsional */
console.log("\n[3] Pajak 10% + service 5%");
{
  const r = computeSplit({
    mode: "items",
    diners: [A, B],
    items: [item("X", 80000, 1, ["a"]), item("Y", 20000, 1, ["b"])],
    taxPercent: 10,
    servicePercent: 5,
    discount: 0,
  });
  // subtotal 100k, tax 10k, service 5k, total 115k. A pays 80% -> 92k, B 20% -> 23k
  const andi = r.shares.find((s) => s.dinerId === "a")!.total;
  const budi = r.shares.find((s) => s.dinerId === "b")!.total;
  check("Total = 115.000", r.total === 115000, `got ${r.total}`);
  check("Andi (80%) = 92.000", andi === 92000, `got ${andi}`);
  check("Budi (20%) = 23.000", budi === 23000, `got ${budi}`);
  check("Σ jatah = total", sumTotals(r) === r.total, `got ${sumTotals(r)}`);
}

/* 4) Pembulatan: harga ganjil dibagi 3 */
console.log("\n[4] Pembulatan — 100.000 dibagi 3");
{
  const r = computeSplit({
    mode: "items",
    diners: [A, B, C],
    items: [item("Z", 100000, 1, ["a", "b", "c"])],
    taxPercent: 0,
    servicePercent: 0,
    discount: 0,
  });
  check("Σ jatah persis = 100.000 (no kebocoran)", sumTotals(r) === 100000, `got ${sumTotals(r)}`);
  check("Selisih antar orang max 1 rupiah", Math.max(...r.shares.map((s) => s.total)) - Math.min(...r.shares.map((s) => s.total)) <= 1);
}

/* 5) Diskon flat */
console.log("\n[5] Diskon 25.000");
{
  const r = computeSplit({
    mode: "items",
    diners: [A, B],
    items: [item("X", 60000, 1, ["a"]), item("Y", 40000, 1, ["b"])],
    taxPercent: 0,
    servicePercent: 0,
    discount: 25000,
  });
  check("Total = 75.000", r.total === 75000, `got ${r.total}`);
  check("Σ jatah = total", sumTotals(r) === r.total, `got ${sumTotals(r)}`);
}

/* 6) Mode rata */
console.log("\n[6] Mode rata (patungan)");
{
  const r = computeSplit({
    mode: "even",
    diners: [A, B, C],
    items: [item("X", 100000, 1, ["a"])],
    taxPercent: 10,
    servicePercent: 0,
    discount: 0,
  });
  // total 110k / 3 = 36667 + sisa
  check("Σ jatah persis = total (110.000)", sumTotals(r) === 110000, `got ${sumTotals(r)} vs ${r.total}`);
  check("Selisih antar orang max 1 rupiah", Math.max(...r.shares.map((s) => s.total)) - Math.min(...r.shares.map((s) => s.total)) <= 1);
}

/* 7) Qty > 1 */
console.log("\n[7] Quantity (Es Teh x3 @5.000)");
{
  const r = computeSplit({
    mode: "items",
    diners: [A],
    items: [item("EsTeh", 5000, 3, ["a"])],
    taxPercent: 0,
    servicePercent: 0,
    discount: 0,
  });
  check("Total = 15.000 (5k×3)", r.total === 15000, `got ${r.total}`);
}

/* 8) Edge: tanpa diner */
console.log("\n[8] Edge — tanpa orang");
{
  const r = computeSplit({
    mode: "items",
    diners: [],
    items: [item("X", 50000, 1, [])],
    taxPercent: 0,
    servicePercent: 0,
    discount: 0,
  });
  check("Tidak crash, shares kosong", r.shares.length === 0);
}

console.log(`\n──────────────\nHASIL: ${pass} lulus, ${fail} gagal\n`);
process.exit(fail === 0 ? 0 : 1);
