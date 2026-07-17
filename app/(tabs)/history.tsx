import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../src/components/ui";
import { useApp } from "../../src/context/AppContext";
import { useFmt, useT } from "../../src/i18n/useT";
import { rupiah } from "../../src/lib/format";

export default function History() {
  const insets = useSafeAreaInsets();
  const { history, removeBill } = useApp();
  const t = useT();
  const fmt = useFmt();

  const confirmDelete = (id: string, title: string) => {
    Alert.alert(t.history.deleteTitle, t.history.deleteBody(title), [
      { text: t.common.cancel, style: "cancel" },
      { text: t.common.delete, style: "destructive", onPress: () => removeBill(id) },
    ]);
  };

  return (
    <View className="flex-1 bg-ink">
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-black text-fg" style={{ letterSpacing: -0.5 }}>
          {t.history.title}
        </Text>
        <Text className="mt-1 text-sm font-medium text-muted">{t.history.subtitle(history.length)}</Text>

        {history.length === 0 ? (
          <Card className="mt-8 items-center py-12">
            <Ionicons name="file-tray-outline" size={52} color="#9AA3AB" />
            <Text className="mt-4 text-base font-bold text-fg">{t.history.emptyTitle}</Text>
            <Text className="mt-1 text-center text-sm text-muted">{t.history.emptyDesc}</Text>
          </Card>
        ) : (
          history.map((b, i) => (
            <Animated.View key={b.id} entering={FadeInDown.delay(i * 50).duration(400)}>
              <Pressable
                onPress={() => router.push({ pathname: "/result", params: { id: b.id } })}
                onLongPress={() => confirmDelete(b.id, b.title)}
                className="mt-3"
              >
                <Card>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface">
                        <Text className="text-2xl">{b.emoji}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-fg" numberOfLines={1}>
                          {b.title}
                        </Text>
                        <Text className="text-xs text-muted">
                          {t.history.people(b.diners.length)} · {fmt.relativeTime(b.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-base font-black text-fg">{rupiah(b.total)}</Text>
                      <Text className="text-[11px] text-muted">{fmt.formatDate(b.createdAt)}</Text>
                    </View>
                  </View>

                  {/* diner avatars preview */}
                  <View className="mt-3 flex-row items-center">
                    {b.shares.slice(0, 6).map((s, idx) => (
                      <View
                        key={s.dinerId}
                        style={{ marginLeft: idx === 0 ? 0 : -8, backgroundColor: s.color + "33", borderColor: s.color }}
                        className="h-7 w-7 items-center justify-center rounded-full border-2"
                      >
                        <Text className="text-xs">{s.emoji}</Text>
                      </View>
                    ))}
                    {b.shares.length > 6 && (
                      <Text className="ml-2 text-xs text-muted">+{b.shares.length - 6}</Text>
                    )}
                  </View>
                </Card>
              </Pressable>
            </Animated.View>
          ))
        )}

        {history.length > 0 && (
          <Text className="mt-5 text-center text-[11px] text-muted">{t.history.holdToDelete}</Text>
        )}
      </ScrollView>
    </View>
  );
}
