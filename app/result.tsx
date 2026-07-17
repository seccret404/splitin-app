import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ImageBackground, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { Avatar, Button } from "../src/components/ui";
import { useApp } from "../src/context/AppContext";
import { useT } from "../src/i18n/useT";
import { billPaidSummary } from "../src/lib/debt";
import { rupiah } from "../src/lib/format";
import { buildTagihText, buildWhatsAppText, shareImage, shareToWhatsApp } from "../src/lib/share";

export default function Result() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { history, user, saveBill, togglePaid } = useApp();
  const t = useT();

  const bill = useMemo(() => history.find((b) => b.id === id), [history, id]);

  const cardRef = useRef<View>(null);
  const [photo, setPhoto] = useState<string | null>(bill?.photoUri ?? null);
  const [busy, setBusy] = useState<"img" | "wa" | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!bill) {
    return (
      <View className="flex-1 items-center justify-center bg-ink px-8">
        <Ionicons name="help-circle-outline" size={56} color="#9AA3AB" />
        <Text className="mt-3 text-center text-base font-bold text-fg">{t.result.notFound}</Text>
        <Button label={t.common.back} variant="dark" className="mt-6" onPress={() => router.replace("/(tabs)")} />
      </View>
    );
  }

  const sorted = [...bill.shares].sort((a, b) => b.total - a.total);
  const paidIds = bill.paidDinerIds ?? [];
  const summary = billPaidSummary(bill);

  const tagihOne = (name: string, amount: number) => {
    shareToWhatsApp(buildTagihText({ name, amount, title: bill.title, emoji: bill.emoji }, user, t.share));
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      const uri = res.assets[0].uri;
      setPhoto(uri);
      await saveBill({ ...bill, photoUri: uri });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const onShareImage = async () => {
    try {
      setBusy("img");
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      await shareImage(uri);
    } catch (e) {
      // swallow — user may have cancelled
    } finally {
      setBusy(null);
    }
  };

  const onShareWhatsApp = async () => {
    try {
      setBusy("wa");
      await shareToWhatsApp(buildWhatsAppText(bill, t.share));
    } finally {
      setBusy(null);
    }
  };

  /* ----------------------------- shareable card --------------------------- */
  const Header = (
    <View className="px-6 pb-5 pt-7">
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl">{bill.emoji}</Text>
        <View className="rounded-full bg-white/15 px-3 py-1">
          <Text className="text-[11px] font-bold text-white">SplitIn ✨</Text>
        </View>
      </View>
      <Text className="mt-3 text-2xl font-black text-white" style={{ letterSpacing: -0.5 }}>
        {bill.title}
      </Text>
      <Text className="mt-0.5 text-sm font-medium text-white/80">
        {t.result.people(bill.diners.length)} · {bill.mode === "even" ? t.result.evenly : t.result.perOrder}
      </Text>
      <Text className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-white/60">
        {t.result.totalLabel}
      </Text>
      <Text className="text-4xl font-black text-white" style={{ letterSpacing: -1 }}>
        {rupiah(bill.total)}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-ink">
      {/* top bar */}
      <View style={{ paddingTop: insets.top + 8 }} className="flex-row items-center justify-between px-5 pb-2">
        <Pressable onPress={() => router.replace("/(tabs)")} className="h-10 w-10 items-center justify-center rounded-full bg-surface">
          <Ionicons name="close" size={22} color="#303841" />
        </Pressable>
        <Text className="text-base font-bold text-fg">{t.result.title}</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Text className="my-3 text-center text-xs font-medium text-muted">
            {t.result.shareHint}
          </Text>

          {/* CAPTURE TARGET */}
          <View
            ref={cardRef}
            collapsable={false}
            className="overflow-hidden rounded-[20px] bg-card"
          >
            {photo ? (
              <ImageBackground source={{ uri: photo }} resizeMode="cover">
                <LinearGradient colors={["rgba(11,11,18,0.35)", "rgba(11,11,18,0.92)"]}>
                  {Header}
                </LinearGradient>
              </ImageBackground>
            ) : (
              <LinearGradient colors={["#76ABAE", "#FF5722"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {Header}
              </LinearGradient>
            )}

            {/* per-person breakdown */}
            <View className="bg-card px-4 pb-5 pt-4">
              {sorted.map((s, i) => (
                <View
                  key={s.dinerId}
                  className={`flex-row items-center justify-between py-3 ${
                    i < sorted.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <Avatar emoji={s.emoji} color={s.color} size={40} />
                    <View>
                      <Text className="text-base font-bold text-fg">
                        {s.name} {i === 0 ? "👑" : ""}
                      </Text>
                      <Text className="text-[11px] text-muted" numberOfLines={1}>
                        {s.items.map((it) => it.name).join(", ") || "—"}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-black text-lime">{rupiah(s.total)}</Text>
                </View>
              ))}

              <View className="mt-3 flex-row items-center justify-center gap-1">
                <Text className="text-[11px] font-medium text-muted">{t.result.madeBy}</Text>
                <Text className="text-[11px] font-black text-fg">Split</Text>
                <Text className="text-[11px] font-black text-lime">In</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* photo control */}
        <Animated.View entering={FadeInDown.delay(150).duration(450)} className="mt-4">
          <Pressable
            onPress={pickPhoto}
            className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface py-3"
          >
            <Ionicons name={photo ? "sync-outline" : "image-outline"} size={18} color="#303841" />
            <Text className="text-sm font-bold text-fg">
              {photo ? t.result.changePhoto : t.result.addPhoto}
            </Text>
          </Pressable>
        </Animated.View>

        {/* settle progress */}
        {summary.total > 0 && (
          <Animated.View entering={FadeInDown.delay(180).duration(450)} className="mt-6">
            <View className="flex-row items-center justify-between rounded-2xl bg-card p-4">
              <View>
                <Text className="text-sm font-bold text-fg">
                  {t.result.paidProgress(summary.settled, summary.total)}
                </Text>
                <Text className="text-[11px] text-muted">
                  {summary.owed > 0 ? t.result.unpaidAmount(rupiah(summary.owed)) : t.result.allSettled}
                </Text>
              </View>
              {summary.owed > 0 && (
                <Button
                  label={t.result.collectAll}
                  variant="lime"
                  className="px-4 py-3"
                  icon={<Ionicons name="logo-whatsapp" size={16} color="#fff" />}
                  onPress={() => router.push("/(tabs)/tagih")}
                />
              )}
            </View>
          </Animated.View>
        )}

        {/* detailed breakdown (tap to expand) */}
        <Animated.View entering={FadeInDown.delay(220).duration(450)} className="mt-6">
          <Text className="mb-3 text-lg font-bold text-fg">{t.result.breakdown}</Text>
          {sorted.map((s) => {
            const open = expanded === s.dinerId;
            return (
              <Pressable
                key={s.dinerId}
                onPress={() => setExpanded(open ? null : s.dinerId)}
                className="mb-3 rounded-2xl bg-card p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center gap-3">
                    <Avatar emoji={s.emoji} color={s.color} size={40} />
                    <View className="flex-1">
                      <Text className="text-base font-bold text-fg">
                        {s.name} {s.isMe ? t.result.you : ""}
                      </Text>
                      {!s.isMe && paidIds.includes(s.dinerId) && (
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="checkmark-circle" size={12} color="#76ABAE" />
                          <Text className="text-[11px] font-bold text-primary">{t.result.paidTag}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text
                      className={`text-base font-black ${
                        !s.isMe && paidIds.includes(s.dinerId) ? "text-muted line-through" : "text-fg"
                      }`}
                    >
                      {rupiah(s.total)}
                    </Text>
                    <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color="#6B7580" />
                  </View>
                </View>
                {open && (
                  <View className="mt-3 border-t border-line pt-3">
                    {s.items.map((it, idx) => (
                      <View key={idx} className="flex-row justify-between py-1">
                        <Text className="text-sm text-muted">{it.name}</Text>
                        <Text className="text-sm font-semibold text-fg">{rupiah(it.amount)}</Text>
                      </View>
                    ))}
                    {s.serviceShare > 0 && (
                      <Row label={t.result.service} value={s.serviceShare} />
                    )}
                    {s.taxShare > 0 && <Row label={t.result.tax} value={s.taxShare} />}
                    {s.discountShare > 0 && <Row label={t.result.discount} value={-s.discountShare} />}

                    {!s.isMe && (
                      <View className="mt-3 flex-row gap-2">
                        <Button
                          label={paidIds.includes(s.dinerId) ? t.result.paid : t.result.markPaid}
                          variant={paidIds.includes(s.dinerId) ? "lime" : "dark"}
                          className="flex-1 py-3"
                          icon={
                            <Ionicons
                              name={paidIds.includes(s.dinerId) ? "checkmark-circle" : "checkmark-circle-outline"}
                              size={17}
                              color={paidIds.includes(s.dinerId) ? "#fff" : "#303841"}
                            />
                          }
                          onPress={() => togglePaid(bill.id, s.dinerId)}
                        />
                        {!paidIds.includes(s.dinerId) && (
                          <Button
                            label={t.result.collect}
                            variant="dark"
                            className="flex-1 py-3"
                            icon={<Ionicons name="logo-whatsapp" size={16} color="#303841" />}
                            onPress={() => tagihOne(s.name, s.total)}
                          />
                        )}
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      </ScrollView>

      {/* sticky share footer */}
      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="absolute bottom-0 left-0 right-0 border-t border-line bg-surface px-5 pt-3"
      >
        <View className="flex-row gap-3">
          <Button
            label={busy === "img" ? t.common.preparing : t.result.saveImage}
            variant="dark"
            className="flex-1"
            loading={busy === "img"}
            icon={<Ionicons name="download-outline" size={18} color="#303841" />}
            onPress={onShareImage}
          />
          <Button
            label={t.result.sendWa}
            variant="lime"
            className="flex-1"
            loading={busy === "wa"}
            icon={<Ionicons name="logo-whatsapp" size={18} color="#fff" />}
            onPress={onShareWhatsApp}
          />
        </View>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-fg">{rupiah(value)}</Text>
    </View>
  );
}
