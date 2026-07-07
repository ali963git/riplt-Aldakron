import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, Animated,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { AZKAR_CATEGORIES } from '@/data/azkar';
import { useApp } from '@/context/AppContext';

export default function AzkarCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { azkarProgress, setAzkarItemCount, resetAzkarCategory } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const cat = AZKAR_CATEGORIES.find(c => c.id === category);
  const s = makeStyles(colors, cat?.color ?? colors.primary);

  if (!cat) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>فئة غير موجودة</Text>
      </View>
    );
  }

  const progress = azkarProgress[cat.id] ?? [];
  const item = cat.items[currentIndex];
  const itemCount = progress[currentIndex] ?? 0;
  const target = item?.count ?? 1;
  const pct = Math.min(itemCount / target, 1);
  const allDone = currentIndex >= cat.items.length;

  const onTap = useCallback(() => {
    if (!item) return;
    const newCount = itemCount + 1;
    setAzkarItemCount(cat.id, currentIndex, newCount);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    if (newCount >= target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        if (currentIndex + 1 >= cat.items.length) {
          setShowComplete(true);
        } else {
          setCurrentIndex(i => i + 1);
        }
      }, 300);
    }
  }, [item, itemCount, target, currentIndex, cat]);

  const onReset = () => {
    resetAzkarCategory(cat.id);
    setCurrentIndex(0);
    setShowComplete(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const onSkip = () => {
    if (currentIndex + 1 >= cat.items.length) {
      setShowComplete(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: cat.title,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerTitleStyle: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: colors.foreground },
          headerBackTitle: 'رجوع',
          headerRight: () => (
            <TouchableOpacity onPress={onReset}>
              <Ionicons name="refresh-outline" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[s.container, { paddingBottom: Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 16) }]}>
        {showComplete ? (
          /* Completion screen */
          <View style={s.completeWrap}>
            <Ionicons name="checkmark-circle" size={80} color={cat.color} />
            <Text style={s.completeTitle}>أحسنت! 🌟</Text>
            <Text style={s.completeSub}>لقد أتممت {cat.title}</Text>
            <TouchableOpacity style={[s.completeBtn, { backgroundColor: cat.color }]} onPress={onReset}>
              <Text style={s.completeBtnText}>إعادة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.backLink} onPress={() => router.back()}>
              <Text style={s.backLinkText}>العودة للأذكار</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            {/* Progress header */}
            <View style={s.progressHeader}>
              <Text style={s.progressLabel}>{currentIndex + 1} / {cat.items.length}</Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${Math.round((currentIndex / cat.items.length) * 100)}%` as any, backgroundColor: cat.color }]} />
              </View>
            </View>

            {/* Zikr card */}
            <Animated.View style={[s.zikrCard, { transform: [{ scale: scaleAnim }] }]}>
              {item?.source && <Text style={s.source}>{item.source}</Text>}
              <Text style={s.zikrText}>{item?.text}</Text>
            </Animated.View>

            {/* Count display */}
            <View style={s.countWrap}>
              <Text style={[s.countNum, { color: cat.color }]}>{itemCount}</Text>
              <Text style={s.countSlash}> / {target}</Text>
            </View>

            {/* Count progress */}
            <View style={s.countBar}>
              <View style={[s.countBarFill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: cat.color }]} />
            </View>

            {/* Tap button */}
            <TouchableOpacity style={[s.tapBtn, { backgroundColor: cat.color }]} onPress={onTap} activeOpacity={0.8}>
              <Text style={s.tapBtnText}>اضغط ({target - itemCount} متبق)</Text>
            </TouchableOpacity>

            {/* Skip */}
            <TouchableOpacity style={s.skipBtn} onPress={onSkip}>
              <Text style={s.skipText}>تخطي →</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>, accent: string) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
  content: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 },
  progressHeader: { gap: 8, marginBottom: 20 },
  progressLabel: { fontSize: 12, color: colors.mutedForeground, textAlign: 'right', fontFamily: 'Cairo_400Regular' },
  progressBar: { height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressFill: { height: 4, borderRadius: 2 },
  zikrCard: { backgroundColor: colors.card, borderRadius: 24, padding: 28, marginBottom: 24, borderWidth: 1, borderColor: colors.borderGold },
  source: { fontSize: 11, color: accent, textAlign: 'right', marginBottom: 14, fontFamily: 'Cairo_400Regular' },
  zikrText: { fontSize: 20, color: colors.foreground, textAlign: 'right', lineHeight: 40, fontFamily: 'Cairo_600SemiBold' },
  countWrap: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 12 },
  countNum: { fontSize: 56, fontWeight: '900', fontFamily: 'Cairo_700Bold', lineHeight: 64 },
  countSlash: { fontSize: 22, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
  countBar: { height: 6, borderRadius: 3, backgroundColor: colors.border, marginBottom: 32 },
  countBarFill: { height: 6, borderRadius: 3 },
  tapBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginBottom: 16 },
  tapBtnText: { fontSize: 18, fontWeight: '700', color: colors.primaryForeground, fontFamily: 'Cairo_700Bold' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
  completeWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  completeTitle: { fontSize: 32, fontWeight: '800', color: colors.foreground, fontFamily: 'Cairo_700Bold' },
  completeSub: { fontSize: 16, color: colors.mutedForeground, textAlign: 'center', fontFamily: 'Cairo_400Regular' },
  completeBtn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 24, marginTop: 8 },
  completeBtnText: { fontSize: 16, fontWeight: '700', color: colors.primaryForeground, fontFamily: 'Cairo_700Bold' },
  backLink: { paddingVertical: 10 },
  backLinkText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Cairo_400Regular' },
});
