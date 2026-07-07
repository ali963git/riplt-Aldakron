import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import {
  calculatePrayerTimes, getNextPrayer, toHijri, getGreeting, getArabicDay,
  DEFAULT_LAT, DEFAULT_LON, PRAYERS, type PrayerTimes,
} from '@/data/prayers';
import { DAILY_VERSES } from '@/data/surahs';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const hijri = toHijri(now);
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const verse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];

  // Refresh clock every minute
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          const times = calculatePrayerTimes(loc.coords.latitude, loc.coords.longitude);
          setPrayerTimes(times);
          if (Platform.OS !== 'web') {
            const geo = await Location.reverseGeocodeAsync(loc.coords);
            if (geo[0]) setLocationName(geo[0].city ?? geo[0].region ?? '');
          }
        } else {
          setPrayerTimes(calculatePrayerTimes(DEFAULT_LAT, DEFAULT_LON));
          setLocationName('مكة المكرمة');
        }
      } catch {
        setPrayerTimes(calculatePrayerTimes(DEFAULT_LAT, DEFAULT_LON));
        setLocationName('مكة المكرمة');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const next = prayerTimes ? getNextPrayer(prayerTimes) : null;

  const s = makeStyles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={[s.container, { paddingTop: topPad }]}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{getGreeting()}</Text>
          <Text style={s.dateRow}>
            {getArabicDay()} · {hijri.day} {hijri.month} {hijri.year}هـ
          </Text>
        </View>
        {locationName ? (
          <View style={s.locBadge}>
            <Ionicons name="location-outline" size={12} color={colors.primary} />
            <Text style={s.locText}>{locationName}</Text>
          </View>
        ) : null}
      </View>

      {/* Next prayer banner */}
      {next && (
        <View style={s.nextBanner}>
          <Text style={s.nextLabel}>الصلاة القادمة</Text>
          <Text style={s.nextName}>{next.nameAr}</Text>
          <Text style={s.nextTime}>بعد {next.remaining}</Text>
        </View>
      )}

      {/* Prayer times card */}
      <View style={s.card}>
        <Text style={s.cardTitle}>مواقيت الصلاة</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
        ) : (
          <View style={s.prayerGrid}>
            {PRAYERS.map(p => {
              const isNext = next?.key === p.key;
              return (
                <View key={p.key} style={[s.prayerRow, isNext && s.prayerRowActive]}>
                  <Text style={[s.prayerTime, isNext && s.prayerTimeActive]}>
                    {prayerTimes?.[p.key] ?? '--:--'}
                  </Text>
                  <Text style={[s.prayerName, isNext && s.prayerNameActive]}>{p.nameAr}</Text>
                  {isNext && <View style={s.prayerDot} />}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Quick actions */}
      <Text style={s.sectionTitle}>وصول سريع</Text>
      <View style={s.quickGrid}>
        {[
          { label: 'أذكار الصباح', icon: 'sunny-outline' as const, cat: 'morning' },
          { label: 'أذكار المساء', icon: 'moon-outline' as const, cat: 'evening' },
          { label: 'أذكار النوم', icon: 'bed-outline' as const, cat: 'sleep' },
          { label: 'بعد الصلاة', icon: 'star-outline' as const, cat: 'prayer' },
        ].map(q => (
          <TouchableOpacity
            key={q.cat}
            style={s.quickCard}
            onPress={() => router.push(`/azkar/${q.cat}` as any)}
            activeOpacity={0.7}
          >
            <Ionicons name={q.icon} size={22} color={colors.primary} />
            <Text style={s.quickLabel}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily verse */}
      <View style={s.verseCard}>
        <Text style={s.verseLabel}>آية اليوم</Text>
        <Text style={s.verseText}>{verse.text}</Text>
        <Text style={s.verseRef}>{verse.ref}</Text>
      </View>

      <View style={{ height: Platform.OS === 'web' ? 34 : 16 }} />
    </ScrollView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, marginTop: 8 },
  greeting: { fontSize: 26, fontWeight: '700', color: colors.foreground, textAlign: 'right', fontFamily: 'Cairo_700Bold' },
  dateRow: { fontSize: 13, color: colors.mutedForeground, textAlign: 'right', marginTop: 2, fontFamily: 'Cairo_400Regular' },
  locBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: colors.borderGold },
  locText: { fontSize: 11, color: colors.primary, fontFamily: 'Cairo_400Regular' },
  nextBanner: { backgroundColor: colors.primary, borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center' },
  nextLabel: { fontSize: 11, color: colors.primaryForeground, opacity: 0.7, fontFamily: 'Cairo_400Regular', marginBottom: 2 },
  nextName: { fontSize: 22, fontWeight: '800', color: colors.primaryForeground, fontFamily: 'Cairo_700Bold' },
  nextTime: { fontSize: 13, color: colors.primaryForeground, opacity: 0.85, marginTop: 2, fontFamily: 'Cairo_400Regular' },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, textAlign: 'right', marginBottom: 16, fontFamily: 'Cairo_700Bold' },
  prayerGrid: { gap: 8 },
  prayerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  prayerRowActive: { backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: colors.borderGold },
  prayerName: { fontSize: 15, color: colors.foreground, fontFamily: 'Cairo_600SemiBold' },
  prayerNameActive: { color: colors.primary },
  prayerTime: { fontSize: 15, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular', letterSpacing: 1 },
  prayerTimeActive: { color: colors.primary, fontWeight: '700' },
  prayerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, textAlign: 'right', marginBottom: 12, fontFamily: 'Cairo_700Bold' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  quickCard: { flex: 1, minWidth: '44%', backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border },
  quickLabel: { fontSize: 12, color: colors.foreground, fontFamily: 'Cairo_600SemiBold', textAlign: 'center' },
  verseCard: { backgroundColor: colors.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.borderGold },
  verseLabel: { fontSize: 11, color: colors.primary, textAlign: 'right', marginBottom: 12, fontFamily: 'Cairo_400Regular', letterSpacing: 1 },
  verseText: { fontSize: 20, color: colors.foreground, textAlign: 'right', lineHeight: 38, fontFamily: 'Cairo_700Bold', marginBottom: 12 },
  verseRef: { fontSize: 12, color: colors.mutedForeground, textAlign: 'left', fontFamily: 'Cairo_400Regular' },
});
