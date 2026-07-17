import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Lang } from "../i18n/translations";
import type { Bill, User } from "../types";
import { uid } from "./id";

const KEYS = {
  user: "splitin.user.v1",
  history: "splitin.history.v1",
  deviceId: "splitin.deviceId.v1",
  lang: "splitin.lang.v1",
};

/* --------------------------------- lang ----------------------------------- */

export async function getStoredLang(): Promise<Lang | null> {
  const v = await AsyncStorage.getItem(KEYS.lang);
  return v === "id" || v === "en" ? v : null;
}

export async function saveLang(lang: Lang): Promise<void> {
  await AsyncStorage.setItem(KEYS.lang, lang);
}

/* ----------------------------- device identity ---------------------------- */

export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(KEYS.deviceId);
  if (!id) {
    id = uid("dev_");
    await AsyncStorage.setItem(KEYS.deviceId, id);
  }
  return id;
}

/* --------------------------------- user ----------------------------------- */

export async function getUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.user);
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.user);
}

/* -------------------------------- history --------------------------------- */

export async function getHistory(): Promise<Bill[]> {
  const raw = await AsyncStorage.getItem(KEYS.history);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as Bill[];
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function addBill(bill: Bill): Promise<Bill[]> {
  const list = await getHistory();
  const next = [bill, ...list.filter((b) => b.id !== bill.id)];
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(next));
  return next;
}

export async function deleteBill(id: string): Promise<Bill[]> {
  const list = await getHistory();
  const next = list.filter((b) => b.id !== id);
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(next));
  return next;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.history);
}
