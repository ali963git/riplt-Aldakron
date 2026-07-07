import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

const DHIKR_OPTIONS = [
  'سبحان الله',
  'الحمد لله',
  'الله أكبر',
  'أستغفر الله',
  'لا إله إلا الله',
  'اللهم صل على محمد',
  'لا حول ولا قوة إلا بالله',
  'سبحان الله وبحمده',
];

const TARGETS = [33, 34, 99, 100, 1000];

export default function TasbihScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasbihCount, tasbihTarget, tasbihDhikr, tasbihDailyTotal,
          incrementTasbih, resetTasbih, setTasbihTarget, setTasbihDhikr } = useApp();
  const s = makeStyles(colors);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pct = tasbihTarget > 0 ? Math.min(tasbihCount / tasbihTarget, 1) : 0;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const onTap = () => {
    incrementTasbih();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const onReset = () => {
    resetTasbih();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <ScrollView
      style={[s.container, { paddingTop: topPad }]}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.headerRow}>
        <TouchableOpacity onPress={onReset} style={s.headerBtn}>
          <Ionicons name="refresh-outline" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <Text style={s.title}>المسبحة</Text>
        <View style={s.totalBadge}>
          <Text style={s.totalText}>{tasbihDailyTotal}</Text>
        </View>
      </View>

      {/* Current dhikr */}
      <Text style={s.dhikrText}>{tasbihDhikr}</Text>

      {/* Progress ring (SVG-free circular visual via simple arc) */}
      <View style={s.ringContainer}>
        <TouchableOpacity onPress={onTap} activeOpacity={0.85}>
          <Animated.View style={[s.tapButton, { transform: [{ scale: scaleAnim }] }]}>
            {/* Outer ring */}
            <View style={[s.ringOuter, { borderColor: colors.border }]}>
              {/* Progress overlay */}
              <View
                style={[s.ringProgress, {
                  borderColor: colors.primary,
                  borderTopColor: pct > 0.25 ? colors.primary : 'transparent',
                  borderRightColor: pct > 0.5 ? colors.primary : 'transparent',
                  borderBottomColor: pct > 0.75 ? colors.primary : 'transparent',
                  borderLeftColor: pct === 1 ? colors.primary : 'transparent',
                }]}
              />
              {/* Count */}
              <View style={s.ringInner}>
                <Text style={s.countText}>{tasbihCount}</Text>
                <Text style={s.targetText}>/ {tasbihTarget}</Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
        <Text style={s.tapHint}>اضغط للتسبيح</Text>
      </View>

      {/* Target selector */}
      <Text style={s.sectionLabel}>الهدف</Text>
      <View style={s.targetRow}>
        {TARGETS.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.targetChip, tasbihTarget === t && s.targetChipActive]}
            onPress={() => { setTasbihTarget(t); Haptics.selectionAsync(); }}
          >
            <Text style={[s.targetChipText, tasbihTarget === t && s.targetChipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dhikr selector */}
      <Text style={s.sectionLabel}>الذكر</Text>
      <View style={s.dhikrList}>
        {DHIKR_OPTIONS.map(d => (
          <TouchableOpacity
            key={d}
            style={[s.dhikrChip, tasbihDhikr === d && s.dhikrChipActive]}
            onPress={() => { setTasbihDhikr(d); Haptics.selectionAsync(); }}
          >
            <Text style={[s.dhikrChipText, tasbihDhikr === d && s.dhikrChipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: Platform.OS === 'web' ? 34 : 24 }} />
    </ScrollView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, paddingVertical: 8 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 22, fontWeight: '800', color: colors.foreground, fontFamily: 'Cairo_700Bold' },
  totalBadge: { backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.borderGold },
  totalText: { fontSize: 13, color: colors.primary, fontWeight: '700', fontFamily: 'Cairo_700Bold' },
  dhikrText: { fontSize: 24, color: colors.primary, textAlign: 'center', marginTop: 8, marginBottom: 32, fontFamily: 'Cairo_700Bold' },
  ringContainer: { alignItems: 'center', marginBottom: 36 },
  tapButton: { alignItems: 'center', justifyContent: 'center' },
  ringOuter: { width: 220, height: 220, borderRadius: 110, borderWidth: 8, alignItems: 'center', justifyContent: 'center' },
  ringProgress: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 8 },
  ringInner: { alignItems: 'center', gap: 4 },
  countText: { fontSize: 56, fontWeight: '900', color: colors.foreground, fontFamily: 'Cairo_700Bold', lineHeight: 64 },
  targetText: { fontSize: 18, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
  tapHint: { marginTop: 16, fontSize: 13, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
  sectionLabel: { fontSize: 13, color: colors.mutedForeground, textAlign: 'right', marginBottom: 10, fontFamily: 'Cairo_400Regular' },
  targetRow: { flexDirection: 'row', gap: 10, marginBottom: 24, justifyContent: 'flex-end' },
  targetChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  targetChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  targetChipText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Cairo_600SemiBold' },
  targetChipTextActive: { color: colors.primaryForeground },
  dhikrList: { gap: 8, marginBottom: 16 },
  dhikrChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-end' },
  dhikrChipActive: { borderColor: colors.primary, backgroundColor: 'rgba(212,175,55,0.08)' },
  dhikrChipText: { fontSize: 16, color: colors.foreground, fontFamily: 'Cairo_400Regular' },
  dhikrChipTextActive: { color: colors.primary, fontWeight: '700', fontFamily: 'Cairo_700Bold' },
});
