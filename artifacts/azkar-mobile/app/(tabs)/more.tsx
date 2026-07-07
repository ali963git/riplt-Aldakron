import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { toHijri, getArabicDay } from '@/data/prayers';

const HISN_CATEGORIES = [
  { id: 'waking', title: 'أذكار الاستيقاظ', icon: 'sunny', color: '#F59E0B' },
  { id: 'clothes', title: 'دعاء لبس الثوب', icon: 'shirt', color: '#6366F1' },
  { id: 'toilet', title: 'دعاء الخلاء', icon: 'water', color: '#06B6D4' },
  { id: 'wudu', title: 'دعاء الوضوء', icon: 'droplet', color: '#3B82F6' },
  { id: 'adhan', title: 'دعاء الأذان', icon: 'volume-high', color: '#10B981' },
  { id: 'mosque', title: 'دعاء دخول المسجد', icon: 'business', color: '#8B5CF6' },
  { id: 'morning', title: 'أذكار الصباح', icon: 'partly-sunny', color: '#F97316' },
  { id: 'evening', title: 'أذكار المساء', icon: 'moon', color: '#7C3AED' },
  { id: 'sleep2', title: 'أذكار النوم', icon: 'bed', color: '#EC4899' },
  { id: 'worry', title: 'دعاء الهم والحزن', icon: 'heart', color: '#EF4444' },
  { id: 'istikharah', title: 'دعاء الاستخارة', icon: 'help-circle', color: '#14B8A6' },
  { id: 'qunut', title: 'دعاء القنوت', icon: 'star', color: '#D4AF37' },
];

const QUICK_DUAS = [
  { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', ref: 'البقرة: ٢٠١' },
  { text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً', ref: 'آل عمران: ٨' },
  { text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', ref: 'طه: ٢٥-٢٦' },
  { text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ', ref: 'أبو داود' },
];

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = makeStyles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const hijri = toHijri();
  const day = getArabicDay();

  return (
    <ScrollView
      style={[s.container, { paddingTop: topPad }]}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.title}>المزيد</Text>

      {/* Islamic Calendar */}
      <View style={s.calCard}>
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <View style={s.calInfo}>
          <Text style={s.calDay}>{day}</Text>
          <Text style={s.calDate}>{hijri.day} {hijri.month} {hijri.year} هـ</Text>
        </View>
      </View>

      {/* حصن المسلم */}
      <Text style={s.sectionTitle}>حصن المسلم</Text>
      <View style={s.hisnGrid}>
        {HISN_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={s.hisnCard}
            onPress={() => Haptics.selectionAsync()}
            activeOpacity={0.75}
          >
            <View style={[s.hisnIcon, { backgroundColor: cat.color + '22' }]}>
              <Ionicons name={cat.icon as any} size={20} color={cat.color} />
            </View>
            <Text style={s.hisnTitle}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Duas */}
      <Text style={s.sectionTitle}>أدعية قرآنية</Text>
      <View style={s.duaList}>
        {QUICK_DUAS.map((d, i) => (
          <View key={i} style={s.duaCard}>
            <Text style={s.duaRef}>{d.ref}</Text>
            <Text style={s.duaText}>{d.text}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: Platform.OS === 'web' ? 34 : 24 }} />
    </ScrollView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', color: colors.foreground, textAlign: 'right', paddingVertical: 12, fontFamily: 'Cairo_700Bold' },
  calCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: 16, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: colors.borderGold },
  calInfo: { flex: 1, alignItems: 'flex-end', gap: 2 },
  calDay: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
  calDate: { fontSize: 18, fontWeight: '700', color: colors.foreground, fontFamily: 'Cairo_700Bold' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, textAlign: 'right', marginBottom: 14, fontFamily: 'Cairo_700Bold' },
  hisnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  hisnCard: { width: '47%', flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border },
  hisnIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  hisnTitle: { flex: 1, fontSize: 12, color: colors.foreground, textAlign: 'right', fontFamily: 'Cairo_600SemiBold', flexWrap: 'wrap' },
  duaList: { gap: 12, marginBottom: 8 },
  duaCard: { backgroundColor: colors.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.borderGold, gap: 8 },
  duaRef: { fontSize: 11, color: colors.primary, textAlign: 'left', fontFamily: 'Cairo_400Regular' },
  duaText: { fontSize: 16, color: colors.foreground, textAlign: 'right', lineHeight: 30, fontFamily: 'Cairo_600SemiBold' },
});
