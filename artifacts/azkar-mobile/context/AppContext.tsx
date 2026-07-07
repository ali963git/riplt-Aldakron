import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AzkarProgress {
  [categoryId: string]: number[]; // array of current counts per item
}

interface AppState {
  // Tasbih
  tasbihCount: number;
  tasbihTarget: number;
  tasbihDhikr: string;
  tasbihDailyTotal: number;

  // Azkar progress (keyed by date_category)
  azkarProgress: AzkarProgress;

  // Quran bookmarks
  quranBookmarks: number[]; // surah IDs

  // Actions
  incrementTasbih: () => void;
  resetTasbih: () => void;
  setTasbihTarget: (n: number) => void;
  setTasbihDhikr: (d: string) => void;
  setAzkarItemCount: (categoryId: string, itemIndex: number, count: number) => void;
  resetAzkarCategory: (categoryId: string) => void;
  toggleQuranBookmark: (surahId: number) => void;
}

const AppContext = createContext<AppState | null>(null);

const today = () => new Date().toISOString().split('T')[0];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTargetState] = useState(33);
  const [tasbihDhikr, setTasbihDhikrState] = useState('سبحان الله');
  const [tasbihDailyTotal, setTasbihDailyTotal] = useState(0);
  const [azkarProgress, setAzkarProgress] = useState<AzkarProgress>({});
  const [quranBookmarks, setQuranBookmarks] = useState<number[]>([]);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const [target, dhikr, totalRaw, progressRaw, bookmarksRaw] = await Promise.all([
          AsyncStorage.getItem('tasbih_target'),
          AsyncStorage.getItem('tasbih_dhikr'),
          AsyncStorage.getItem(`tasbih_total_${today()}`),
          AsyncStorage.getItem(`azkar_progress_${today()}`),
          AsyncStorage.getItem('quran_bookmarks'),
        ]);
        if (target) setTasbihTargetState(parseInt(target));
        if (dhikr) setTasbihDhikrState(dhikr);
        if (totalRaw) setTasbihDailyTotal(parseInt(totalRaw));
        if (progressRaw) setAzkarProgress(JSON.parse(progressRaw));
        if (bookmarksRaw) setQuranBookmarks(JSON.parse(bookmarksRaw));
      } catch {}
    })();
  }, []);

  const incrementTasbih = useCallback(() => {
    setTasbihCount(c => {
      const next = c + 1;
      if (next >= tasbihTarget) {
        setTasbihDailyTotal(t => {
          const newTotal = t + next;
          AsyncStorage.setItem(`tasbih_total_${today()}`, String(newTotal));
          return newTotal;
        });
        return 0;
      }
      return next;
    });
  }, [tasbihTarget]);

  const resetTasbih = useCallback(() => setTasbihCount(0), []);

  const setTasbihTarget = useCallback((n: number) => {
    setTasbihTargetState(n);
    AsyncStorage.setItem('tasbih_target', String(n));
  }, []);

  const setTasbihDhikr = useCallback((d: string) => {
    setTasbihDhikrState(d);
    AsyncStorage.setItem('tasbih_dhikr', d);
    setTasbihCount(0);
  }, []);

  const setAzkarItemCount = useCallback((categoryId: string, itemIndex: number, count: number) => {
    setAzkarProgress(prev => {
      const updated = { ...prev, [categoryId]: [...(prev[categoryId] ?? [])] };
      updated[categoryId][itemIndex] = count;
      AsyncStorage.setItem(`azkar_progress_${today()}`, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetAzkarCategory = useCallback((categoryId: string) => {
    setAzkarProgress(prev => {
      const updated = { ...prev, [categoryId]: [] };
      AsyncStorage.setItem(`azkar_progress_${today()}`, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleQuranBookmark = useCallback((surahId: number) => {
    setQuranBookmarks(prev => {
      const updated = prev.includes(surahId)
        ? prev.filter(id => id !== surahId)
        : [...prev, surahId];
      AsyncStorage.setItem('quran_bookmarks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      tasbihCount, tasbihTarget, tasbihDhikr, tasbihDailyTotal,
      azkarProgress, quranBookmarks,
      incrementTasbih, resetTasbih, setTasbihTarget, setTasbihDhikr,
      setAzkarItemCount, resetAzkarCategory, toggleQuranBookmark,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
