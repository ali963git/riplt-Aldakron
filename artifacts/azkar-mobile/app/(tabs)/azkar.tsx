import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { AZKAR_CATEGORIES } from '@/data/azkar';
import { useApp } from '@/context/AppContext';

export default function AzkarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { azkarProgress } = useApp();
  const s = makeStyles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const getDoneCount = (catId: string, total: number) => {
    const prog = azkarProgress[catId] ?? [];
    return prog.filter((c, i) => {
      const cat = AZKAR_CATEGORIES.find(a => a.id === catId);
      if (!cat) return false;
      return c >= (cat.items[i]?.count ?? 1);
    }).length;
  };

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <Text style={s.title}>الأذكار</Text>
      <FlatList
        data={AZKAR_CATEGORIES}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const done = getDoneCount(item.id, item.items.length);
          const total = item.items.length;
          const pct = total > 0 ? done / total : 0;
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push(`/azkar/${item.id}` as any)}
              activeOpacity={0.75}
            >
              <View style={[s.iconCircle, { backgroundColor: item.color + '22' }]}>
                <Ionicons name={item.icon as any} size={26} color={item.color} />
              </View>
              <Text style={s.catTitle}>{item.title}</Text>
              <Text style={s.catSub}>{item.subtitle}</Text>
              {/* Progress bar */}
              <View style={s.progressBg}>
                <View style={[s.progressFill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: item.color }]} />
              </View>
              <Text style={[s.progText, { color: item.color }]}>
                {done}/{total}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={<View style={{ height: Platform.OS === 'web' ? 34 : 16 }} />}
      />
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.foreground, textAlign: 'right', paddingHorizontal: 20, paddingVertical: 12, fontFamily: 'Cairo_700Bold' },
  list: { paddingHorizontal: 12, paddingBottom: 8 },
  row: { gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 18, alignItems: 'flex-end', gap: 6, borderWidth: 1, borderColor: colors.border },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  catTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground, textAlign: 'right', fontFamily: 'Cairo_700Bold' },
  catSub: { fontSize: 11, color: colors.mutedForeground, textAlign: 'right', fontFamily: 'Cairo_400Regular' },
  progressBg: { width: '100%', height: 4, borderRadius: 2, backgroundColor: colors.border, marginTop: 6 },
  progressFill: { height: 4, borderRadius: 2 },
  progText: { fontSize: 11, fontWeight: '700', fontFamily: 'Cairo_700Bold' },
});
