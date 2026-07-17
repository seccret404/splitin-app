import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Button, Card } from "../../src/components/ui";
import { useApp } from "../../src/context/AppContext";
import { useFmt, useT } from "../../src/i18n/useT";
import { aggregateDebts, totalOwedToMe, type DebtEntry } from "../../src/lib/debt";
import { rupiah } from "../../src/lib/format";
import { buildTagihText, shareToWhatsApp } from "../../src/lib/share";

export default function Tagih() {
  const insets = useSafeAreaInsets();
  const { history, user, togglePaid } = useApp();
  const t = useT();
  const fmt = useFmt();

  const debts = useMemo(() => aggregateDebts(history), [history]);
  const totalOwed = useMemo(() => totalOwedToMe(history), [history]);
  const withDebt = debts.filter((d) => d.unpaid > 0);
  const allSettled = debts.filter((d) => d.unpaid === 0);

  const [open, setOpen] = useState<string | null>(null);

  const tagih = (entry: DebtEntry) => {
    const text = buildTagihText(
      { name: entry.name, amount: entry.unpaid, title: t.share.genericTitle, emoji: "🧾" },
      user,
      t.share
    );
    shareToWhatsApp(text);
  };

  return (
    <View className="flex-1 bg-ink">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-black text-fg" style={{ letterSpacing: -0.5 }}>
          {t.collect.title}
        </Text>
        <Text className="mt-1 text-sm font-medium text-muted">{t.collect.subtitle}</Text>

        {/* total owed hero */}
        <Animated.View entering={FadeInDown.duration(450)} className="mt-5 overflow-hidden rounded-2xl">
          <LinearGradient colors={["#76ABAE", "#FF5722"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View className="p-6">
              <Text className="text-sm font-semibold text-white/80">{t.collect.outstanding}</Text>
              <Text className="mt-1 text-4xl font-black text-white" style={{ letterSpacing: -1 }}>
                {rupiah(totalOwed)}
              </Text>
              <Text className="mt-1 text-xs font-medium text-white/70">
                {t.collect.fromPeople(withDebt.length)}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {!user?.payNumber && (
          <Pressable onPress={() => router.push("/(tabs)/profile")} className="mt-3">
            <Card className="flex-row items-center gap-3 border-lime/40 bg-lime/10">
              <Ionicons name="bulb-outline" size={20} color="#76ABAE" />
              <View className="flex-1">
                <Text className="text-sm font-bold text-fg">{t.collect.setupWalletTitle}</Text>
                <Text className="text-[11px] text-muted">{t.collect.setupWalletSub}</Text>
              </View>
            </Card>
          </Pressable>
        )}

        {debts.length === 0 ? (
          <Card className="mt-8 items-center py-12">
            <Ionicons name="happy-outline" size={52} color="#9AA3AB" />
            <Text className="mt-4 text-base font-bold text-fg">{t.collect.emptyTitle}</Text>
            <Text className="mt-1 text-center text-sm text-muted">{t.collect.emptyDesc}</Text>
          </Card>
        ) : (
          <>
            {withDebt.length > 0 && (
              <Text className="mb-2 mt-7 text-sm font-bold text-fg">{t.collect.unpaidSection}</Text>
            )}
            {withDebt.map((entry, i) => (
              <Animated.View key={entry.key} entering={FadeInDown.delay(i * 50).duration(400)}>
                <Card className="mt-2">
                  <Pressable
                    onPress={() => setOpen(open === entry.key ? null : entry.key)}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3">
                      <Avatar emoji={entry.emoji} color={entry.color} size={44} />
                      <View>
                        <Text className="text-base font-bold text-fg">{entry.name}</Text>
                        <Text className="text-xs text-muted">{t.collect.sessionsHint(entry.sessions)}</Text>
                      </View>
                    </View>
                    <Text className="text-lg font-black text-pink">{rupiah(entry.unpaid)}</Text>
                  </Pressable>

                  {open === entry.key && (
                    <View className="mt-3 border-t border-line pt-3">
                      {entry.bills.map((b) => (
                        <Pressable
                          key={b.billId}
                          onPress={() => togglePaid(b.billId, b.dinerId)}
                          className="flex-row items-center justify-between py-2"
                        >
                          <View className="flex-1 flex-row items-center gap-2">
                            <Ionicons
                              name={b.isPaid ? "checkmark-circle" : "ellipse-outline"}
                              size={20}
                              color={b.isPaid ? "#76ABAE" : "#9AA3AB"}
                            />
                            <View>
                              <Text className={`text-sm font-semibold ${b.isPaid ? "text-muted line-through" : "text-fg"}`}>
                                {b.emoji} {b.title}
                              </Text>
                              <Text className="text-[11px] text-muted">{fmt.relativeTime(b.createdAt)}</Text>
                            </View>
                          </View>
                          <Text className={`text-sm font-bold ${b.isPaid ? "text-muted" : "text-fg"}`}>
                            {rupiah(b.amount)}
                          </Text>
                        </Pressable>
                      ))}
                      <Text className="mt-1 text-[11px] text-muted">{t.collect.tapToPaid}</Text>
                      <Button
                        label={t.collect.collectVia(entry.name)}
                        variant="lime"
                        className="mt-3"
                        icon={<Ionicons name="logo-whatsapp" size={17} color="#fff" />}
                        onPress={() => tagih(entry)}
                      />
                    </View>
                  )}
                </Card>
              </Animated.View>
            ))}

            {allSettled.length > 0 && (
              <>
                <Text className="mb-2 mt-7 text-sm font-bold text-fg">{t.collect.paidSection}</Text>
                {allSettled.map((entry) => (
                  <Card key={entry.key} className="mt-2 flex-row items-center justify-between opacity-70">
                    <View className="flex-row items-center gap-3">
                      <Avatar emoji={entry.emoji} color={entry.color} size={40} />
                      <Text className="text-base font-semibold text-fg">{entry.name}</Text>
                    </View>
                    <Text className="text-sm font-bold text-lime">{t.collect.paidBadge}</Text>
                  </Card>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
