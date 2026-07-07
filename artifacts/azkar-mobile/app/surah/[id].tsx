import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity, Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { SURAHS } from '@/data/surahs';
import { useApp } from '@/context/AppContext';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

interface ApiResponse {
  data: {
    name: string;
    englishName: string;
    ayahs: Ayah[];
    revelationType: string;
  };
}

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { quranBookmarks, toggleQuranBookmark } = useApp();
  const surahId = parseInt(id ?? '1');
  const surahMeta = SURAHS.find(s => s.id === surahId);
  const isBookmarked = quranBookmarks.includes(surahId);
  const s = makeStyles(colors);

  const { data, isLoading, isError, refetch } = useQuery<ApiResponse>({
    queryKey: ['surah', surahId],
    queryFn: async () => {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}`);
      if (!res.ok) throw new Error('فشل في تحميل السورة');
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // cache 1 hour
  });

  const handleBookmark = () => {
    toggleQuranBookmark(surahId);
    Haptics.notificationAsync(
      isBookmarked
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: surahMeta?.name ?? 'السورة',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: colors.foreground },
          headerBackTitle: 'رجوع',
          headerRight: () => (
            <TouchableOpacity onPress={handleBookmark} style={{ marginLeft: 8 }}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[s.container, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom }]}>
        {isLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.loadingText}>جاري التحميل...</Text>
          </View>
        ) : isError ? (
          <View style={s.center}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.mutedForeground} />
            <Text style={s.errorText}>تعذّر تحميل السورة</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => refetch()}>
              <Text style={s.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={data?.data.ayahs ?? []}
            keyExtractor={item => String(item.number)}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={s.surahHeader}>
                <Text style={s.surahName}>{surahMeta?.name}</Text>
                <Text style={s.surahMeta}>{surahMeta?.verses} آية · {surahMeta?.type}</Text>
                {surahId !== 9 && (
                  <Text style={s.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <View style={s.ayahRow}>
                <View style={s.ayahNumBadge}>
                  <Text style={s.ayahNum}>{item.numberInSurah}</Text>
                </View>
                <Text style={s.ayahText}>{item.text}</Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={s.sep} />}
          />
        )}
      </View>
    </>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 15, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
  errorText: { fontSize: 16, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  retryText: { fontSize: 15, color: colors.primaryForeground, fontFamily: 'Cairo_700Bold' },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  surahHeader: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  surahName: { fontSize: 28, fontWeight: '800', color: colors.primary, fontFamily: 'Cairo_700Bold' },
  surahMeta: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
  bismillah: { fontSize: 20, color: colors.foreground, textAlign: 'center', lineHeight: 38, fontFamily: 'Cairo_600SemiBold', marginTop: 12, paddingHorizontal: 8 },
  ayahRow: { paddingVertical: 16, gap: 12 },
  ayahNumBadge: { alignSelf: 'flex-end', width: 34, height: 34, borderRadius: 17, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderGold },
  ayahNum: { fontSize: 11, color: colors.primary, fontWeight: '700', fontFamily: 'Cairo_700Bold' },
  ayahText: { fontSize: 20, color: colors.foreground, textAlign: 'right', lineHeight: 40, fontFamily: 'Cairo_600SemiBold' },
  sep: { height: 1, backgroundColor: colors.border },
});
