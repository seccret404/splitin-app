import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Button, Card, Chip, Field } from "../src/components/ui";
import { useApp } from "../src/context/AppContext";
import { useT } from "../src/i18n/useT";
import { AVATAR_COLORS, AVATAR_EMOJIS, VIBE_EMOJIS } from "../src/data/avatars";
import { buildBill, computeSplit } from "../src/lib/split";
import { rupiah, parseRupiah } from "../src/lib/format";
import { uid } from "../src/lib/id";
import type { BillItem, Diner } from "../src/types";

const TAX_PRESETS = [0, 10, 11];
const SERVICE_PRESETS = [0, 5, 7, 10];

export default function CreateSplit() {
  const insets = useSafeAreaInsets();
  const { user, saveBill } = useApp();
  const t = useT();

  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState(VIBE_EMOJIS[0]);
  const [mode, setMode] = useState<"items" | "even">("items");

  const [diners, setDiners] = useState<Diner[]>(() =>
    user
      ? [{ id: uid("d_"), name: user.name, emoji: user.emoji, color: user.color, isMe: true }]
      : []
  );
  const [newDiner, setNewDiner] = useState("");

  const [items, setItems] = useState<BillItem[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQty, setItemQty] = useState("1");

  const [taxPercent, setTaxPercent] = useState(0);
  const [servicePercent, setServicePercent] = useState(0);
  const [discount, setDiscount] = useState("");

  /* ------------------------------- diners -------------------------------- */
  const addDiner = () => {
    const name = newDiner.trim();
    if (!name) return;
    const i = diners.length;
    setDiners((prev) => [
      ...prev,
      {
        id: uid("d_"),
        name,
        emoji: AVATAR_EMOJIS[(i + 3) % AVATAR_EMOJIS.length],
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      },
    ]);
    setNewDiner("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const removeDiner = (id: string) => {
    setDiners((prev) => prev.filter((d) => d.id !== id));
    setItems((prev) =>
      prev.map((it) => ({ ...it, dinerIds: it.dinerIds.filter((x) => x !== id) }))
    );
  };

  /* -------------------------------- items -------------------------------- */
  const addItem = () => {
    const name = itemName.trim();
    const price = parseRupiah(itemPrice);
    if (!name || price <= 0) return;
    setItems((prev) => [
      ...prev,
      { id: uid("i_"), name, price, qty: Math.max(1, parseInt(itemQty || "1", 10)), dinerIds: [] },
    ]);
    setItemName("");
    setItemPrice("");
    setItemQty("1");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const toggleItemDiner = (itemId: string, dinerId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const has = it.dinerIds.includes(dinerId);
        return {
          ...it,
          dinerIds: has ? it.dinerIds.filter((x) => x !== dinerId) : [...it.dinerIds, dinerId],
        };
      })
    );
  };

  /* ------------------------------- preview ------------------------------- */
  const preview = useMemo(
    () =>
      computeSplit({
        mode,
        diners,
        items,
        taxPercent,
        servicePercent,
        discount: parseRupiah(discount),
      }),
    [mode, diners, items, taxPercent, servicePercent, discount]
  );

  const canSubmit = diners.length > 0 && items.length > 0 && preview.total > 0;

  const onSubmit = async () => {
    if (!canSubmit) return;
    const bill = buildBill(
      {
        id: uid("bill_"),
        title: title.trim() || t.split.defaultTitle,
        emoji,
        createdAt: Date.now(),
        photoUri: null,
      },
      { mode, diners, items, taxPercent, servicePercent, discount: parseRupiah(discount) }
    );
    await saveBill(bill);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace({ pathname: "/result", params: { id: bill.id } });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-ink"
    >
      {/* top bar */}
      <View style={{ paddingTop: insets.top + 8 }} className="flex-row items-center justify-between px-5 pb-2">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-surface">
          <Ionicons name="close" size={22} color="#303841" />
        </Pressable>
        <Text className="text-base font-bold text-fg">{t.split.title}</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 200 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* event */}
        <Text className="mb-2 mt-2 text-sm font-bold text-fg">{t.split.occasion}</Text>
        <Field value={title} onChangeText={setTitle} placeholder={t.split.occasionPlaceholder} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-2">
            {VIBE_EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                className={`h-11 w-11 items-center justify-center rounded-xl border ${
                  emoji === e ? "border-primary bg-primary/20" : "border-line bg-surface"
                }`}
              >
                <Text className="text-xl">{e}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* diners */}
        <Text className="mb-2 mt-7 text-sm font-bold text-fg">{t.split.who}</Text>
        <View className="flex-row flex-wrap gap-2">
          {diners.map((d) => (
            <Pressable
              key={d.id}
              onLongPress={() => removeDiner(d.id)}
              className="flex-row items-center gap-2 rounded-full bg-surface py-1.5 pl-1.5 pr-3"
            >
              <Avatar emoji={d.emoji} color={d.color} size={28} />
              <Text className="text-sm font-semibold text-fg">{d.name}</Text>
            </Pressable>
          ))}
        </View>
        <Text className="mt-1.5 text-[11px] text-muted">{t.split.holdToRemove}</Text>
        <View className="mt-2 flex-row gap-2">
          <Field
            value={newDiner}
            onChangeText={setNewDiner}
            placeholder={t.split.addFriend}
            className="flex-1"
            returnKeyType="done"
            onSubmitEditing={addDiner}
          />
          <Button
            label=""
            variant="lime"
            onPress={addDiner}
            className="px-5"
            icon={<Ionicons name="add" size={22} color="#fff" />}
          />
        </View>

        {/* mode */}
        <Text className="mb-2 mt-7 text-sm font-bold text-fg">{t.split.mode}</Text>
        <View className="flex-row gap-2">
          <Chip label={t.split.perOrder} active={mode === "items"} onPress={() => setMode("items")} />
          <Chip label={t.split.evenly} active={mode === "even"} onPress={() => setMode("even")} />
        </View>
        <Text className="mt-1.5 text-[11px] text-muted">
          {mode === "items" ? t.split.hintPerOrder : t.split.hintEvenly}
        </Text>

        {/* items */}
        <Text className="mb-2 mt-7 text-sm font-bold text-fg">{t.split.items}</Text>

        {/* OCR teaser — coming soon */}
        <Pressable
          onPress={() =>
            Alert.alert(t.split.scanAlertTitle, t.split.scanAlertBody, [{ text: t.split.scanAlertOk }])
          }
          className="mb-3 flex-row items-center gap-3 rounded-xl border border-dashed border-primary/60 bg-primary/10 p-3"
        >
          <Ionicons name="scan-outline" size={24} color="#76ABAE" />
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-bold text-fg">{t.split.scanTitle}</Text>
              <View className="rounded-full bg-lime px-2 py-0.5">
                <Text className="text-[10px] font-black text-white">{t.split.scanSoon}</Text>
              </View>
            </View>
            <Text className="text-[11px] text-muted">{t.split.scanSub}</Text>
          </View>
          <Text className="text-muted">→</Text>
        </Pressable>

        <Card className="p-3">
          <Field value={itemName} onChangeText={setItemName} placeholder={t.split.itemNamePlaceholder} />
          <View className="mt-2 flex-row gap-2">
            <Field
              value={itemPrice}
              onChangeText={setItemPrice}
              placeholder={t.split.pricePlaceholder}
              keyboardType="number-pad"
              className="flex-1"
            />
            <Field
              value={itemQty}
              onChangeText={setItemQty}
              placeholder={t.split.qtyPlaceholder}
              keyboardType="number-pad"
              className="w-20 text-center"
            />
          </View>
          <Button label={t.split.addItem} variant="dark" onPress={addItem} className="mt-2" />
        </Card>

        {items.map((it) => (
          <Card key={it.id} className="mt-3 p-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-base font-bold text-fg">
                  {it.name} {it.qty > 1 ? `×${it.qty}` : ""}
                </Text>
                <Text className="text-sm font-semibold text-lime">{rupiah(it.price * it.qty)}</Text>
              </View>
              <Pressable onPress={() => removeItem(it.id)} className="h-8 w-8 items-center justify-center rounded-full bg-surface">
                <Ionicons name="trash-outline" size={17} color="#6B7580" />
              </Pressable>
            </View>

            {mode === "items" && (
              <>
                <Text className="mb-1.5 mt-3 text-[11px] font-semibold text-muted">
                  {t.split.whoOrdered} {it.dinerIds.length === 0 ? `(${t.common.everyone})` : ""}
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {diners.map((d) => {
                    const on = it.dinerIds.includes(d.id);
                    return (
                      <Pressable
                        key={d.id}
                        onPress={() => toggleItemDiner(it.id, d.id)}
                        style={on ? { backgroundColor: d.color + "33", borderColor: d.color } : {}}
                        className={`flex-row items-center gap-1 rounded-full border px-2.5 py-1 ${
                          on ? "" : "border-line bg-surface"
                        }`}
                      >
                        <Text className="text-xs">{d.emoji}</Text>
                        <Text className={`text-xs font-semibold ${on ? "text-fg" : "text-muted"}`}>
                          {d.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </Card>
        ))}

        {/* charges */}
        <Text className="mb-2 mt-7 text-sm font-bold text-fg">{t.split.chargesSection}</Text>
        <Card className="p-3">
          <Text className="mb-2 text-xs font-semibold text-muted">{t.split.tax}</Text>
          <View className="flex-row gap-2">
            {TAX_PRESETS.map((p) => (
              <Chip key={p} label={p === 0 ? t.split.none : `${p}%`} active={taxPercent === p} onPress={() => setTaxPercent(p)} />
            ))}
          </View>
          <Text className="mb-2 mt-4 text-xs font-semibold text-muted">{t.split.service}</Text>
          <View className="flex-row gap-2">
            {SERVICE_PRESETS.map((p) => (
              <Chip key={p} label={p === 0 ? t.split.none : `${p}%`} active={servicePercent === p} onPress={() => setServicePercent(p)} />
            ))}
          </View>
          <Text className="mb-2 mt-4 text-xs font-semibold text-muted">{t.split.discount}</Text>
          <Field value={discount} onChangeText={setDiscount} placeholder={t.split.discountPlaceholder} keyboardType="number-pad" />
        </Card>
      </ScrollView>

      {/* sticky footer */}
      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="absolute bottom-0 left-0 right-0 border-t border-line bg-surface px-5 pt-3"
      >
        <View className="mb-2 flex-row items-end justify-between">
          <View>
            <Text className="text-sm font-medium text-muted">{t.split.billTotal}</Text>
            {canSubmit && diners.length > 0 && (
              <Text className="text-[11px] font-semibold text-lime">
                {t.split.perPerson(rupiah(preview.total / diners.length))}
              </Text>
            )}
          </View>
          <Text className="text-2xl font-black text-fg">{rupiah(preview.total)}</Text>
        </View>
        {!canSubmit && (
          <Text className="mb-2 text-center text-[11px] font-medium text-muted">
            {diners.length === 0
              ? t.split.needPerson
              : items.length === 0
              ? t.split.needItem
              : t.split.needPrice}
          </Text>
        )}
        <Button label={t.split.submit} onPress={onSubmit} disabled={!canSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
