import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { SURAHS } from '@/data/surahs';
import { useApp } from '@/context/AppContext';

export default function QuranScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { quranBookmarks } = useApp();
  const [query, setQuery] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);

  const filtered = useMemo(() => {
    let list = showBookmarks ? SURAHS.filter(s => quranBookmarks.includes(s.id)) : SURAHS;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(s =>
        s.name.includes(q) || s.englishName.toLowerCase().includes(q) || String(s.id) === q
      );
    }
    return list;
  }, [query, showBookmarks, quranBookmarks]);

  const s = makeStyles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={[s.filterBtn, showBookmarks && s.filterBtnActive]}
          onPress={() => setShowBookmarks(b => !b)}
        >
          <Ionicons name={showBookmarks ? 'bookmark' : 'bookmark-outline'} size={18} color={showBookmarks ? colors.primaryForeground : colors.primary} />
        </TouchableOpacity>
        <Text style={s.title}>القرآن الكريم</Text>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
        <TextInput
          style={s.searchInput}
          placeholder="ابحث عن سورة..."
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          textAlign="right"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            onPress={() => router.push(`/surah/${item.id}` as any)}
            activeOpacity={0.7}
          >
            <View style={s.rowRight}>
              <Text style={s.surahName}>{item.name}</Text>
              <Text style={s.surahMeta}>{item.verses} آية · {item.type}</Text>
            </View>
            <View style={s.numBadge}>
              <Text style={s.numText}>{item.id}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="search-outline" size={36} color={colors.mutedForeground} />
            <Text style={s.emptyText}>لا توجد نتائج</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.foreground, fontFamily: 'Cairo_700Bold' },
  filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderGold },
  filterBtnActive: { backgroundColor: colors.primary },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, marginHorizontal: 20, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: 15, color: colors.foreground, fontFamily: 'Cairo_400Regular', padding: 0 },
  list: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'web' ? 34 : 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rowRight: { flex: 1, alignItems: 'flex-end', gap: 2 },
  surahName: { fontSize: 17, fontWeight: '700', color: colors.foreground, fontFamily: 'Cairo_700Bold' },
  surahMeta: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
  numBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderGold, marginLeft: 12 },
  numText: { fontSize: 13, color: colors.primary, fontWeight: '700', fontFamily: 'Cairo_700Bold' },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
});
