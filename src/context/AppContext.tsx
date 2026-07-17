import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { detectLang } from "../i18n/detect";
import type { Lang } from "../i18n/translations";
import type { Bill, User } from "../types";
import {
  addBill as addBillStore,
  clearHistory as clearHistoryStore,
  clearUser as clearUserStore,
  deleteBill as deleteBillStore,
  getDeviceId,
  getHistory,
  getStoredLang,
  getUser,
  saveLang as saveLangStore,
  saveUser as saveUserStore,
} from "../lib/storage";

type AppState = {
  ready: boolean;
  user: User | null;
  history: Bill[];
  deviceId: string;
  lang: Lang;
  setLang: (lang: Lang) => void;
  signIn: (name: string, emoji: string, color: string) => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  saveBill: (bill: Bill) => Promise<void>;
  removeBill: (id: string) => Promise<void>;
  togglePaid: (billId: string, dinerId: string) => Promise<void>;
  wipeHistory: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<Bill[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [lang, setLangState] = useState<Lang>("id");

  useEffect(() => {
    (async () => {
      const [id, u, h, storedLang] = await Promise.all([
        getDeviceId(),
        getUser(),
        getHistory(),
        getStoredLang(),
      ]);
      setDeviceId(id);
      setUser(u);
      setHistory(h);
      setLangState(storedLang ?? detectLang());
      setReady(true);
    })();
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    saveLangStore(next).catch(() => {});
  }, []);

  const signIn = useCallback(
    async (name: string, emoji: string, color: string) => {
      const id = deviceId || (await getDeviceId());
      const u: User = {
        deviceId: id,
        name: name.trim(),
        emoji,
        color,
        createdAt: Date.now(),
      };
      await saveUserStore(u);
      setUser(u);
    },
    [deviceId]
  );

  const updateUser = useCallback(
    async (patch: Partial<User>) => {
      if (!user) return;
      const next = { ...user, ...patch };
      await saveUserStore(next);
      setUser(next);
    },
    [user]
  );

  const signOut = useCallback(async () => {
    await clearUserStore();
    setUser(null);
  }, []);

  const saveBill = useCallback(async (bill: Bill) => {
    const next = await addBillStore(bill);
    setHistory(next);
  }, []);

  const removeBill = useCallback(async (id: string) => {
    const next = await deleteBillStore(id);
    setHistory(next);
  }, []);

  const togglePaid = useCallback(
    async (billId: string, dinerId: string) => {
      const bill = history.find((b) => b.id === billId);
      if (!bill) return;
      const current = bill.paidDinerIds ?? [];
      const paidDinerIds = current.includes(dinerId)
        ? current.filter((x) => x !== dinerId)
        : [...current, dinerId];
      const next = await addBillStore({ ...bill, paidDinerIds });
      setHistory(next);
    },
    [history]
  );

  const wipeHistory = useCallback(async () => {
    await clearHistoryStore();
    setHistory([]);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      ready,
      user,
      history,
      deviceId,
      lang,
      setLang,
      signIn,
      updateUser,
      signOut,
      saveBill,
      removeBill,
      togglePaid,
      wipeHistory,
    }),
    [ready, user, history, deviceId, lang, setLang, signIn, updateUser, signOut, saveBill, removeBill, togglePaid, wipeHistory]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
