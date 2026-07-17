export type SplitMode = "items" | "even";

export type Diner = {
  id: string;
  name: string;
  color: string; // hex avatar background
  emoji: string;
  isMe?: boolean; // the device owner — excluded from "yang ngutang ke kamu"
};

export type PayApp = "QRIS" | "GoPay" | "OVO" | "Dana" | "ShopeePay" | "Transfer";

export type BillItem = {
  id: string;
  name: string;
  price: number; // unit price in IDR
  qty: number;
  dinerIds: string[]; // who shares this item; empty = everyone
};

export type DinerShare = {
  dinerId: string;
  name: string;
  emoji: string;
  color: string;
  isMe?: boolean;
  itemsTotal: number;
  taxShare: number;
  serviceShare: number;
  discountShare: number;
  total: number;
  items: { name: string; amount: number }[];
};

export type Bill = {
  id: string;
  title: string;
  emoji: string;
  createdAt: number;
  mode: SplitMode;
  diners: Diner[];
  items: BillItem[];
  taxPercent: number;
  servicePercent: number;
  discount: number; // flat IDR
  photoUri?: string | null;
  paidDinerIds?: string[]; // who has settled up
  // computed snapshot
  shares: DinerShare[];
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  total: number;
};

export type User = {
  deviceId: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: number;
  payApp?: PayApp; // tujuan pembayaran buat nagih
  payNumber?: string; // nomor e-wallet / rekening
};
