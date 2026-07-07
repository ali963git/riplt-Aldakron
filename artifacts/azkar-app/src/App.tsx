import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Moon, 
  Sun, 
  RotateCcw, 
  Search, 
  Award, 
  Compass, 
  Sparkles, 
  Share2, 
  Clock, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Menu, 
  Heart, 
  Calculator, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  BookMarked,
  ZoomIn,
  ZoomOut,
  Eye,
  User,
  Coffee,
  MapPin,
  Facebook,
  Github,
  Star,
  Bell,
  Calendar,
  History,
  Quote,
  Home,
  Book,
  Wind,
  MessageCircle,
  Scroll,
  Hash,
  X,
  Headphones,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { SURAHS, Surah } from './data/surahs';
import { AZKAR_DATA, PRESETS_DHIKR, ZikrItem, AzkarCategory, AudioZikrItem, AUDIO_AZKAR_DATA } from './data/azkar';
import { HISN_AL_MUSLIM, HisnDhikr } from './data/hisn';
import { SUNNAH_DUAS, DuaItem } from './data/duas';
import { SURAH_START_PAGES, getJuzForPage, getSurahForPage } from './data/surahPages';
import { HIJRI_MONTHS, ISLAMIC_EVENTS, IslamicEvent } from './data/islamicEvents';
import { CURATED_HADEETHS, Hadeeth } from './data/hadeethOfTheDay';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { useTranslation } from 'react-i18next';

import { ShareAyahModal } from './components/ShareAyahModal';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import { Flame, TrendingUp, BarChart3, Zap, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';

// Kaaba Coordinates for Qibla calculation
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// Default location (Damascus, Syria)
const DEFAULT_LAT = 33.5138;
const DEFAULT_LNG = 36.2765;

const FEATURED_VERSES = [
  {
    text: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    surah: 'البقرة: 152',
    tafsir: 'أمر الله تعالى بعبادته والثناء عليه والاعتراف بجميل إحسانه بالذكر والشكر، ووعد بالجزاء الأعظم وهو ذكره سبحانه لعبده في الملأ الأعلى.'
  },
  {
    text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    surah: 'الرعد: 28',
    tafsir: 'تأكيد إلهي واضح وبليغ بأن القلوب المتعبة والقلقة لا تجد سكينتها الحقيقية ولا تبرأ عللها إلا بالقرب والاتصال بذكر الله عز وجل.'
  },
  {
    text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    surah: 'البقرة: 186',
    tafsir: 'أعظم آيات القرب الإلهي، تُبين الصلة المباشرة بلا حجاب وبلا وسائط بين العبد الفقير وربه القدير الودود السميع المجيب.'
  }
];

interface Reciter {
  id: string;
  name: string;
  nameEn?: string;
  server: string;
}

const RECITERS: Reciter[] = [
  { id: "afs", name: "الشيخ مشاري راشد العفاسي", nameEn: "Sheikh Mishary Rashid Al-Afasy", server: "https://server8.mp3quran.net/afs/" },
  { id: "maher", name: "الشيخ ماهر المعيقلي", nameEn: "Sheikh Maher Al-Muaiqly", server: "https://server12.mp3quran.net/maher/" },
  { id: "sds", name: "الشيخ عبد الرحمن السديس", nameEn: "Sheikh Abdul Rahman Al-Sudais", server: "https://server11.mp3quran.net/sds/" },
  { id: "dosari", name: "الشيخ ياسر الدوسري", nameEn: "Sheikh Yasser Al-Dosari", server: "https://server11.mp3quran.net/yasser/" },
  { id: "basit", name: "الشيخ عبد الباسط عبد الصمد", nameEn: "Sheikh Abdul Basit Abdul Samad", server: "https://server7.mp3quran.net/basit/" },
  { id: "minsh", name: "الشيخ محمد صديق المنشاوي (المجود)", nameEn: "Sheikh Mohamed Siddiq El-Minshawi (Tajweed)", server: "https://server10.mp3quran.net/minsh_mjwd/" },
  { id: "husr", name: "الشيخ محمود خليل الحصري", nameEn: "Sheikh Mahmoud Khalil Al-Husary", server: "https://server13.mp3quran.net/husr/" },
  { id: "ajm", name: "الشيخ أحمد بن علي العجمي", nameEn: "Sheikh Ahmad Al-Ajmy", server: "https://server10.mp3quran.net/ajm/" },
  { id: "s_gmd", name: "الشيخ سعد الغامدي", nameEn: "Sheikh Saad Al-Ghamdi", server: "https://server7.mp3quran.net/s_gmd/" },
  { id: "frs_a", name: "الشيخ فارس عباد", nameEn: "Sheikh Fares Abbad", server: "https://server8.mp3quran.net/frs_a/" },
  { id: "hazza", name: "الشيخ هزاع البلوشي", nameEn: "Sheikh Hazza Al-Balushi", server: "https://server11.mp3quran.net/hazza/" },
  { id: "islam", name: "الشيخ إسلام صبحي", nameEn: "Sheikh Islam Sobhi", server: "https://server14.mp3quran.net/islam/" },
  { id: "qtm", name: "الشيخ ناصر القطامي", nameEn: "Sheikh Nasser Al-Qatami", server: "https://server6.mp3quran.net/qtm/" },
  { id: "rad", name: "الشيخ رعد محمد الكردي", nameEn: "Sheikh Raad Al-Kurdi", server: "https://server12.mp3quran.net/rad/" },
  { id: "shatri", name: "الشيخ أبو بكر الشاطري", nameEn: "Sheikh Abu Bakr Al-Shatri", server: "https://server11.mp3quran.net/shatri/" },
  { id: "turki", name: "الشيخ بدر التركي", nameEn: "Sheikh Badr Al-Turki", server: "https://server12.mp3quran.net/badr_turki/" }
];

export default function App() {
  const { user, loginWithGoogle, logout } = useAuth();
  const { t, i18n } = useTranslation();

  // Sync user profile
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toastText, setToastText] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [currentSystemTime, setCurrentSystemTime] = useState(new Date());

  // 1. Time Update Interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentSystemTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Custom owner / personalization state (shared link feature)
  const [ownerName, setOwnerName] = useState<string>('علي');
  const [hasOwner, setHasOwner] = useState<boolean>(false);

  // Geolocation & Prayer Times
  const [latitude, setLatitude] = useState<number>(DEFAULT_LAT);
  const [longitude, setLongitude] = useState<number>(DEFAULT_LNG);
  const [locStatusText, setLocStatusText] = useState<string>('توقيت ريف دمشق والقطيفة (افتراضي ومحفوظ مؤقتاً)');
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: '04:02',
    sunrise: '05:35',
    dhuhr: '12:38',
    asr: '16:20',
    maghrib: '19:42',
    isha: '21:15'
  });
  const [qiblaAngle, setQiblaAngle] = useState<number>(185.3);

  const currentTheme = React.useMemo(() => {
    const h = currentSystemTime.getHours();
    const m = currentSystemTime.getMinutes();
    const nowMins = h * 60 + m;

    const getMins = (timeStr: string) => {
      if (!timeStr) return 0;
      const [sh, sm] = timeStr.split(':').map(Number);
      return sh * 60 + sm;
    };

    const fajrMins = getMins(prayerTimes.fajr);
    const sunriseMins = getMins(prayerTimes.sunrise);
    const dhuhrMins = getMins(prayerTimes.dhuhr);
    const asrMins = getMins(prayerTimes.asr);
    const maghribMins = getMins(prayerTimes.maghrib);
    const ishaMins = getMins(prayerTimes.isha);

    if (nowMins >= fajrMins && nowMins < sunriseMins) return 'fajr';
    if (nowMins >= sunriseMins && nowMins < dhuhrMins) return 'morning';
    if (nowMins >= dhuhrMins && nowMins < asrMins) return 'noon';
    if (nowMins >= asrMins && nowMins < maghribMins) return 'afternoon';
    if (nowMins >= maghribMins && nowMins < ishaMins) return 'sunset';
    return 'night';
  }, [currentSystemTime, prayerTimes]);

  const themeStyles = React.useMemo(() => {
    switch (currentTheme) {
      case 'fajr':
        return 'from-[#02130F] via-[#052920] to-[#0D3D32]';
      case 'morning':
        return 'from-[#02130F] via-[#084033] to-[#126B57]';
      case 'noon':
        return 'from-[#02130F] via-[#063328] to-[#1A5C4D]';
      case 'afternoon':
        return 'from-[#02130F] via-[#1A332B] to-[#4D4012]';
      case 'sunset':
        return 'from-[#02130F] via-[#2E1224] to-[#4D121E]';
      default:
        return 'from-[#010B08] via-[#02130F] to-[#042019]';
    }
  }, [currentTheme]);

  // Qibla Finder live orientation and simulation states
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [compassActive, setCompassActive] = useState<boolean>(false);
  const [compassPermissionState, setCompassPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [simulatedHeading, setSimulatedHeading] = useState<number>(0);
  const orientationListenerRef = useRef<any>(null);

  // Islamic Historical Events State
  const [selectedHijriMonth, setSelectedHijriMonth] = useState<number>(() => {
    try {
      const formatterEn = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        month: 'numeric'
      });
      const monthStr = formatterEn.format(new Date());
      const parsed = parseInt(monthStr, 10);
      return isNaN(parsed) || parsed < 1 || parsed > 12 ? 9 : parsed;
    } catch (e) {
      return 9;
    }
  });

  const [currentHijriDay, setCurrentHijriDay] = useState<number>(() => {
    try {
      const formatterEn = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric'
      });
      const dayStr = formatterEn.format(new Date());
      const parsed = parseInt(dayStr, 10);
      return isNaN(parsed) || parsed < 1 || parsed > 30 ? 15 : parsed;
    } catch (e) {
      return 15;
    }
  });

  const currentHijriMonth = (() => {
    try {
      const formatterEn = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        month: 'numeric'
      });
      const monthStr = formatterEn.format(new Date());
      const parsed = parseInt(monthStr, 10);
      return isNaN(parsed) || parsed < 1 || parsed > 12 ? 9 : parsed;
    } catch (e) {
      return 9;
    }
  })();

  // Hadeeth of the Day state
  const [currentHadeethIndex, setCurrentHadeethIndex] = useState<number>(() => {
    try {
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      return Math.abs(dayOfYear) % CURATED_HADEETHS.length;
    } catch (e) {
      return 0;
    }
  });

  // Spiritual Commitment Tracker state (localStorage)
  const [spiritualTasks, setSpiritualTasks] = useState<Record<string, boolean>>({
    Fajr: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
    Quran: false
  });

  // Sunnah and Daily Deeds Checklist state (localStorage)
  const [sunnahChecklist, setSunnahChecklist] = useState<Record<string, boolean>>({
    rawatib: false, // سنن الصلوات الرواتب (12 ركعة)
    duha: false,     // صلاة الضحى
    qiyam: false,    // قيام الليل والوتر
    mulk: false,     // قراءة سورة الملك قبل النوم
    sadaqah: false,  // تقديم صدقة أو عمل إنساني
  });

  // Quran Reading & Memorization Tracker state
  const [quranReadingSurah, setQuranReadingSurah] = useState<string>('البقرة');
  const [quranReadingAyah, setQuranReadingAyah] = useState<number>(1);
  const [quranReadingPage, setQuranReadingPage] = useState<number>(1);
  const [quranMemorizedCount, setQuranMemorizedCount] = useState<number>(0); // number of Surahs memorized (0 to 114)

  // Quran Reader professional states
  const [quranMode, setQuranMode] = useState<'read' | 'listen'>('read');
  const [listenSubTab, setListenSubTab] = useState<'surahs' | 'history'>('surahs');
  const [listeningHistory, setListeningHistory] = useState<any[]>([]);
  const [isShareAyahModalOpen, setIsShareAyahModalOpen] = useState(false);
  const [quranPage, setQuranPage] = useState<number>(() => {
    const saved = localStorage.getItem('quranReadingPage');
    return saved ? Math.min(604, Math.max(1, Number(saved))) : 1;
  });
  const [quranZoom, setQuranZoom] = useState<number>(1);
  const [quranColorFilter, setQuranColorFilter] = useState<'normal' | 'sepia' | 'eyecomfort' | 'dark'>('normal');
  const [savedBookmarks, setSavedBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem('quranReadingBookmarks');
    return saved ? JSON.parse(saved) : [1, 293, 562, 604]; // default bookmarks for Al-Fatihah, Al-Kahf, Al-Mulk, Al-Nas
  });
  const [pageDirection, setPageDirection] = useState<'next' | 'prev'>('next');

  // Interactive Featured Verse Index for AI tab
  const [featuredVerseIndex, setFeaturedVerseIndex] = useState<number>(0);

  // Daily Du'a tab currently selected dua index
  const [selectedDuaIndex, setSelectedDuaIndex] = useState<number>((new Date().getDate() - 1) % 31);

  // Quran Tab state
  const [recitersList, setRecitersList] = useState<Reciter[]>(RECITERS);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [quranSearchQuery, setQuranSearchQuery] = useState<string>('');
  const [hisnSearchQuery, setHisnSearchQuery] = useState<string>('');
  const [activeHisnCategory, setActiveHisnCategory] = useState<string | null>(null);
  const [activeHisnTag, setActiveHisnTag] = useState<string | null>(null);
  const [selectedHisnDhikr, setSelectedHisnDhikr] = useState<HisnDhikr | null>(null);
  const [currentPlayingSurah, setCurrentPlayingSurah] = useState<Surah | null>(null);

  // Custom audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioIdRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  // Touch swipe refs for Quran page navigation
  const quranTouchStartX = useRef<number | null>(null);
  const quranTouchStartY = useRef<number | null>(null);
  // PWA install prompt
  const deferredInstallPromptRef = useRef<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState<boolean>(false);

  // Azkar Tab State
  const [activeAzkarCategory, setActiveAzkarCategory] = useState<'صباح' | 'مساء' | 'نوم' | 'صلاة' | 'favorites'>('صباح');
  const [azkarDataState, setAzkarDataState] = useState<AzkarCategory[]>([]);
  const [favoriteAzkarIds, setFavoriteAzkarIds] = useState<string[]>([]);
  const [azkarMode, setAzkarMode] = useState<'text' | 'audio'>('text');
  const [currentAudioAdhkar, setCurrentAudioAdhkar] = useState<AudioZikrItem | null>(null);
  const [isAudioLoop, setIsAudioLoop] = useState<boolean>(false);

  // Tasbih state
  const [activeDhikrPreset, setActiveDhikrPreset] = useState(PRESETS_DHIKR[0]);
  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [totalTasbihCount, setTotalTasbihCount] = useState<number>(() => {
    const saved = localStorage.getItem('total_tasbih_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [customDhikrTarget, setCustomDhikrTarget] = useState<string>('1000');
  const [isUnlimitedTarget, setIsUnlimitedTarget] = useState<boolean>(false);
  const [customTasbihText, setCustomTasbihText] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // AI Tab State
  const [userGeminiKey, setUserGeminiKey] = useState<string>('');
  const [aiMode, setAiMode] = useState<'tafsir' | 'wird'>('tafsir');
  const [aiSelectedSurah, setAiSelectedSurah] = useState<string>('الفاتحة');
  const [aiCustomVerse, setAiCustomVerse] = useState<string>('');
  const [aiSelectedMood, setAiSelectedMood] = useState<string>('حزن وضيق');
  const [aiResponseText, setAiResponseText] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Zakat Calculator State
  const [zakatCash, setZakatCash] = useState<string>('');
  const [zakatGold, setZakatGold] = useState<string>('');
  const [zakatSilver, setZakatSilver] = useState<string>('');
  const [customGoldPrice, setCustomGoldPrice] = useState<string>('75'); // $75/gram of 24k as reference for 2026
  const [customSilverPrice, setCustomSilverPrice] = useState<string>('1.00'); // $1/gram as reference
  const [zakatReport, setZakatReport] = useState<React.ReactNode | null>(null);

  // Daily Dhikr History State
  const [dailyHistory, setDailyHistory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('dhikr_daily_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Seed realistic data for the last 7 days if empty
    const seeded: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      // Give them some nice starter numbers to encourage them
      seeded[dateStr] = Math.floor(Math.random() * 80) + 40; 
    }
    localStorage.setItem('dhikr_daily_history', JSON.stringify(seeded));
    return seeded;
  });

  // Record dhikr count (amount is added to today's count)
  const recordDhikrCount = (amount: number = 1) => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    setDailyHistory(prev => {
      const current = prev[dateStr] || 0;
      const updatedCount = current + amount;
      const updated = { ...prev, [dateStr]: updatedCount };
      localStorage.setItem('dhikr_daily_history', JSON.stringify(updated));

      return updated;
    });
  };

  // Compute live dhikr statistics and weekly history for recharts visual display
  const dhikrStats = useMemo(() => {
    const today = new Date();
    const getFormatted = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = getFormatted(today);
    const todayCount = dailyHistory[todayStr] || 0;

    // Calculate Grand Total
    const historyValues = Object.values(dailyHistory) as number[];
    const grandTotal: number = historyValues.reduce((sum: number, val: number): number => sum + val, 0);

    // Calculate Daily Average
    const uniqueDays = Object.keys(dailyHistory).length || 1;
    const dailyAverage = Math.round((grandTotal as number) / uniqueDays);

    // Compute Streak (days in a row with at least 1 dhikr)
    let streak = 0;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = getFormatted(yesterday);

    const hasToday = todayCount > 0;
    const hasYesterday = (dailyHistory[yesterdayStr] || 0) > 0;

    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? today : yesterday;
      while (true) {
        const dateStr = getFormatted(checkDate);
        if ((dailyHistory[dateStr] || 0) > 0) {
          streak++;
          // go to previous day
          const prevDay = new Date(checkDate);
          prevDay.setDate(checkDate.getDate() - 1);
          checkDate = prevDay;
        } else {
          break;
        }
      }
    }

    // Format last 7 days for the chart
    const daysOfWeekAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const daysOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = getFormatted(d);
      const dayName = i18n.language === 'ar' ? daysOfWeekAr[d.getDay()] : daysOfWeekEn[d.getDay()];
      chartData.push({
        name: dayName,
        count: dailyHistory[dateStr] || 0,
        formattedDate: dateStr
      });
    }

    // Motivational Levels and progress calculations
    let levelTitle = 'ذاكر مبتدئ';
    let levelTitleEn = 'Beginner';
    let badgeColor = 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300';
    let nextGoal = 100;
    
    if (todayCount >= 500) {
      levelTitle = 'سيد الذاكرين 👑';
      levelTitleEn = 'Master of Dhikr 👑';
      badgeColor = 'from-amber-500/30 to-yellow-500/30 border-amber-500/50 text-amber-300 shadow-amber-500/10';
      nextGoal = 1000;
    } else if (todayCount >= 300) {
      levelTitle = 'ذاكر مقرب ✨';
      levelTitleEn = 'Devout Rememberer ✨';
      badgeColor = 'from-emerald-500/30 to-teal-500/30 border-emerald-500/50 text-emerald-300 shadow-emerald-500/10';
      nextGoal = 500;
    } else if (todayCount >= 100) {
      levelTitle = 'ذاكر مداوم 📿';
      levelTitleEn = 'Consistent Rememberer 📿';
      badgeColor = 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40 text-yellow-300';
      nextGoal = 300;
    } else if (todayCount >= 33) {
      levelTitle = 'ذاكر مجتهد 🌱';
      levelTitleEn = 'Diligent Rememberer 🌱';
      badgeColor = 'from-teal-500/10 to-emerald-500/10 border-teal-500/30 text-teal-300';
      nextGoal = 100;
    }

    return {
      todayCount,
      grandTotal,
      dailyAverage,
      streak,
      chartData,
      levelTitle,
      levelTitleEn,
      badgeColor,
      nextGoal
    };
  }, [dailyHistory, i18n.language]);

  const [showDhikrDashboard, setShowDhikrDashboard] = useState<boolean>(true);

  // Custom Dhikr Item Interface
  interface CustomDhikrItem {
    id: string;
    text: string;
    count: number;
    createdAt: string;
  }

  // Custom Dhikr list state
  const [customDhikrList, setCustomDhikrList] = useState<CustomDhikrItem[]>(() => {
    const saved = localStorage.getItem('custom_dhikr_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Seed some realistic starter custom dhikrs
    const defaultCustoms: CustomDhikrItem[] = [
      { id: '1', text: 'أستغفر الله العظيم وأتوب إليه', count: 0, createdAt: new Date().toISOString() },
      { id: '2', text: 'لا إله إلا الله وحده لا شريك له', count: 0, createdAt: new Date().toISOString() },
      { id: '3', text: 'اللهم صل وسلم على نبينا محمد', count: 0, createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('custom_dhikr_list', JSON.stringify(defaultCustoms));
    return defaultCustoms;
  });

  const [newCustomDhikrText, setNewCustomDhikrText] = useState<string>('');

  const addCustomDhikr = (text: string) => {
    if (!text.trim()) return;
    const newItem: CustomDhikrItem = {
      id: Date.now().toString(),
      text: text.trim(),
      count: 0,
      createdAt: new Date().toISOString()
    };
    const updatedList = [newItem, ...customDhikrList];
    setCustomDhikrList(updatedList);
    localStorage.setItem('custom_dhikr_list', JSON.stringify(updatedList));
    setNewCustomDhikrText('');
    triggerToast('تمت إضافة الذكر المخصص بنجاح ✨');

  };

  const incrementCustomDhikr = (id: string) => {
    const updatedList = customDhikrList.map(item => {
      if (item.id === id) {
        const newCount = item.count + 1;
        recordDhikrCount(1); // Increment today's total stats
        // Trigger haptic if supported
        if (navigator.vibrate) {
          navigator.vibrate(15);
        }
        playClickSound();
        return { ...item, count: newCount };
      }
      return item;
    });
    setCustomDhikrList(updatedList);
    localStorage.setItem('custom_dhikr_list', JSON.stringify(updatedList));

  };

  const resetCustomDhikr = (id: string) => {
    const updatedList = customDhikrList.map(item => {
      if (item.id === id) {
        return { ...item, count: 0 };
      }
      return item;
    });
    setCustomDhikrList(updatedList);
    localStorage.setItem('custom_dhikr_list', JSON.stringify(updatedList));
    triggerToast('تم إعادة تعيين العداد إلى صفر 🔄');

  };

  const deleteCustomDhikr = (id: string) => {
    const updatedList = customDhikrList.filter(item => item.id !== id);
    setCustomDhikrList(updatedList);
    localStorage.setItem('custom_dhikr_list', JSON.stringify(updatedList));
    triggerToast('تم حذف الذكر المخصص 🗑️');

  };

  // Custom share state
  const [customShareName, setCustomShareName] = useState<string>('علي');
  const [generatedShareLink, setGeneratedShareLink] = useState<string>('');

  // Prayer Alert Notification State
  const [prayerAlertsEnabled, setPrayerAlertsEnabled] = useState<boolean>(false);
  const [notifiedKeys, setNotifiedKeys] = useState<string[]>([]);

  // Toast trigger helper
  const triggerToast = (message: string) => {
    setToastText(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // Helper to fetch with retries (robust network resiliency)
  const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3, delay = 1000): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Fetch failed for ${url}, retrying in ${delay}ms... Remaining retries: ${retries}`, error);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // Subscribe to Web Push (no-op stub)
  const subscribeToWebPush = async (_lat?: number, _lng?: number) => {
    // Push notifications not available in this build
  };

  // Unsubscribe from Web Push (no-op stub)
  const unsubscribeFromWebPush = async () => {
    // Push notifications not available in this build
  };

  // 1. Initial mounting setup
  useEffect(() => {
    // Check url search query parameter for personalized name
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get('name') || params.get('owner');
    if (nameParam) {
      setOwnerName(nameParam);
      setHasOwner(true);
      triggerToast(`مرحباً بك في نسخة الذكر الخاصة بـ ${nameParam}`);
    }

    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('spiritualTasks');
    if (savedTasks) {
      try {
        setSpiritualTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse spiritualTasks', e);
      }
    }

    // Load Sunnah checklist from localStorage
    const savedSunnah = localStorage.getItem('sunnahChecklist');
    if (savedSunnah) {
      try {
        setSunnahChecklist(JSON.parse(savedSunnah));
      } catch (e) {
        console.error('Failed to parse sunnahChecklist', e);
      }
    }

    // Load Quran tracking states from localStorage
    const savedQuranReadingSurah = localStorage.getItem('quranReadingSurah');
    if (savedQuranReadingSurah) setQuranReadingSurah(savedQuranReadingSurah);

    const savedQuranReadingAyah = localStorage.getItem('quranReadingAyah');
    if (savedQuranReadingAyah) setQuranReadingAyah(Number(savedQuranReadingAyah));

    const savedQuranReadingPage = localStorage.getItem('quranReadingPage');
    if (savedQuranReadingPage) setQuranReadingPage(Number(savedQuranReadingPage));

    const savedQuranMemorizedCount = localStorage.getItem('quranMemorizedCount');
    if (savedQuranMemorizedCount) setQuranMemorizedCount(Number(savedQuranMemorizedCount));

    // Load User API key from localStorage
    const savedKey = localStorage.getItem('userGeminiKey');
    if (savedKey) {
      setUserGeminiKey(savedKey);
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteAzkar');
    if (savedFavorites) {
      try {
        setFavoriteAzkarIds(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favoriteAzkar', e);
      }
    }

    // Load prayer alerts setting
    const savedAlerts = localStorage.getItem('prayerAlertsEnabled') === 'true';
    setPrayerAlertsEnabled(savedAlerts);

    // Clone and set initial Azkar Data State
    const deepClonedAzkar = JSON.parse(JSON.stringify(AZKAR_DATA));
    setAzkarDataState(deepClonedAzkar);

    // Initialize audio element
    audioRef.current = new Audio();
    
    // Attempt Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setLocStatusText(`توقيت موقعك الحالي: خط عرض ${lat.toFixed(2)}، خط طول ${lng.toFixed(2)}`);
          calculateQibla(lat, lng);
        },
        (error) => {
          console.log('Geolocation error, using default Damascus', error);
          setLocStatusText('توقيت ريف دمشق والقطيفة (افتراضي لعدم تفعيل الموقع)');
          calculateQibla(DEFAULT_LAT, DEFAULT_LNG);
        }
      );
    } else {
      calculateQibla(DEFAULT_LAT, DEFAULT_LNG);
    }

    if (savedAlerts && 'Notification' in window && Notification.permission === 'granted') {
      subscribeToWebPush();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // PWA install prompt — capture beforeinstallprompt for custom install button
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredInstallPromptRef.current = e;
      setCanInstallPwa(true);
    };
    const installedHandler = () => setCanInstallPwa(false);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  // Dynamic Reciters update effect to keep servers auto-healed and fully working
  useEffect(() => {
    const fetchLiveReciters = async () => {
      try {
        const response = await fetch('/api/quran/reciters');
        if (!response.ok) return;
        const data = await response.json();
        if (data && Array.isArray(data.reciters)) {
          const apiReciters = data.reciters;
          
          const updatedReciters = RECITERS.map(rec => {
            const match = apiReciters.find((apiRec: any) => {
              const apiName = apiRec.name || '';
              if (rec.id === 'afs' && apiName.includes('العفاسي')) return true;
              if (rec.id === 'maher' && apiName.includes('المعيقلي')) return true;
              if (rec.id === 'sds' && apiName.includes('السديس')) return true;
              if (rec.id === 'dosari' && apiName.includes('الدوسري')) return true;
              if (rec.id === 'basit' && apiName.includes('عبد الباسط')) return true;
              if (rec.id === 'minsh' && apiName.includes('المنشاوي')) return true;
              if (rec.id === 'husr' && apiName.includes('الحصري')) return true;
              if (rec.id === 'ajm' && apiName.includes('العجمي')) return true;
              if (rec.id === 's_gmd' && apiName.includes('سعد الغامدي')) return true;
              if (rec.id === 'frs_a' && apiName.includes('فارس عباد')) return true;
              if (rec.id === 'hazza' && apiName.includes('هزاع البلوشي')) return true;
              if (rec.id === 'islam' && apiName.includes('إسلام صبحي')) return true;
              if (rec.id === 'qtm' && apiName.includes('ناصر القطامي')) return true;
              if (rec.id === 'rad' && apiName.includes('رعد')) return true;
              if (rec.id === 'shatri' && apiName.includes('الشاطري')) return true;
              if (rec.id === 'turki' && apiName.includes('بدر التركي')) return true;
              return false;
            });

            if (match && Array.isArray(match.moshaf) && match.moshaf.length > 0) {
              const moshaf = match.moshaf[0];
              if (moshaf && moshaf.server) {
                return { ...rec, server: moshaf.server };
              }
            }
            return rec;
          });

          setRecitersList(updatedReciters);
        }
      } catch (err) {
        console.warn('Failed to load dynamic reciters from API:', err);
      }
    };

    fetchLiveReciters();
  }, []);

  // 2. Compute dynamic prayer times and Qibla angle whenever coordinates change
  useEffect(() => {
    computePrayerTimes(latitude, longitude);
    if (prayerAlertsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      subscribeToWebPush(latitude, longitude);
    }
  }, [latitude, longitude, prayerAlertsEnabled]);

  // Fetch Listening History - localStorage only
  useEffect(() => {
    const saved = localStorage.getItem('listeningHistory');
    if (saved) {
      try { setListeningHistory(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  // Keyboard Arrow navigation for Quran pages (RTL: Left arrow -> Next, Right arrow -> Prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'quran' || quranMode !== 'read') return;
      
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        if (quranPage < 604) {
          updateQuranPageAndProgress(quranPage + 1, 'next');
        }
      } else if (e.key === 'ArrowRight') {
        if (quranPage > 1) {
          updateQuranPageAndProgress(quranPage - 1, 'prev');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, quranMode, quranPage]);

  // Preload neighboring Quran pages for instant load
  useEffect(() => {
    if (activeTab === 'quran' && quranMode === 'read') {
      const preloadPage = (pageNo: number) => {
        if (pageNo >= 1 && pageNo <= 604) {
          const img = new Image();
          img.src = `https://quran.ksu.edu.sa/png_big/${pageNo}.png`;
        }
      };
      if (quranPage < 604) preloadPage(quranPage + 1);
      if (quranPage > 1) preloadPage(quranPage - 1);
    }
  }, [quranPage, activeTab, quranMode]);

  // Calculations for Prayer Times (Dynamic approximation)
  const computePrayerTimes = (lat: number, lng: number) => {
    // Using a realistic astronomical model based on latitude and longitude offsets from Damascus baseline
    const latDiff = lat - DEFAULT_LAT;
    const lngDiff = lng - DEFAULT_LNG;
    
    // Each degree of longitude moves solar noon by exactly 4 minutes.
    // Negative diff (going west) makes prayer times later, positive diff (going east) makes them earlier.
    const timeShiftMinutes = -lngDiff * 4;

    // Shift based on latitude (sun height changes based on season, summer solstice is around June)
    // For Fajr and Isha, higher latitude in summer means earlier Fajr and later Isha.
    const fajrShift = -latDiff * 2.5 + timeShiftMinutes;
    const sunriseShift = -latDiff * 1.5 + timeShiftMinutes;
    const dhuhrShift = timeShiftMinutes;
    const asrShift = latDiff * 0.8 + timeShiftMinutes;
    const maghribShift = latDiff * 1.8 + timeShiftMinutes;
    const ishaShift = latDiff * 2.8 + timeShiftMinutes;

    // Helper to add minutes to a time string
    const addMinutesToTime = (timeStr: string, minutes: number) => {
      const [h, m] = timeStr.split(':').map(Number);
      let totalMinutes = h * 60 + m + Math.round(minutes);
      // Ensure positive values within 24h
      totalMinutes = (totalMinutes + 1440) % 1440;
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    setPrayerTimes({
      fajr: addMinutesToTime('04:02', fajrShift),
      sunrise: addMinutesToTime('05:35', sunriseShift),
      dhuhr: addMinutesToTime('12:38', dhuhrShift),
      asr: addMinutesToTime('16:20', asrShift),
      maghrib: addMinutesToTime('19:42', maghribShift),
      isha: addMinutesToTime('21:15', ishaShift)
    });
  };

  // Synthesize a beautiful, high-quality gentle celestial chime chord using Web Audio API
  const playGentleChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Note 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 1.0);

      // Note 2: E5 (659.25 Hz) slightly delayed
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.15);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 1.15);

      // Note 3: G5 (783.99 Hz) slightly further delayed
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
      gain3.gain.setValueAtTime(0.15, ctx.currentTime + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start();
      osc3.stop(ctx.currentTime + 1.3);
    } catch (err) {
      console.error('Failed to play gentle synthesized chime:', err);
    }
  };

  const togglePrayerAlerts = async () => {
    let newState = !prayerAlertsEnabled;
    if (!prayerAlertsEnabled) {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            triggerToast('تم تفعيل إشعارات المتصفح لصلواتك بنجاح 🔔⭐');
            await subscribeToWebPush();
          } else if (permission === 'denied') {
            triggerToast('تنبيه: تم رفض الإشعارات. سنعتمد على التنبيهات الصوتية وتنبيهات التطبيق 🔔');
          } else {
            triggerToast('تم تفعيل التنبيهات الداخلية بلطف في التطبيق 🔔');
          }
        } catch (e) {
          console.error('Notification permission request failed', e);
          triggerToast('تم تفعيل التنبيهات الداخلية بلطف في التطبيق 🔔');
        }
      } else {
        triggerToast('المتصفح لا يدعم الإشعارات التلقائية. سنعتمد على التنبيهات الصوتية 🔔');
      }
      setPrayerAlertsEnabled(true);
      localStorage.setItem('prayerAlertsEnabled', 'true');
      setTimeout(() => {
        playGentleChime();
      }, 500);
    } else {
      setPrayerAlertsEnabled(false);
      localStorage.setItem('prayerAlertsEnabled', 'false');
      await unsubscribeFromWebPush();
      triggerToast('تم إيقاف تفعيل تنبيهات الصلوات.');
    }
    
  };

  const triggerPrayerNotification = (prayerName: string, message: string, key: string) => {
    // 1. Play default synthesized chime
    playGentleChime();

    // 2. Browser standard notification if granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const title = `🕌 ${prayerName}`;
        const options = {
          body: message,
          silent: true,
          tag: `prayer-alert-${key}`
        };
        new Notification(title, options);
      } catch (err) {
        console.error('Failed to show native browser notification:', err);
      }
    }

    // 3. Always show in-app Toast notification
    triggerToast(`🔔 ${prayerName}: ${message}`);
  };

  // Prayer Times notification checker effect
  useEffect(() => {
    if (!prayerAlertsEnabled) return;

    const checkPrayerTimes = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const currentMinutes = h * 60 + m;
      const todayStr = now.toDateString();

      const PRAYER_NAMES_AR: Record<string, string> = {
        fajr: 'صلاة الفجر',
        sunrise: 'شروق الشمس',
        dhuhr: 'صلاة الظهر',
        asr: 'صلاة العصر',
        maghrib: 'صلاة المغرب',
        isha: 'صلاة العشاء'
      };

      Object.entries(prayerTimes).forEach(([key, timeStr]) => {
        if (!timeStr) return;
        const [ph, pm] = (timeStr as string).split(':').map(Number);
        const prayerMinutes = ph * 60 + pm;

        // 1. Alert at exact prayer time
        if (currentMinutes === prayerMinutes) {
          const notifyId = `${key}-exact-${todayStr}`;
          if (!notifiedKeys.includes(notifyId)) {
            triggerPrayerNotification(PRAYER_NAMES_AR[key], 'حان الآن موعد الأذان المبارك 🕌. تيسّر للوضوء والصلاة، تقبل الله طاعتك.', key);
            setNotifiedKeys(prev => [...prev, notifyId]);
          }
        }

        // 2. Alert 10 minutes before prayer time
        if (currentMinutes === prayerMinutes - 10) {
          const notifyId = `${key}-before-${todayStr}`;
          if (!notifiedKeys.includes(notifyId)) {
            triggerPrayerNotification(PRAYER_NAMES_AR[key], 'بقي 10 دقائق على موعد الأذان المبارك ⏰. تهيأ وتوضأ لتدرك الصلاة في وقتها.', key);
            setNotifiedKeys(prev => [...prev, notifyId]);
          }
        }
      });
    };

    checkPrayerTimes();
    const interval = setInterval(checkPrayerTimes, 30000);
    return () => clearInterval(interval);
  }, [prayerAlertsEnabled, prayerTimes, notifiedKeys]);

  // Math Qibla calculation
  const calculateQibla = (lat: number, lng: number) => {
    const lat1 = lat * Math.PI / 180;
    const lon1 = lng * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;
    const lon2 = KAABA_LNG * Math.PI / 180;

    const y = Math.sin(lon2 - lon1);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    let qiblaRad = Math.atan2(y, x);
    let qiblaDeg = qiblaRad * 180 / Math.PI;
    qiblaDeg = (qiblaDeg + 360) % 360;
    setQiblaAngle(parseFloat(qiblaDeg.toFixed(1)));
  };

  const startCompass = async () => {
    if (typeof window === 'undefined') return;

    // Check if DeviceOrientationEvent exists
    if (!window.DeviceOrientationEvent) {
      setCompassPermissionState('unsupported');
      triggerToast('عذراً، مستشعرات البوصلة الجغرافية غير مدعومة في متصفحك الحالي ⚠️');
      return;
    }

    const requestPermission = (DeviceOrientationEvent as any).requestPermission;
    const isIOS = typeof requestPermission === 'function';

    if (isIOS) {
      try {
        const response = await requestPermission();
        if (response === 'granted') {
          setCompassPermissionState('granted');
          registerOrientationListener();
        } else {
          setCompassPermissionState('denied');
          triggerToast('تم رفض إذن الوصول لمستشعرات البوصلة ⚠️. يرجى تفعيلها من إعدادات المتصفح.');
        }
      } catch (err) {
        console.error('Compass permission error:', err);
        setCompassPermissionState('denied');
        triggerToast('حدث خطأ أثناء طلب إذن البوصلة التفاعلية.');
      }
    } else {
      // Android / generic
      setCompassPermissionState('granted');
      registerOrientationListener();
    }
  };

  const registerOrientationListener = () => {
    let lastVibrated = 0;
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = (event as any).webkitCompassHeading;
      
      if (heading === undefined) {
        if (event.alpha !== null) {
          heading = 360 - event.alpha;
        }
      }

      if (heading !== undefined && heading !== null) {
        const roundedHeading = Math.round(heading);
        setDeviceHeading(roundedHeading);
        setCompassActive(true);

        // Check alignment with Qibla
        const angleDiff = ((qiblaAngle - roundedHeading + 540) % 360) - 180;
        if (Math.abs(angleDiff) < 4) {
          const now = Date.now();
          if (now - lastVibrated > 3000) {
            if (navigator.vibrate) {
              navigator.vibrate([150, 100, 150]);
            }
            lastVibrated = now;
          }
        }
      }
    };

    // Clean up any old listener first
    if (orientationListenerRef.current) {
      window.removeEventListener('deviceorientation', orientationListenerRef.current, true);
    }

    orientationListenerRef.current = handleOrientation;
    window.addEventListener('deviceorientation', handleOrientation, true);
    triggerToast('تم تشغيل البوصلة التفاعلية الحية بنجاح! حرّك جهازك الآن للقبلة 🧭🕋');
  };

  // Cleanup orientation listener on unmount
  useEffect(() => {
    return () => {
      if (orientationListenerRef.current) {
        window.removeEventListener('deviceorientation', orientationListenerRef.current, true);
      }
    };
  }, []);

  // 3. Audio Player handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (currentAudioAdhkar && isAudioLoop && audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.warn("Loop play error:", e));
        setIsPlaying(true);
        return;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      if (currentPlayingSurah) {
        triggerToast('تم الانتهاء من تلاوة السورة المباركة بحمد الله');
      } else if (currentAudioAdhkar) {
        triggerToast('تم الانتهاء من الاستماع للأذكار المباركة بحمد الله');
      }
    };

    const handlePause = () => {
       setIsPlaying(false);
       // Save to localStorage
       if (currentPlayingSurah && audioRef.current) {
          const saved = localStorage.getItem('listeningHistory');
          const history = saved ? JSON.parse(saved) : [];
          const idx = history.findIndex((h: any) => h.id === String(currentPlayingSurah.id));
          const entry = { id: String(currentPlayingSurah.id), surahId: currentPlayingSurah.id, lastPosition: audioRef.current.currentTime, lastListenedAt: new Date().toISOString() };
          if (idx >= 0) history[idx] = entry; else history.unshift(entry);
          localStorage.setItem('listeningHistory', JSON.stringify(history.slice(0, 50)));
          setListeningHistory(history.slice(0, 50));
       }
    };

    const handleAudioError = (e: Event) => {
      console.warn("Audio element failed to load or play source:", e);
      setIsPlaying(false);
      setIsAudioLoading(false);
      triggerToast('تنبيه: تعذر تحميل الملف الصوتي من الخادم. يرجى التحقق من اتصالك بالإنترنت 🌐⚠️');
    };

    const handleWaiting = () => setIsAudioLoading(true);
    const handleLoadStart = () => setIsAudioLoading(true);
    const handleCanPlay = () => setIsAudioLoading(false);
    const handlePlaying = () => setIsAudioLoading(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleAudioError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [user, currentPlayingSurah, currentAudioAdhkar, isAudioLoop]);

  // Sync volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sync playback rate (speed)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, currentPlayingSurah, currentAudioAdhkar]);

  const skipTime = (amount: number) => {
    if (!audioRef.current) return;
    let newTime = audioRef.current.currentTime + amount;
    if (newTime < 0) newTime = 0;
    if (newTime > duration) newTime = duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    activeAudioIdRef.current = null;
    setIsPlaying(false);
    setIsAudioLoading(false);
    setCurrentPlayingSurah(null);
    setCurrentAudioAdhkar(null);
    setCurrentTime(0);
    setDuration(0);
  };

  const togglePlay = () => {
    if (!audioRef.current || (!currentPlayingSurah && !currentAudioAdhkar)) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        if (err.name === 'AbortError') {
          console.log("Playback interrupted by a new load request (this is normal).");
        } else {
          console.error('Audio play error:', err);
          triggerToast('حدث خطأ أثناء تشغيل الصوت. يرجى المحاولة مرة أخرى.');
        }
      });
    }
  };

  const playAudioAdhkar = (adhkar: AudioZikrItem) => {
    if (!audioRef.current) return;
    
    const audioId = `adhkar-${adhkar.id}`;
    activeAudioIdRef.current = audioId;

    audioRef.current.src = adhkar.audioUrl;
    audioRef.current.load();
    
    setCurrentAudioAdhkar(adhkar);
    setCurrentPlayingSurah(null); // Stop surah if any
    setIsPlaying(true);
    
    audioRef.current.play().then(() => {
        if (activeAudioIdRef.current === audioId) {
          setIsPlaying(true);
          triggerToast(`جاري تشغيل ${adhkar.title} بصوت ${adhkar.reader} 🎧✨`);
        }
    }).catch(e => {
        if (e.name === 'AbortError') {
          console.log("Adhkar playback interrupted by a new request.");
        } else {
          console.warn("Audio play error:", e);
          setIsPlaying(false);
        }
    });
  };

  const playSurah = async (surah: Surah, startFromPosition?: number) => {
    if (!audioRef.current) return;
    
    const audioId = `surah-${surah.id}`;
    
    // Toggle play/pause if user clicks on currently active surah
    if (currentPlayingSurah?.id === surah.id && startFromPosition === undefined) {
      togglePlay();
      return;
    }

    activeAudioIdRef.current = audioId;

    // Stop any audio adhkar
    setCurrentAudioAdhkar(null);
    
    // Construct full URL using our secure CORS-free audio proxy
    const serverBase = selectedReciter.server.endsWith('/') ? selectedReciter.server : `${selectedReciter.server}/`;
    const directUrl = `${serverBase}${surah.file}.mp3`;
    const audioUrl = `/api/quran/audio?url=${encodeURIComponent(directUrl)}`;
    
    audioRef.current.src = audioUrl;
    audioRef.current.load();
    
    let position = startFromPosition;

    // Check for last position in database if not provided directly
    if (position === undefined && user) {
      const cachedItem = listeningHistory.find(item => String(item.id) === String(surah.id));
      if (cachedItem) {
        position = cachedItem.lastPosition || 0;
      } else {
        try {
          const saved = localStorage.getItem('listeningHistory');
          if (saved) {
            const history = JSON.parse(saved);
            const entry = history.find((h: any) => h.id === String(surah.id));
            if (entry) position = entry.lastPosition || 0;
          }
        } catch (err) {
          console.warn("Error fetching listening history from localStorage", err);
        }
      }
    }

    // Abort if another track was requested while fetching history asynchronously
    if (activeAudioIdRef.current !== audioId) {
      console.log(`Stale play request for surah ${surah.id} ignored.`);
      return;
    }

    if (position && position > 0) {
      audioRef.current.currentTime = position;
    }

    setCurrentPlayingSurah(surah);
    setIsPlaying(true);
    
    // Autoplay
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        if (activeAudioIdRef.current === audioId) {
          setIsPlaying(true);
          triggerToast(`جاري تشغيل سورة ${surah.name} بصوت ${selectedReciter.name}`);
        }
      }).catch((error) => {
        if (error.name === 'AbortError') {
          console.log("Surah playback interrupted by a new load request.");
        } else {
          console.error("Playback failed initially:", error);
          setIsPlaying(false);
        }
      });
    }
  };

  const changeReciter = (reciterId: string) => {
    const reciter = recitersList.find(r => r.id === reciterId) || RECITERS.find(r => r.id === reciterId);
    if (!reciter) return;
    setSelectedReciter(reciter);
    
    // If a surah is currently playing, switch the stream URL dynamically using our proxy
    if (currentPlayingSurah) {
      const serverBase = reciter.server.endsWith('/') ? reciter.server : `${reciter.server}/`;
      const directUrl = `${serverBase}${currentPlayingSurah.file}.mp3`;
      const audioUrl = `/api/quran/audio?url=${encodeURIComponent(directUrl)}`;
      if (audioRef.current) {
        const wasPlaying = isPlaying;
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        if (wasPlaying) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            if (err.name === 'AbortError') {
              console.log("Play aborted during reciter change.");
            } else {
              console.warn("Play failed on reciter change:", err);
              setIsPlaying(false);
            }
          });
        }
        triggerToast(`تم تحويل القارئ إلى ${reciter.name}`);
      }
    } else {
      triggerToast(`القارئ المعتمد الآن: ${reciter.name}`);
    }
  };

  const seekAudio = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX: number;
    if ('touches' in e) {
      const touch = e.changedTouches[0] || e.touches[0];
      if (!touch) return;
      clientX = touch.clientX;
    } else {
      clientX = e.clientX;
    }
    const newPercentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = newPercentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 4. Spiritual Commitments handlers
  const toggleSpiritualTask = (taskKey: string) => {
    const updated = {
      ...spiritualTasks,
      [taskKey]: !spiritualTasks[taskKey]
    };
    setSpiritualTasks(updated);
    localStorage.setItem('spiritualTasks', JSON.stringify(updated));

    // Trigger feedback
    if (updated[taskKey]) {
      triggerToast('تقبل الله منكم صالح الأعمال والذكر المبارك ✨');
      // Vibrate if available
      if (navigator.vibrate) {
        navigator.vibrate(80);
      }
    }
  };

  const resetSpiritualTracker = () => {
    const reset = {
      Fajr: false,
      Dhuhr: false,
      Asr: false,
      Maghrib: false,
      Isha: false,
      Quran: false
    };
    setSpiritualTasks(reset);
    localStorage.setItem('spiritualTasks', JSON.stringify(reset));
    triggerToast('تمت إعادة ضبط جدول التزامك الإيماني لليوم بنجاح.');
  };

  const toggleSunnahTask = (key: string) => {
    const updated = {
      ...sunnahChecklist,
      [key]: !sunnahChecklist[key]
    };
    setSunnahChecklist(updated);
    localStorage.setItem('sunnahChecklist', JSON.stringify(updated));
    if (updated[key]) {
      triggerToast('كتب الله لك الأجر ومضاعفة الثواب والسنن النبوية المباركة 🤍');
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const resetSunnahChecklist = () => {
    const reset = {
      rawatib: false,
      duha: false,
      qiyam: false,
      mulk: false,
      sadaqah: false,
    };
    setSunnahChecklist(reset);
    localStorage.setItem('sunnahChecklist', JSON.stringify(reset));
    triggerToast('تم تصفير أوراد السنن والمستحبات لليوم بنجاح.');
  };

  const saveQuranProgress = (surah: string, ayah: number, page: number) => {
    setQuranReadingSurah(surah);
    setQuranReadingAyah(ayah);
    setQuranReadingPage(page);
    localStorage.setItem('quranReadingSurah', surah);
    localStorage.setItem('quranReadingAyah', String(ayah));
    localStorage.setItem('quranReadingPage', String(page));
    triggerToast('تم حفظ تقدمك في قراءة ورد القرآن المبارك بنجاح 📖🍃');
  };

  const saveQuranMemorization = (count: number) => {
    const cleanCount = Math.max(0, Math.min(114, count));
    setQuranMemorizedCount(cleanCount);
    localStorage.setItem('quranMemorizedCount', String(cleanCount));
    triggerToast(`هنيئاً لك! تم تحديث عدد السور المحفوظة: ${cleanCount} سورة 🌟⭐`);
  };

  const toggleBookmark = (page: number) => {
    let updated;
    if (savedBookmarks.includes(page)) {
      updated = savedBookmarks.filter((p) => p !== page);
      triggerToast('تم إزالة الصفحة من العلامات المرجعية 📖');
    } else {
      updated = [...savedBookmarks, page].sort((a, b) => a - b);
      triggerToast('تم حفظ الصفحة كعلامة مرجعية بنجاح 📌');
    }
    setSavedBookmarks(updated);
    localStorage.setItem('quranReadingBookmarks', JSON.stringify(updated));
  };

  const updateQuranPageAndProgress = (page: number, dir: 'next' | 'prev') => {
    const clampedPage = Math.min(604, Math.max(1, page));
    setPageDirection(dir);
    setQuranPage(clampedPage);
    setQuranReadingPage(clampedPage);
    localStorage.setItem('quranReadingPage', String(clampedPage));

    // Automatically update the matched Surah and save to progress
    const matchedSurah = getSurahForPage(clampedPage, SURAHS);
    if (matchedSurah) {
      setQuranReadingSurah(matchedSurah.name);
      localStorage.setItem('quranReadingSurah', matchedSurah.name);
    }
  };

  const triggerVerseContemplation = async (verse: string) => {
    setAiCustomVerse(verse);
    setActiveTab('ai');
    triggerToast('جاري البدء في تدبر الآية وتفسيرها الآن بواسطة المستشار الذكي 💬');
    
    const promptValue = `أرجو منك تقديم تدبر روحي وتفسير مبسط وشرح مبهر ومؤثر لقوله تعالى: "${verse}" مع استخلاص الهدايات والفوائد العملية المباشرة للقلب وحياتنا اليومية.`;
    await fetchAiResponse(promptValue, 'أنت مستشار تدبر قرآني روحي وإيماني رفيق. تتصف بوقار وهيبة وروحانية عالية لتفسير وشرح آيات الذكر الحكيم بأسلوب يلامس القلوب ويزيل الهموم.');
  };

  const triggerPageContemplation = async (page: number) => {
    setActiveTab('ai');
    triggerToast(`جاري الاتصال بالمساعد الذكي للبدء في تدبر الصفحة رقم ${page} 💬`);
    const matchedSurah = getSurahForPage(page, SURAHS);
    const surahName = matchedSurah ? matchedSurah.name : 'القرآن الكريم';
    const juzNum = getJuzForPage(page);
    
    const promptValue = `أرجو منك تقديم تدبر روحي وتفسير مبسط وهدايات إيمانية للصفحة رقم ${page} من المصحف الشريف (والتي تقع في سورة ${surahName}، الجزء ${juzNum}). 
أبرز أهم المواعظ، والأحكام واللطائف، والرسائل الإيمانية التي توجهها هذه الصفحة لقارئها وكيف ينعكس تدبرها على قلبه وسلوكه اليومي.`;
    await fetchAiResponse(promptValue, 'أنت مفسر ومعلم تدبر قرآني روحي وإيماني رفيق. تتصف بالوقار والهيبة والشرح الروحاني الدافئ المؤثر بأسلوب بليغ وسهل جداً يلامس الوجدان.');
  };

  const triggerDuaContemplation = async (dua: string, explanation: string) => {
    setAiCustomVerse(dua);
    setActiveTab('ai');
    triggerToast('جاري بدء شرح وتفصيل مأثورات الدعاء بواسطة المستشار الذكي 💬');
    
    const promptValue = `أرجو منك تقديم شرح روحي وإيماني مفصل ومؤثر ومبسط لهذا الدعاء المأثور من السنة النبوية الشريفة: "${dua}". الشرح الحالي المبدئي: "${explanation}". يرجى تفصيل لطائفه الإيمانية، دلالاته اللغوية، الفوائد والآثار التربوية والقلبية التي تعود على الداعي به، وحث المسلم على لزومه وبنائه كعادة يومية دائمية.`;
    await fetchAiResponse(promptValue, 'أنت مستشار روحي وإيماني رفيق، وفقيه متمكن في شرح الأدعية المأثورة والسنن النبوية المباركة. تتصف بوقار وروحانية عالية تشرح القلوب وتقربها إلى طاعة الله وتدبر كلام نبيه ﷺ.');
  };

  const copyDuaToClipboard = (dua: DuaItem) => {
    const textToCopy = `🤲 دعاء مأثور من السنة النبوية المطهرة:
« ${dua.text} »

📜 الشرح واللطائف:
${dua.explanation}

🌟 الفائدة الروحية:
${dua.benefit}

🔗 الراوي والمصدر:
${dua.reference}

— تم النسخ من منصة ذاكرون الرقمية 🕋`;
    navigator.clipboard.writeText(textToCopy);
    triggerToast('تم نسخ الدعاء الشريف ولطائفه بنجاح لمشاركته ونشر الأجر! 🤲✨');
  };

  const getHijriDateString = () => {
    try {
      const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formatter.format(new Date());
    } catch (e) {
      return '١٥ ذو الحجة ١٤٤٧ هـ';
    }
  };

  const completedTasksCount = Object.values(spiritualTasks).filter(Boolean).length;
  const spiritualProgressPercent = (completedTasksCount / 6) * 100;

  const currentHeading = compassActive && deviceHeading !== null ? deviceHeading : simulatedHeading;
  const headingDiff = ((qiblaAngle - currentHeading + 540) % 360) - 180;
  const isAligned = Math.abs(headingDiff) < 5;

  // 5. Azkar handlers
  const decrementZikrCount = (categoryId: string, zikrId: string) => {
    const updatedCategories = azkarDataState.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== zikrId) return item;
          if (item.count <= 0) return item;
          
          const newCount = item.count - 1;
          recordDhikrCount(1);
          if (newCount === 0) {
            triggerToast('تمت قراءة الذكر كاملاً وجزاك الله كل خير ✨');
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
          } else {
            if (navigator.vibrate) {
              navigator.vibrate(30);
            }
          }
          return { ...item, count: newCount };
        })
      };
    });
    setAzkarDataState(updatedCategories);
  };

  const toggleFavorite = (zikrId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (favoriteAzkarIds.includes(zikrId)) {
      updated = favoriteAzkarIds.filter(id => id !== zikrId);
      triggerToast('تم إزالة الذكر من مفضلتك 💔');
    } else {
      updated = [...favoriteAzkarIds, zikrId];
      triggerToast('تم إضافة الذكر إلى مفضلتك ⭐');
    }
    setFavoriteAzkarIds(updated);
    localStorage.setItem('favoriteAzkar', JSON.stringify(updated));
  };

  const findCategoryOfItem = (zikrId: string): string => {
    const category = azkarDataState.find(cat => cat.items.some(item => item.id === zikrId));
    return category ? category.id : '';
  };

  const resetCurrentCategoryAzkar = () => {
    if (activeAzkarCategory === 'favorites') {
      const updatedCategories = azkarDataState.map(cat => {
        return {
          ...cat,
          items: cat.items.map(item => {
            if (favoriteAzkarIds.includes(item.id)) {
              const originalCat = AZKAR_DATA.find(c => c.id === cat.id);
              const originalItem = originalCat?.items.find(ori => ori.id === item.id);
              return {
                ...item,
                count: originalItem ? originalItem.initialCount : item.initialCount
              };
            }
            return item;
          })
        };
      });
      setAzkarDataState(updatedCategories);
      triggerToast('تمت إعادة تعيين عداد الأذكار المفضلة.');
      return;
    }

    const originalCat = AZKAR_DATA.find(cat => cat.id === activeAzkarCategory);
    if (!originalCat) return;

    const updatedCategories = azkarDataState.map(cat => {
      if (cat.id !== activeAzkarCategory) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          const originalItem = originalCat.items.find(ori => ori.id === item.id);
          return {
            ...item,
            count: originalItem ? originalItem.initialCount : item.initialCount
          };
        })
      };
    });
    setAzkarDataState(updatedCategories);
    triggerToast('تمت إعادة تعيين عداد الأذكار لهذا القسم.');
  };

  // 6. Tasbih handlers
  // Web Audio Synthesizers for perfect, responsive cross-device click & success chimes
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("AudioContext playback prevented/unsupported", e);
    }
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.35); // C6
      
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("AudioContext success chime blocked/unsupported", e);
    }
  };

  const getTargetCount = () => {
    if (isUnlimitedTarget) return Infinity;
    if (activeDhikrPreset.id === 'custom') {
      const parsed = parseInt(customDhikrTarget, 10);
      return isNaN(parsed) || parsed <= 0 ? 1000 : parsed;
    }
    return activeDhikrPreset.count;
  };

  const selectTasbihPreset = (preset: typeof PRESETS_DHIKR[0]) => {
    setActiveDhikrPreset(preset);
    setTasbihCount(0);
    setIsUnlimitedTarget(false);
    triggerToast(`الورد الحالي: ${preset.text}`);
  };

  const incrementTasbih = () => {
    const newCount = tasbihCount + 1;
    setTasbihCount(newCount);
    
    const newTotal = totalTasbihCount + 1;
    setTotalTasbihCount(newTotal);
    localStorage.setItem('total_tasbih_count', newTotal.toString());
    
    recordDhikrCount(1);
    
    playClickSound();

    if (navigator.vibrate) {
      try {
        navigator.vibrate(30);
      } catch (e) {
        console.warn(e);
      }
    }

    const target = getTargetCount();
    if (newCount === target) {
      playSuccessSound();
      triggerToast(`تم إكمال دورة الورد (${target} تكرار) المعتمدة! بارك الله فيك ونفع بك ✨🤍`);
      if (navigator.vibrate) {
        try {
          navigator.vibrate([150, 100, 150]);
        } catch (e) {
          console.warn(e);
        }
      }
    }
  };

  const resetTasbih = () => {
    setTasbihCount(0);
    triggerToast('تم تصفير المسبحة الإلكترونية الحالية.');
  };

  // 7. Zakat calculation
  const calculateZakat = (e: React.FormEvent) => {
    e.preventDefault();
    const cash = parseFloat(zakatCash) || 0;
    const goldGrams = parseFloat(zakatGold) || 0;
    const silverGrams = parseFloat(zakatSilver) || 0;
    
    const goldRate = parseFloat(customGoldPrice) || 75;
    const silverRate = parseFloat(customSilverPrice) || 1.0;

    // Nisab criteria: Gold 24k is 85 grams. Silver is 595 grams.
    const goldNisabValue = 85 * goldRate;
    const silverNisabValue = 595 * silverRate;
    
    // Total liquid savings
    const totalAssetsValue = cash + (goldGrams * goldRate) + (silverGrams * silverRate);
    
    // Islamic standard rule uses the GOLD Nisab for modern fiat currencies to ensure accuracy, 
    // or whichever is most beneficial for the poor (silver is often used for maximum charity, gold is standard for mid-wealth).
    // Let's compute both and display a comprehensive report!
    const isDueGoldStandard = totalAssetsValue >= goldNisabValue;
    const dueZakatAmount = isDueGoldStandard ? totalAssetsValue * 0.025 : 0;

    const reportNode = (
      <div className="space-y-6 text-right font-sans">
        <div className="border-b border-[#D4AF37]/20 pb-4">
          <h5 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-100 font-amiri">التقرير التفصيلي المحسوب لعام 1447هـ / 2026م</h5>
          <p className="text-xs text-gray-400 mt-1">حساب شرعي دقيق مبني على مقادير نصاب الذهب (85غ) والفضة (595غ)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#02130F] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-400 block">إجمالي قيمة النقد والمدخرات:</span>
            <span className="text-lg font-mono font-bold text-amber-100">{cash.toLocaleString()} $</span>
          </div>
          <div className="bg-[#02130F] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-400 block">قيمة مدخرات الذهب (عيار 24):</span>
            <span className="text-lg font-mono font-bold text-amber-100">{(goldGrams * goldRate).toLocaleString()} $ <span className="text-xs text-gray-500">({goldGrams} غ)</span></span>
          </div>
          <div className="bg-[#02130F] p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-400 block">قيمة مدخرات الفضة:</span>
            <span className="text-lg font-mono font-bold text-amber-100">{(silverGrams * silverRate).toLocaleString()} $ <span className="text-xs text-gray-500">({silverGrams} غ)</span></span>
          </div>
          <div className="bg-[#02130F]/90 p-4 rounded-xl border border-[#D4AF37]/15">
            <span className="text-xs text-[#D4AF37] block font-bold">إجمالي الثروة المجمّعة:</span>
            <span className="text-xl font-mono font-extrabold text-[#D4AF37]">{totalAssetsValue.toLocaleString()} $</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#02130F] border border-[#D4AF37]/20 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">قيمة نصاب الذهب الحالي (85 غرام):</span>
            <span className="font-mono font-bold text-amber-200">{goldNisabValue.toLocaleString()} $</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2">
            <span className="text-gray-400">حالة بلوغ النصاب الشرعي:</span>
            {isDueGoldStandard ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                بالغ للنصاب (وجبت الزكاة)
              </span>
            ) : (
              <span className="text-amber-400 font-bold">
                دون النصاب (لا تجب الزكاة)
              </span>
            )}
          </div>
        </div>

        {isDueGoldStandard ? (
          <div className="bg-[#052F20] border-2 border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
            <span className="text-xs text-emerald-300 block font-bold">قيمة الزكاة المفروضة لإخراجها فوراً (2.5%):</span>
            <h6 className="text-3xl font-mono font-black text-emerald-400">{dueZakatAmount.toLocaleString()} $</h6>
            <p className="text-[11px] text-gray-300 leading-relaxed max-w-md mx-auto pt-2">
              تُصرف هذه الأموال للمستحقين الشرعيين من مصارف الزكاة الثمانية (الفقراء، المساكين، العاملين عليها، المؤلفة قلوبهم، وفي الرقاب، والغارمين، وفي سبيل الله، وابن السبيل). تقبل الله منك صدقتك وطهر بها مالك ونفسك.
            </p>
          </div>
        ) : (
          <div className="bg-[#1C1402] border border-[#D4AF37]/30 p-5 rounded-2xl text-center space-y-1">
            <span className="text-xs text-[#D4AF37] block font-bold">تنبيه شرعي رفيق</span>
            <p className="text-xs text-gray-300 leading-relaxed">
              بما أن مجموع أموالك المدخرة أقل من قيمة النصاب الشرعي ({goldNisabValue.toLocaleString()} $)، فلا تجب عليك الزكاة فرضاً. ولكن يُستحب لك التصدق طوعاً كصدقة عامة تطهيراً لقلبك ومالك، لقوله تعالى: "مَنْ ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً".
            </p>
          </div>
        )}
      </div>
    );
    setZakatReport(reportNode);
    triggerToast('تم حساب الزكاة وتوليد التقرير الشرعي بنجاح.');
  };

  // 8. Custom Link Generation
  const generatePublishLink = () => {
    if (!customShareName.trim()) {
      triggerToast('يرجى إدخال اسم صحيح لتخصيص المنصة.');
      return;
    }
    const currentUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${currentUrl}?name=${encodeURIComponent(customShareName.trim())}`;
    setGeneratedShareLink(shareUrl);
  };

  const copyPublishLink = () => {
    if (!generatedShareLink) return;
    navigator.clipboard.writeText(generatedShareLink);
    triggerToast('تم نسخ رابط الصدقة الجارية المخصص لمشاركتها فوراً!');
  };

  // 9. AI Response Handler
  const saveGeminiKey = (key: string) => {
    setUserGeminiKey(key);
    localStorage.setItem('userGeminiKey', key);
    triggerToast('تم حفظ مفتاح Gemini API الخاص بك محلياً بنجاح.');
  };

  const generateAiTafsir = async () => {
    const promptValue = aiCustomVerse.trim() 
      ? `أرجو منك تقديم تدبر روحي وتفسير مبسط وشرح مبهر ومؤثر لقوله تعالى: "${aiCustomVerse.trim()}" مع استخلاص الهدايات والفوائد العملية المباشرة للقلب وحياتنا اليومية.`
      : `أرجو منك تقديم تدبر روحي وإيماني فخم ومبسط لسورة "${aiSelectedSurah}" المباركة، مع تبيان فضل السورة، ومقاصدها الرئيسية، وفوائد تطبيقية تعزز حضور القلب في صلواتنا.`;
    
    await fetchAiResponse(promptValue, 'أنت مستشار تدبر قرآني روحي وإيماني رفيق. تصف بوقار وهيبة وروحانية عالية لتفسير وشرح آيات الذكر الحكيم بأسلوب يلامس القلوب ويزيل الهموم.');
  };

  const generateAiWird = async () => {
    const promptValue = `أشعر حالياً بـ "${aiSelectedMood}" وأبحث عن راحة روحي وإيماني. ولد لي ورد قلوب مخصص ومواسي جداً من القرآن والسنة يتناسب بدقة مع هذه الحالة، واذكر آيات تمنح الطمأنينة والأمل، وأدعية نبوية مأثورة للشفاء وذهاب الهم، وخطوات تطبيقية سهلة لرفع الهمة والتقرب إلى الله.`;
    
    await fetchAiResponse(promptValue, 'أنت مرشد روحي إسلامي رفيق ومستشار لسلامة وصلاح القلوب. تساعد المسلم في مواجهة المشاعر السلبية أو الفتور بالذكر الحكيم والورد المهدئ لروع الروح.');
  };

  const fetchAiResponse = async (prompt: string, systemInstruction: string) => {
    setAiLoading(true);
    setAiResponseText('');
    
    try {
      const response = await fetch('/api/gemini/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': userGeminiKey.trim()
        },
        body: JSON.stringify({ prompt, systemInstruction })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'فشل التوليد.' }));
        setAiResponseText(data.error || 'فشل التوليد. يرجى مراجعة إعدادات مفتاح API الخاص بك والمحاولة مرة أخرى.');
        triggerToast('فشل التوليد. يرجى المحاولة لاحقاً.');
        setAiLoading(false);
        return;
      }

      if (!response.body) {
        throw new Error('ReadableStream non-supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';
      let hasReceivedAnyText = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: !done });
          buffer += chunkStr;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            if (trimmedLine.startsWith('data: ')) {
              const dataStr = trimmedLine.slice(6);
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) {
                  setAiResponseText(prev => prev + `\n[خطأ: ${parsed.error}]`);
                } else if (parsed.text) {
                  setAiResponseText(prev => prev + parsed.text);
                  hasReceivedAnyText = true;
                }
              } catch (e) {
                console.error('Failed to parse chunk:', e, trimmedLine);
              }
            }
          }
        }
      }

      if (hasReceivedAnyText) {
        triggerToast('تم توليد الرد الإيماني المخصص من المستشار الذكي ✨');
      } else {
        triggerToast('انتهى التوليد.');
      }
    } catch (err: any) {
      console.error('AI error:', err);
      setAiResponseText('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والتحقق من صلاحية مفتاح API.');
      triggerToast('حدث خطأ أثناء التوليد.');
    } finally {
      setAiLoading(false);
    }
  };

  const copyAiResponse = () => {
    if (!aiResponseText) return;
    navigator.clipboard.writeText(aiResponseText);
    triggerToast('تم نسخ نص التدبر والورد إلى الحافظة بنجاح.');
  };

  // Helper to filter surahs
  const filteredSurahs = useMemo(() => {
    return SURAHS.filter(surah => 
      surah.name.includes(quranSearchQuery) || 
      surah.englishName.toLowerCase().includes(quranSearchQuery.toLowerCase())
    );
  }, [quranSearchQuery]);

  // Helper to filter Hisn al-Muslim
  const filteredHisn = useMemo(() => {
    return HISN_AL_MUSLIM.filter(dhikr => {
      const matchesSearch = dhikr.title.includes(hisnSearchQuery) || 
                          dhikr.items.some(item => item.text.includes(hisnSearchQuery));
      const matchesCategory = activeHisnCategory ? dhikr.category === activeHisnCategory : true;
      const matchesTag = activeHisnTag ? dhikr.tags?.includes(activeHisnTag) : true;
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [hisnSearchQuery, activeHisnCategory, activeHisnTag]);

  // Helper to filter and map active Azkar items
  const displayedAzkarItems = useMemo(() => {
    if (activeAzkarCategory === 'favorites') {
      return azkarDataState.flatMap(cat => cat.items.map(item => ({ ...item, categoryId: cat.id }))).filter(item => favoriteAzkarIds.includes(item.id));
    }
    return azkarDataState.find(cat => cat.id === activeAzkarCategory)?.items.map(item => ({ ...item, categoryId: activeAzkarCategory })) || [];
  }, [activeAzkarCategory, azkarDataState, favoriteAzkarIds]);

  return (
    <div className="relative text-[#E6DFD3] font-cairo antialiased min-h-screen flex flex-col justify-between overflow-x-hidden">
      
      {/* Dynamic Animated Background Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentTheme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className={`absolute inset-0 bg-gradient-to-br ${themeStyles}`}
          />
        </AnimatePresence>
        
        {/* Subtle Overlay Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30L15 0h30L30 30zM0 30l30-15v30L0 30zM60 30L30 45v-30l30 15zM30 60l15-30h-30L30 60z' fill='%23D4AF37' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
        
        {/* Floating Light Blobs for extra "Magic" */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/5 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <ShareAyahModal isOpen={isShareAyahModalOpen} onClose={() => setIsShareAyahModalOpen(false)} />

      {/* 1. TOAST COMPONENT */}
      <div 
        id="toast" 
        className={`fixed top-28 right-4 left-4 md:left-auto md:right-8 z-50 max-w-sm bg-gradient-to-r from-[#03251B] to-[#0A4131] border border-[#D4AF37]/50 text-[#FAF6EE] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping"></div>
        <p className="text-xs font-bold leading-relaxed">{toastText}</p>
      </div>

      {/* 2. WELCOME / OWNER BAR FOR SHARABLE LINK */}
      {hasOwner && (
        <div className="bg-gradient-to-r from-[#8C6D1F] via-[#D4AF37] to-[#8C6D1F] text-[#02130F] py-2.5 text-center text-xs font-black tracking-wide shadow-md flex items-center justify-center gap-2">
          <Award className="w-4 h-4 animate-bounce" />
          <span>مرحباً بك في نسخة الذاكرون الخاصة بـ <span className="underline font-bold">{ownerName}</span> - جعلها الله في ميزان حسناته وصدقة جارية مباركة ✨</span>
        </div>
      )}

      {/* 3. APP HEADER */}
      <header className="sticky top-0 z-40 bg-transparent backdrop-blur-md border-b border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Logo icon with glow pulse */}
            <motion.div
              className="az-glow w-14 h-14 rounded-full border-2 border-[#D4AF37] overflow-hidden flex items-center justify-center bg-[#011B12] shrink-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <img
                src="/images/logo.jpg"
                alt="الذاكرون"
                className="w-full h-full object-cover"
                loading="eager"
                width={56}
                height={56}
                fetchPriority="high"
              />
            </motion.div>

            {/* Text block */}
            <div className="overflow-hidden">
              <motion.h1
                className="az-title text-2xl font-extrabold font-amiri leading-none tracking-wide"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              >
                الذَّاكِرُون
              </motion.h1>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-[#011B12]/40 backdrop-blur-sm p-1.5 rounded-full border border-[#D4AF37]/10">
            {[
              { id: 'home', label: t('nav.home'), icon: Home },
              { id: 'quran', label: t('nav.quran'), icon: Book },
              { id: 'hisn', label: t('nav.hisn'), icon: Scroll },
              { id: 'azkar', label: t('nav.azkar'), icon: Wind },
              { id: 'dua', label: t('nav.dua'), icon: MessageCircle },
              { id: 'hadeeth', label: t('nav.hadeeth'), icon: Scroll },
              { id: 'history', label: i18n.language === 'ar' ? 'التاريخ' : 'History', icon: Calendar },
              { id: 'tasbih', label: i18n.language === 'ar' ? 'المسبحة' : 'Tasbih', icon: Hash },
              { id: 'ai', label: i18n.language === 'ar' ? 'التدبر' : 'Reflection', icon: Sparkles },
              { id: 'zakat', label: i18n.language === 'ar' ? 'الزكاة' : 'Zakat', icon: Calculator },
              { id: 'publish', label: i18n.language === 'ar' ? 'النشر' : 'Publish', icon: Share2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-150 flex items-center gap-2 group cursor-pointer ${
                    isActive ? 'text-[#02130F] bg-gradient-to-r from-[#D4AF37] to-[#FFF2B2] shadow-lg shadow-[#D4AF37]/20' : 'text-gray-400 hover:text-[#FAF6EE] hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-transform duration-150 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick status */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#011B12]/40 border border-[#D4AF37]/10 rounded-lg p-1">
              <button 
                onClick={() => { i18n.changeLanguage('ar'); try { localStorage.setItem('azkar-lang', 'ar'); } catch {} }}
                className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${i18n.language === 'ar' ? 'bg-[#D4AF37] text-[#02130F]' : 'text-gray-400 hover:text-[#FAF6EE]'}`}
              >
                AR
              </button>
              <button 
                onClick={() => { i18n.changeLanguage('en'); try { localStorage.setItem('azkar-lang', 'en'); } catch {} }}
                className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${i18n.language === 'en' ? 'bg-[#D4AF37] text-[#02130F]' : 'text-gray-400 hover:text-[#FAF6EE]'}`}
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300">مرحباً، {user.displayName}</span>
                <button 
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all"
              >
                تسجيل الدخول
              </button>
            )}
            {canInstallPwa && (
              <button
                onClick={async () => {
                  if (!deferredInstallPromptRef.current) return;
                  deferredInstallPromptRef.current.prompt();
                  const { outcome } = await deferredInstallPromptRef.current.userChoice;
                  if (outcome === 'accepted') { setCanInstallPwa(false); triggerToast('تم تثبيت التطبيق على شاشتك بنجاح 📲✨'); }
                  deferredInstallPromptRef.current = null;
                }}
                className="flex items-center gap-1.5 text-[10px] bg-[#D4AF37]/10 border border-[#D4AF37]/40 px-2.5 py-1.5 rounded-full text-[#D4AF37] font-bold hover:bg-[#D4AF37]/20 transition-all cursor-pointer animate-pulse"
                title="تثبيت التطبيق على شاشتك"
              >
                <span>📲</span>
                <span>تثبيت التطبيق</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1.5 rounded-full text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>مستقر ونشط الآن للجميع</span>
            </div>
          </div>

          {/* Mobile Menu Icon */}
          <div className="xl:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-3 rounded-xl bg-[#042019] border border-[#D4AF37]/15 text-gray-300 hover:text-[#FAF6EE]"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>
      </header>

      {/* 4. MOBILE NAVIGATION DROPDOWN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="xl:hidden fixed inset-x-0 top-24 z-30 bg-[#02130F]/98 backdrop-blur-xl border-b border-[#D4AF37]/20 p-6 flex flex-col gap-2 shadow-2xl overflow-y-auto max-h-[calc(100vh-6rem)]"
          >
            {[
              { id: 'home', label: t('nav.home'), icon: Home },
              { id: 'quran', label: t('nav.quran'), icon: Book },
              { id: 'hisn', label: t('nav.hisn'), icon: Scroll },
              { id: 'azkar', label: t('nav.azkar'), icon: Wind },
              { id: 'dua', label: t('nav.dua'), icon: MessageCircle },
              { id: 'hadeeth', label: t('nav.hadeeth'), icon: Scroll },
              { id: 'history', label: i18n.language === 'ar' ? 'التاريخ الإسلامي' : 'Islamic History', icon: Calendar },
              { id: 'tasbih', label: i18n.language === 'ar' ? 'المسبحة الإلكترونية' : 'Digital Tasbih', icon: Hash },
              { id: 'ai', label: i18n.language === 'ar' ? 'التدبر والذكر الذكي' : 'Reflection & Smart Dhikr', icon: Sparkles },
              { id: 'zakat', label: i18n.language === 'ar' ? 'حاسبة الزكاة' : 'Zakat Calculator', icon: Calculator },
              { id: 'publish', label: i18n.language === 'ar' ? 'انشر واكسب الأجر' : 'Publish & Gain Reward', icon: Share2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'text-[#02130F] bg-gradient-to-r from-[#D4AF37] to-[#FFF2B2] shadow-lg' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#02130F]' : 'text-[#D4AF37]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            
            {/* Mobile Auth and Status */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-4">
              {user ? (
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                  <span className="text-sm text-gray-300 font-sans">مرحباً، {user.displayName}</span>
                  <button 
                    onClick={logout}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500/10 text-red-400 border border-red-500/20"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <button 
                  onClick={loginWithGoogle}
                  className="w-full py-4 text-sm font-bold rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  تسجيل الدخول
                </button>
              )}
              <div className="flex items-center gap-2.5 text-[10px] bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 rounded-2xl text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>النظام مستقر ونشط الآن للجميع</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ==================== HOME TAB ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-16 animate-fade-in">
            {/* Banner Hero */}
            <div className="relative rounded-3xl overflow-hidden bg-[#04251D]/40 backdrop-blur-md border border-[#D4AF37]/25 p-8 md:p-16 text-center shadow-2xl">
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-amber-300 text-xs font-bold">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span id="loc-status-text">{locStatusText}</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#FAF6EE] leading-snug font-amiri">
                  وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-amber-200 to-[#FAF6EE]">
                    أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا
                  </span>
                </h1>
                
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-2xl mx-auto font-sans">
                  منصتك الإسلامية الشاملة بروح وهوية بصرية جديدة مستلهمة من وقار وأصالة التراث. تصفح الآن المصحف المرتل كاملاً بصوت صفوة القراء، وتابع مواقيت صلواتك فوراً بناءً على إحداثيات موقعك الفعلي، وتفاعل مع مساعدنا الإيماني الذكي.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <button 
                    onClick={() => setActiveTab('quran')} 
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942F] text-[#02130F] font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <BookOpen className="w-5 h-5" />
                    تصفح المصحف المرتل كاملاً
                  </button>
                  <button 
                    onClick={() => setActiveTab('publish')} 
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#042019] border border-[#D4AF37]/30 text-[#D4AF37] font-bold hover:bg-[#D4AF37]/10 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Share2 className="w-5 h-5" />
                    انشر واكسب الأجر كصدقة جارية
                  </button>
                </div>
              </div>

              {/* Prayer Times Subcard */}
              <div className="relative z-10 mt-12 pt-8 border-t border-[#D4AF37]/15">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-sm font-bold text-[#FAF6EE]">مواقيت الصلاة المحسوبة لليوم:</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="bg-[#031D16]/40 backdrop-blur-sm border border-[#D4AF37]/15 rounded-2xl p-4 text-center hover:border-[#D4AF37]/40 transition-colors">
                    <span className="block text-xs text-gray-400 mb-1 font-bold">الفجر</span>
                    <span className="block text-xl font-mono font-black text-[#D4AF37]">{prayerTimes.fajr}</span>
                  </div>
                  <div className="bg-[#031D16]/40 backdrop-blur-sm border border-[#D4AF37]/15 rounded-2xl p-4 text-center hover:border-[#D4AF37]/40 transition-colors">
                    <span className="block text-xs text-gray-400 mb-1 font-bold">الشروق</span>
                    <span className="block text-xl font-mono font-black text-[#D4AF37]">{prayerTimes.sunrise}</span>
                  </div>
                  <div className="bg-[#031D16]/40 backdrop-blur-sm border border-[#D4AF37]/15 rounded-2xl p-4 text-center hover:border-[#D4AF37]/40 transition-colors">
                    <span className="block text-xs text-gray-400 mb-1 font-bold">الظهر</span>
                    <span className="block text-xl font-mono font-black text-[#D4AF37]">{prayerTimes.dhuhr}</span>
                  </div>
                  <div className="bg-[#031D16]/40 backdrop-blur-sm border border-[#D4AF37]/15 rounded-2xl p-4 text-center hover:border-[#D4AF37]/40 transition-colors">
                    <span className="block text-xs text-gray-400 mb-1 font-bold">العصر</span>
                    <span className="block text-xl font-mono font-black text-[#D4AF37]">{prayerTimes.asr}</span>
                  </div>
                  <div className="bg-[#031D16]/40 backdrop-blur-sm border border-[#D4AF37]/15 rounded-2xl p-4 text-center hover:border-[#D4AF37]/40 transition-colors">
                    <span className="block text-xs text-gray-400 mb-1 font-bold">المغرب</span>
                    <span className="block text-xl font-mono font-black text-[#D4AF37]">{prayerTimes.maghrib}</span>
                  </div>
                  <div className="bg-[#031D16]/40 backdrop-blur-sm border border-[#D4AF37]/15 rounded-2xl p-4 text-center hover:border-[#D4AF37]/40 transition-colors">
                    <span className="block text-xs text-gray-400 mb-1 font-bold">العشاء</span>
                    <span className="block text-xl font-mono font-black text-[#D4AF37]">{prayerTimes.isha}</span>
                  </div>
                </div>

                {/* Reminders Toggle Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 p-5 rounded-2xl bg-[#02130F]/40 backdrop-blur-sm border border-[#D4AF37]/25 shadow-lg">
                  <div className="flex items-center gap-3.5 text-right w-full md:w-auto">
                    <div className={`p-3 rounded-xl transition-all ${prayerAlertsEnabled ? 'bg-[#D4AF37]/15 text-[#D4AF37] scale-105' : 'bg-white/5 text-gray-500'}`}>
                      <Bell className={`w-5 h-5 ${prayerAlertsEnabled ? 'animate-bounce' : ''}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#FAF6EE] font-sans flex items-center gap-1.5">
                        مستشار تنبيهات الصلوات 🔔
                        {prayerAlertsEnabled && <span className="text-[10px] bg-[#D4AF37]/10 text-amber-300 px-2 py-0.5 rounded-full border border-[#D4AF37]/20 font-bold">نشط حالياً</span>}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-1 font-sans leading-relaxed">
                        تنبيهات لطيفة قبل الأذان بـ 10 دقائق وعند دخوله لتهيأ نفسك وتدرك الجماعة بصوت كوني مهدئ
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={togglePrayerAlerts}
                    className={`w-full md:w-auto px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-sm ${
                      prayerAlertsEnabled
                        ? 'bg-[#D4AF37] text-[#02130F] border-[#D4AF37] hover:bg-amber-400 font-extrabold'
                        : 'bg-transparent border-white/10 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{prayerAlertsEnabled ? 'تعطيل التنبيهات' : 'تفعيل التنبيهات والآذان 🔔'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Split row: Spiritual tracker & Qibla Compass */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Tracker Card */}
              <div className="lg:col-span-7 bg-[#042019] border border-[#D4AF37]/20 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#FAF6EE] font-amiri flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#D4AF37]" />
                    جدول الالتزام الإيماني والصلوات اليومي
                  </h3>
                  <button 
                    onClick={resetSpiritualTracker} 
                    className="text-xs text-red-400 hover:underline font-bold"
                  >
                    إعادة ضبط اليوم
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 font-sans">
                  تابع صلواتك الخمسة وتدبرك للقرآن الكريم لبناء روتين متزن يقربك دائماً إلى الله. محمي ومحفوظ محلياً بمتصفحك.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-sans">
                  {[
                    { key: 'Fajr', label: '🕌 صلاة الفجر' },
                    { key: 'Dhuhr', label: '🕌 صلاة الظهر' },
                    { key: 'Asr', label: '🕌 صلاة العصر' },
                    { key: 'Maghrib', label: '🕌 صلاة المغرب' },
                    { key: 'Isha', label: '🕌 صلاة العشاء' },
                    { key: 'Quran', label: '📖 ورد القرآن' }
                  ].map((task) => (
                    <button 
                      key={task.key}
                      onClick={() => toggleSpiritualTask(task.key)}
                      className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                        spiritualTasks[task.key] 
                          ? 'bg-[#052F20] border-emerald-500/50 text-emerald-300 shadow-md shadow-[#052F20]/30' 
                          : 'bg-[#02130F] border-[#D4AF37]/15 text-gray-400 hover:text-[#FAF6EE] hover:border-[#D4AF37]/35'
                      }`}
                    >
                      <span className="text-xs font-bold">{task.label}</span>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        spiritualTasks[task.key]
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 font-bold text-xs'
                          : 'border-gray-500'
                      }`}>
                        {spiritualTasks[task.key] ? '✓' : ''}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="bg-[#02130F] border border-[#D4AF37]/10 p-4 rounded-2xl text-center">
                  <span className="text-xs text-gray-400 block mb-2">معدل التزامك لليوم:</span>
                  <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden mb-2">
                    <div 
                      className="bg-gradient-to-r from-[#B5942F] to-[#D4AF37] h-full transition-all duration-500" 
                      style={{ width: `${spiritualProgressPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {completedTasksCount} من أصل 6 أوراد مكتملة ({Math.round(spiritualProgressPercent)}%)
                  </span>
                </div>
              </div>

              {/* Compass Card */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#052920] to-[#01140F] border-2 border-[#D4AF37]/30 rounded-3xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-xl group">
                
                {/* Visual Glow Layer when aligned */}
                {isAligned && (
                  <div className="absolute inset-0 bg-[#052F20]/40 animate-pulse pointer-events-none z-0 border border-emerald-500/35 rounded-3xl animate-pulse"></div>
                )}

                <div className="w-full space-y-1.5 z-10">
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] px-2.5 py-1 rounded-full font-sans font-bold flex items-center gap-1 border ${
                      compassActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 animate-pulse' 
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${compassActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                      {compassActive ? 'بوصلة حية نشطة ●' : 'محاكاة يدوية'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      GPS: {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#FAF6EE] font-amiri flex items-center justify-center gap-2">
                    <Compass className={`w-5 h-5 text-[#D4AF37] ${compassActive ? 'animate-spin-slow' : ''}`} />
                    مستكشف اتجاه القبلة الذكي
                  </h3>
                  <p className="text-[11px] text-gray-400 font-sans max-w-sm mx-auto leading-relaxed">
                    مستكشف حي عالي الاستجابة يتفاعل مع دوران هاتفك أو حركتك اليدوية لتحديد الكعبة المشرفة بدقة هندسية مطلقة.
                  </p>
                </div>

                {/* Main Dial Stage */}
                <div className="relative w-52 h-52 my-6 flex items-center justify-center z-10 select-none">
                  
                  {/* Top Target Beacon Indicator (Always points to front of screen) */}
                  <div className="absolute top-[-8px] flex flex-col items-center z-20">
                    <span className="text-[8px] font-black text-amber-400 tracking-widest bg-[#02130F] px-1.5 py-0.5 rounded border border-[#D4AF37]/35 uppercase">أمامك</span>
                    <div className={`w-3 h-3 rotate-45 border-r border-b mt-[-2px] ${isAligned ? 'bg-emerald-400 border-emerald-400 animate-bounce' : 'bg-amber-400 border-amber-400'}`}></div>
                  </div>

                  {/* Pulsing rings when aligned */}
                  {isAligned && (
                    <>
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
                      <div className="absolute inset-3 rounded-full border-2 border-emerald-400/15 animate-pulse"></div>
                    </>
                  )}

                  {/* Outer Compass Card Ring (Rotates by -currentHeading) */}
                  <div 
                    className="absolute inset-0 rounded-full border-[3px] border-[#D4AF37]/45 flex items-center justify-center bg-gradient-to-b from-[#021914] to-[#010C09] shadow-2xl shadow-black/80"
                    style={{ 
                      transform: `rotate(${-currentHeading}deg)`, 
                      transition: compassActive ? 'none' : 'transform 0.5s cubic-bezier(0.1, 0.8, 0.3, 1)' 
                    }}
                  >
                    {/* Compass divisions ticks */}
                    {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => (
                      <div 
                        key={deg} 
                        className="absolute h-full w-0.5 bg-gradient-to-b from-[#D4AF37]/25 via-transparent to-[#D4AF37]/25"
                        style={{ transform: `rotate(${deg}deg)` }}
                      ></div>
                    ))}

                    {/* Cardinal direction labels */}
                    <span className="absolute top-2.5 text-xs font-black text-red-500 font-sans tracking-tighter">ش (N)</span>
                    <span className="absolute bottom-2.5 text-xs font-bold text-gray-400 font-sans">ج (S)</span>
                    <span className="absolute right-2.5 text-xs font-bold text-gray-400 font-sans">ق (E)</span>
                    <span className="absolute left-2.5 text-xs font-bold text-gray-400 font-sans">غ (W)</span>

                    {/* Beautiful compass sub-card index circle */}
                    <div className="absolute inset-8 rounded-full border border-white/5 bg-[#02130F]/45"></div>

                    {/* Highly responsive dynamic target pointer for Qibla */}
                    {/* Since this is inside the rotating card, we set its static rotation to qiblaAngle */}
                    <div 
                      className="absolute h-full w-4 flex flex-col items-center justify-between pointer-events-none"
                      style={{ transform: `rotate(${qiblaAngle}deg)` }}
                    >
                      {/* Compass Pointer Arrow tip pointed toward Qibla */}
                      <div className="flex flex-col items-center -mt-2.5">
                        {/* Kaaba Miniature Visual Badge */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${isAligned ? 'bg-emerald-500 text-[#02130F] scale-125 ring-4 ring-emerald-400/30' : 'bg-[#D4AF37] text-[#02130F]'}`} title="موقع الكعبة">
                          <span className="text-[13px] leading-none font-bold">🕋</span>
                        </div>
                        <div className={`w-0.5 h-16 ${isAligned ? 'bg-gradient-to-b from-emerald-400 to-transparent animate-pulse' : 'bg-gradient-to-b from-[#D4AF37] to-transparent'} w-1 mt-0.5`}></div>
                      </div>

                      {/* Tail of Pointer */}
                      <div className="w-1.5 h-4 bg-white/10 rounded-full mb-1"></div>
                    </div>

                  </div>

                  {/* Absolute Center Pivot with Gold Finish */}
                  <div className={`w-5 h-5 rounded-full z-10 border-2 shadow-md flex items-center justify-center transition-all ${isAligned ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/20' : 'bg-[#D4AF37] border-[#02130F]'}`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>

                </div>

                {/* Alignment status output panel */}
                <div className="w-full space-y-3 z-10">
                  <div className={`p-3 rounded-2xl border transition-all ${
                    isAligned 
                      ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-200 shadow-md shadow-emerald-500/5' 
                      : 'bg-[#02130F] border-[#D4AF37]/15 text-gray-300'
                  }`}>
                    {isAligned ? (
                      <div className="flex items-center justify-center gap-1.5 font-bold font-sans text-xs">
                        <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                        <span>أنت تواجه القبلة الآن بدقة! 🕋💚</span>
                      </div>
                    ) : (
                      <div className="text-xs font-bold font-sans">
                        {headingDiff > 0 ? (
                          <span className="text-amber-400 flex items-center justify-center gap-1">
                            أدر جهازك يميناً بمقدار <span className="font-mono text-sm underline">{Math.round(headingDiff)}°</span> ➡️
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center justify-center gap-1">
                            أدر جهازك يساراً بمقدار <span className="font-mono text-sm underline">{Math.round(Math.abs(headingDiff))}°</span> ⬅️
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Calibration details */}
                  <div className="grid grid-cols-2 gap-2 text-right">
                    <div className="bg-[#02130F]/60 p-2 rounded-xl border border-white/5">
                      <span className="text-[9px] text-gray-400 block">زاوية القبلة:</span>
                      <span className="text-xs font-mono font-black text-[#D4AF37]">{qiblaAngle}°</span>
                    </div>
                    <div className="bg-[#02130F]/60 p-2 rounded-xl border border-white/5">
                      <span className="text-[9px] text-gray-400 block">الاتجاه الحالي:</span>
                      <span className="text-xs font-mono font-black text-[#FAF6EE]">{currentHeading}°</span>
                    </div>
                  </div>

                  {/* Slider controller if compass is simulated */}
                  {!compassActive && (
                    <div className="bg-[#02130F]/45 p-3 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-sans">
                        <span className="font-mono text-[#D4AF37] font-bold">{simulatedHeading}°</span>
                        <span>اسحب لمحاكاة تدوير هاتفك يدوياً:</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="359"
                        value={simulatedHeading}
                        onChange={(e) => setSimulatedHeading(Number(e.target.value))}
                        className="w-full accent-[#D4AF37] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Activation Trigger */}
                  <div className="pt-1">
                    {compassPermissionState === 'unsupported' ? (
                      <p className="text-[9px] text-gray-500 font-sans">
                        ⚠️ المستشعرات غير متوفرة في جهازك، تم تفعيل وضع المحاكاة اليدوية التفاعلية.
                      </p>
                    ) : compassActive ? (
                      <button
                        onClick={() => {
                          setCompassActive(false);
                          setDeviceHeading(null);
                          if (orientationListenerRef.current) {
                            window.removeEventListener('deviceorientation', orientationListenerRef.current, true);
                          }
                          triggerToast('تم الانتقال إلى وضعية المحاكاة اليدوية ⚙️');
                        }}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>إيقاف البوصلة الحية والرجوع لليدوي</span>
                      </button>
                    ) : (
                      <button
                        onClick={startCompass}
                        className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B5942F] text-[#02130F] rounded-xl text-xs font-black transition-all hover:scale-[1.02] active:scale-95 shadow-md shadow-[#D4AF37]/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Compass className="w-4 h-4 animate-spin-slow" />
                        <span>تفعيل البوصلة الذكية التفاعلية (للهواتف)</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Feature 1: Hijri Calendar & Sunnah Checklist Card */}
            <div className="bg-gradient-to-r from-[#04251D] to-[#02130F] border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#D4AF37]/15 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#FAF6EE] font-amiri">التقويم الهجري والسنن اليومية</h3>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">تتبع التاريخ الهجري الشريف وبناء عادات السنن والنوافل النبوية المباركة</p>
                  </div>
                </div>
                
                {/* Real-time calculated Hijri date */}
                <div className="bg-[#031D16] border border-[#D4AF37]/30 rounded-2xl px-5 py-3 text-center md:text-right w-full md:w-auto">
                  <span className="text-[10px] text-amber-300 font-bold block mb-1 uppercase tracking-wider">تاريخ اليوم الهجري</span>
                  <span className="text-lg font-bold font-amiri text-[#FAF6EE]">
                    {getHijriDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sunnah Fasting Days list */}
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="text-sm font-bold text-[#FAF6EE] font-amiri flex items-center gap-2 border-b border-white/5 pb-2">
                    <Star className="w-4 h-4 text-[#D4AF37]" />
                    مذكر صيام النوافل والمناسبات المباركة 🌙
                  </h4>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">
                    «صوم ثلاثة أيام من كل شهر صوم الدهر كله» - يوصى بصيام الأيام البيض (13، 14، 15 من كل شهر هجري) والإثنين والخميس.
                  </p>
                  
                  <div className="space-y-2.5 font-sans">
                    <div className="p-3.5 rounded-xl bg-[#031D16] border border-[#D4AF37]/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-200 block">الأيام البيض القادمة</span>
                        <span className="text-[10px] text-gray-400">13، 14، 15 من الشهر الهجري الحالي</span>
                      </div>
                      <span className="text-xs font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-lg border border-[#D4AF37]/20">
                        سنَّة مؤكدة
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#031D16] border border-[#D4AF37]/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-200 block">صيام الإثنين والخميس</span>
                        <span className="text-[10px] text-gray-400">تُعرض فيهما الأعمال على الله عز وجل</span>
                      </div>
                      <span className="text-xs font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-lg border border-[#D4AF37]/20">
                        سنَّة أسبوعية
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#031D16] border border-teal-500/20 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#FAF6EE] block">التهيؤ للمناسبات الإسلامية</span>
                        <span className="text-[10px] text-teal-400 font-medium">عام هجري جديد • عاشوراء • رمضان المبارك</span>
                      </div>
                      <span className="text-[10px] font-bold bg-teal-500/15 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/20">
                        متابعة حية
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Sunnah Tracker */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h4 className="text-sm font-bold text-[#FAF6EE] font-amiri flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#D4AF37]" />
                      سجل أوراد السنن والمستحبات اليومية
                    </h4>
                    <button 
                      onClick={resetSunnahChecklist}
                      className="text-xs text-red-400 hover:underline font-bold"
                    >
                      تصفير السنن
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 font-sans">
                    اجعل لنفسك نصيباً يومياً من هدي النبي ﷺ لبناء قصر في الجنة ومضاعفة حسناتك.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                    {[
                      { key: 'rawatib', label: '🕌 السنن الرواتب (12 ركعة)', desc: 'ركعتان قبل الفجر، 4 قبل الظهر و2 بعده، 2 بعد المغرب، 2 بعد العشاء' },
                      { key: 'duha', label: '☀️ صلاة الضحى (ركعتان فأكثر)', desc: 'صلاة الأوابين وتؤدى من بعد الشروق بربع ساعة إلى قبيل الظهر' },
                      { key: 'qiyam', label: '🌌 قيام الليل والوتر', desc: 'أفضل الصلاة بعد الفريضة، ركعة الوتر تختم بها صلاتك بالليل' },
                      { key: 'mulk', label: '📖 قراءة سورة الملك', desc: 'المنجية من عذاب القبر والشافعة لقارئها حتى يغفر له' },
                      { key: 'sadaqah', label: '🤝 تقديم صدقة أو معروف', desc: 'ابتسامة، كلمة طيبة، إغاثة ملهوف، صدقة مالية تبارك رزقك' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => toggleSunnahTask(item.key)}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 cursor-pointer select-none ${
                          sunnahChecklist[item.key]
                            ? 'bg-[#052F20] border-emerald-500/50 text-emerald-300 shadow-md shadow-[#052F20]/30'
                            : 'bg-[#02130F] border-[#D4AF37]/15 text-gray-400 hover:text-[#FAF6EE] hover:border-[#D4AF37]/35'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-extrabold">{item.label}</span>
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            sunnahChecklist[item.key]
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 font-bold text-xs'
                              : 'border-gray-500'
                          }`}>
                            {sunnahChecklist[item.key] ? '✓' : ''}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 leading-relaxed text-right w-full">
                          {item.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Sunnah Progress */}
                  {(() => {
                    const completed = Object.values(sunnahChecklist).filter(Boolean).length;
                    const percent = (completed / 5) * 100;
                    return (
                      <div className="bg-[#02130F] border border-[#D4AF37]/10 p-4 rounded-2xl text-center mt-4">
                        <span className="text-xs text-gray-400 block mb-2">معدل التزامك بالسنن اليوم:</span>
                        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden mb-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-[#D4AF37] h-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-300">
                          {completed} من أصل 5 سنن مكتملة ({Math.round(percent)}%)
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== ISLAMIC HISTORY TAB ==================== */}
        {activeTab === 'history' && (
          <div className="space-y-8 animate-fade-in font-sans">
            <div className="border-b border-[#D4AF37]/15 pb-6 text-right">
              <h2 className="text-3xl font-extrabold text-[#FAF6EE] font-amiri">التاريخ الإسلامي والأرشيف 📜</h2>
              <p className="text-sm text-gray-400 mt-1">تصفّح عبق التاريخ وأبرز الغزوات والفتوحات والمناسبات الدينية الخالدة في تاريخ أمتنا عبر العصور</p>
            </div>

            {/* Feature 4: On this day in Islamic History (حدث في مثل هذا اليوم) */}
            <div className="bg-gradient-to-br from-[#04251D] to-[#02130F] border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl text-right">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#D4AF37]/15 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
                    <History className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#FAF6EE] font-amiri">{t('header.history')}</h3>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">تصفّح عبق التاريخ وأبرز الغزوات والفتوحات والمناسبات الدينية الخالدة في تاريخ أمتنا</p>
                  </div>
                </div>
                
                {/* Current Hijri Date badge */}
                  <div className="bg-[#031D16] border border-[#D4AF37]/30 rounded-2xl px-5 py-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold text-amber-300 font-sans">
                    {t('history.hijri_current')}: {currentHijriDay} {HIJRI_MONTHS[currentHijriMonth - 1]}
                  </span>
                </div>
              </div>

              {/* Today's Featured Event Scroll */}
              {(() => {
                const todayEvents = ISLAMIC_EVENTS.filter(
                  (ev) => ev.day === currentHijriDay && ev.month === currentHijriMonth
                );

                const hasTodayEvents = todayEvents.length > 0;
                // If there's no event exactly matching today, we take a prominent one from this month as featured fallback
                const featuredEvents = hasTodayEvents 
                  ? todayEvents 
                  : ISLAMIC_EVENTS.filter((ev) => ev.month === currentHijriMonth);

                const displayEvent = featuredEvents[0] || ISLAMIC_EVENTS[0]; // Absolute fallback

                return (
                  <div className="relative bg-gradient-to-l from-[#031D16] to-[#02130F] border-2 border-[#D4AF37]/30 rounded-2xl p-6 md:p-8 overflow-hidden shadow-inner">
                    {/* Watermark design details */}
                    <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none select-none text-7xl">
                      📜
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-extrabold px-3 py-1 rounded-full border border-[#D4AF37]/25 font-sans">
                          {displayEvent.category}
                        </span>
                        {hasTodayEvents ? (
                          <span className="bg-emerald-500/15 text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-500/20 font-sans flex items-center gap-1">
                            <span>★</span> حدث في مثل هذا اليوم
                          </span>
                        ) : (
                          <span className="bg-[#D4AF37]/5 text-gray-400 text-xs font-bold px-3 py-1 rounded-full border border-white/5 font-sans">
                            حدث بارز هذا الشهر ({HIJRI_MONTHS[currentHijriMonth - 1]})
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-mono font-bold bg-[#02130F] px-3 py-1.5 rounded-xl border border-white/5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>التاريخ: {displayEvent.day} {HIJRI_MONTHS[displayEvent.month - 1]} {displayEvent.year ? `• ${displayEvent.year}` : ''}</span>
                      </div>
                    </div>

                    <h4 className="text-xl md:text-2xl font-black text-[#FAF6EE] font-amiri leading-relaxed mb-3">
                      {displayEvent.title}
                    </h4>
                    
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed font-sans mb-6 text-justify">
                      {displayEvent.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-gray-500 font-sans">
                        💡 شارك سيرة الأجداد وتاريخ الأمة المبارك مع أهلك وأصحابك لتنشر الأثر والوعي.
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const monthName = HIJRI_MONTHS[displayEvent.month - 1];
                            const shareText = `📜 حدث في مثل هذا اليوم من التاريخ الإسلامي 🌟

🗓️ التاريخ: ${displayEvent.day} ${monthName} ${displayEvent.year ? `(${displayEvent.year})` : ''}
📍 التصنيف: ${displayEvent.category}

✨ الحدث العظيم:
« ${displayEvent.title} »

📖 التفاصيل:
${displayEvent.description}

— تم النشر عبر منصة ذاكرون الرقمية 🕋`;
                            navigator.clipboard.writeText(shareText);
                            triggerToast('تم نسخ تفاصيل الحدث الإسلامي التاريخي بنجاح لمشاركته ونشر الفائدة! 📢✨');
                          }}
                          className="px-4 py-2 bg-[#D4AF37] hover:bg-amber-500 text-[#02130F] rounded-xl text-xs font-black transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/10"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>مشاركة الحدث</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Browse History by Hijri Months */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-3 gap-2">
                  <h4 className="text-lg font-bold text-[#FAF6EE] font-amiri flex items-center gap-2">
                    <span>🗺️</span>
                    استكشف أرشيف الأحداث بحسب الأشهر الهجرية
                  </h4>
                  <span className="text-[10px] text-gray-400 font-sans">
                    اضغط على أي شهر لعرض الأحداث التاريخية المسجلة فيه
                  </span>
                </div>

                {/* Months Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 font-sans">
                  {HIJRI_MONTHS.map((mName, idx) => {
                    const mNumber = idx + 1;
                    const isCurrent = mNumber === currentHijriMonth;
                    const isSelected = mNumber === selectedHijriMonth;

                    return (
                      <button
                        key={mNumber}
                        onClick={() => setSelectedHijriMonth(mNumber)}
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer relative text-xs font-bold ${
                          isSelected
                            ? 'bg-[#052F20] border-[#D4AF37] text-[#FAF6EE] shadow-md shadow-[#052F20]/30'
                            : 'bg-[#02130F] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-emerald-400" title="الشهر الحالي"></span>
                        )}
                        <span className="block">{mName}</span>
                        <span className="text-[9px] text-[#D4AF37]/75 font-mono mt-0.5 block">
                          الشهر {mNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Month Events List */}
                <div className="bg-[#02130F] border border-[#D4AF37]/15 rounded-2xl p-4 md:p-6 space-y-4 max-h-96 overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-gray-300 font-sans">
                      الأحداث المدوّنة في شهر: <span className="text-[#D4AF37]">{HIJRI_MONTHS[selectedHijriMonth - 1]}</span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-sans">
                      تعداد الأحداث: {ISLAMIC_EVENTS.filter(ev => ev.month === selectedHijriMonth).length}
                    </span>
                  </div>

                  <div className="space-y-4 font-sans text-right divide-y divide-white/5">
                    {ISLAMIC_EVENTS.filter(ev => ev.month === selectedHijriMonth).map((ev, eIdx) => {
                      const isTodayEvent = ev.day === currentHijriDay && ev.month === currentHijriMonth;

                      return (
                        <div 
                          key={eIdx} 
                          className={`pt-4 first:pt-0 flex flex-col gap-2 transition-all ${
                            isTodayEvent ? 'bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10' : ''
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-md border border-[#D4AF37]/20">
                                {ev.day} {HIJRI_MONTHS[ev.month - 1]}
                              </span>
                              {ev.year && (
                                <span className="text-xs font-mono font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">
                                  {ev.year}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                                {ev.category}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                const monthName = HIJRI_MONTHS[ev.month - 1];
                                const shareText = `📜 حدث في مثل هذا اليوم من التاريخ الإسلامي 🌟

🗓️ التاريخ: ${ev.day} ${monthName} ${ev.year ? `(${ev.year})` : ''}
📍 التصنيف: ${ev.category}

✨ الحدث العظيم:
« ${ev.title} »

📖 التفاصيل:
${ev.description}

— تم النشر عبر منصة ذاكرون الرقمية 🕋`;
                                navigator.clipboard.writeText(shareText);
                                triggerToast('تم نسخ تفاصيل الحدث الإسلامي التاريخي بنجاح لمشاركته ونشر الفائدة! 📢✨');
                              }}
                              className="text-gray-400 hover:text-[#D4AF37] p-1 transition-all rounded hover:bg-white/5 cursor-pointer flex items-center gap-1 text-[10px]"
                              title="نسخ ومشاركة"
                            >
                              <Copy className="w-3 h-3" />
                              <span>نسخ</span>
                            </button>
                          </div>

                          <h5 className="text-base font-bold text-[#FAF6EE] font-amiri flex items-center gap-1.5">
                            {isTodayEvent && <span className="text-emerald-400 text-xs animate-ping">●</span>}
                            {ev.title}
                          </h5>
                          
                          <p className="text-xs text-gray-400 leading-relaxed text-justify">
                            {ev.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ==================== HADEETH OF THE DAY TAB ==================== */}
        {activeTab === 'hadeeth' && (
          <div className="space-y-8 animate-fade-in font-sans">
            <div className="border-b border-[#D4AF37]/15 pb-6 text-right">
              <h2 className="text-3xl font-extrabold text-[#FAF6EE] font-amiri">الحديث النبوي الشريف 📜</h2>
              <p className="text-sm text-gray-400 mt-1">تأمل هدي المصطفى ﷺ وتعلم سنته العطرة لتضيء دربك وتنشر الخير والمحبة</p>
            </div>

            {/* Feature 5: Hadeeth of the Day (الحديث النبوي الشريف) */}
            <div className="bg-gradient-to-br from-[#04251D] to-[#02130F] border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl text-right">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#D4AF37]/15 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
                    <Quote className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="block text-sm text-[#D4AF37] font-medium mb-1">ٱلذَّاكِرُونَ</span>
                    <h3 className="text-2xl font-extrabold text-[#FAF6EE] font-amiri">الحديث النبوي الشريف (حديث اليوم) 📜</h3>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">تأمل هدي المصطفى ﷺ وتعلم سنته العطرة لتضيء دربك وتنشر الخير والمحبة</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const nextIndex = (currentHadeethIndex + 1) % CURATED_HADEETHS.length;
                      setCurrentHadeethIndex(nextIndex);
                      triggerToast('تم الانتقال للحديث الشريف التالي 🌸✨');
                    }}
                    className="px-4 py-2 bg-[#031D16] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 text-[#D4AF37] rounded-xl text-xs font-black transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                    <span>حديث آخر</span>
                  </button>
                </div>
              </div>

              {/* Hadeeth Content Card */}
              {(() => {
                const currentHadeeth = CURATED_HADEETHS[currentHadeethIndex];
                if (!currentHadeeth) return null;

                return (
                  <div className="relative bg-gradient-to-l from-[#031D16] to-[#02130F] border-2 border-[#D4AF37]/30 rounded-2xl p-6 md:p-8 overflow-hidden shadow-inner">
                    {/* Watermark quote mark */}
                    <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none select-none text-7xl font-serif">
                      ”
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-extrabold px-3 py-1 rounded-full border border-[#D4AF37]/25 font-sans">
                          بوابة: {currentHadeeth.topic}
                        </span>
                        <span className="bg-emerald-500/15 text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-500/20 font-sans flex items-center gap-1">
                          <span>★</span> هدي نبوي مبارك
                        </span>
                      </div>

                      <div className="text-xs text-amber-300 font-sans bg-[#02130F] px-3 py-1.5 rounded-xl border border-white/5">
                        الراوي: <strong className="text-gray-200">{currentHadeeth.narrator}</strong>
                      </div>
                    </div>

                    {/* Hadeeth text with beautiful Amiri font */}
                    <div className="py-4 text-center md:text-right">
                      <p className="text-xl md:text-2xl font-bold text-amber-100 font-amiri leading-relaxed text-center mb-4 select-all">
                        {currentHadeeth.text}
                      </p>
                    </div>

                    {/* Source citation */}
                    <div className="text-left md:text-left mb-6">
                      <span className="inline-block text-xs font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        📜 المخرّج: {currentHadeeth.source}
                      </span>
                    </div>

                    {/* Explanatory benefit section */}
                    <div className="bg-[#02130F] border border-emerald-500/10 rounded-xl p-4 md:p-5 mt-4 space-y-2">
                      <h5 className="text-sm font-bold text-[#D4AF37] font-amiri flex items-center gap-1.5">
                        💡 الفائدة المستخلصة والأثر التربوي:
                      </h5>
                      <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-sans text-justify">
                        {currentHadeeth.benefit}
                      </p>
                    </div>

                    {/* Actions bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-6 border-t border-white/5">
                      <p className="text-xs text-gray-500 font-sans">
                        عن عبد الله بن عمرو رضي الله عنهما أن النبي ﷺ قال: «بلِّغوا عنِّي ولو آية».
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const shareText = `📜 قال رسول الله صلى الله عليه وسلم:
${currentHadeeth.text}

🎙️ الراوي: ${currentHadeeth.narrator}
📖 المصدر: ${currentHadeeth.source}
📍 الموضوع: ${currentHadeeth.topic}

💡 الفائدة:
${currentHadeeth.benefit}

— تم النشر عبر منصة ذاكرون الرقمية 🕋`;
                            navigator.clipboard.writeText(shareText);
                            triggerToast('تم نسخ الحديث الشريف وتفاصيله بنجاح لمشاركته ونشر الفائدة والأجر! 📢✨');
                          }}
                          className="px-4 py-2 bg-[#D4AF37] hover:bg-amber-500 text-[#02130F] rounded-xl text-xs font-black transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/10"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>مشاركة الحديث</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ==================== QURAN TAB ==================== */}
        {activeTab === 'quran' && (
          <div className="space-y-8 animate-fade-in font-sans">
            <div className="border-b border-[#D4AF37]/15 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-[#FAF6EE] font-amiri">{t('header.quran')}</h2>
                <p className="text-sm text-gray-400 mt-1">{t('nav.quran_desc')}</p>
              </div>
              <button
                onClick={() => setIsShareAyahModalOpen(true)}
                className="flex items-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-xl transition-all font-bold text-sm"
              >
                <Share2 className="w-4 h-4" />
                مشاركة آية
              </button>
            </div>

            {/* Main Quran Section Mode Selector Toggle */}
            <div className="flex bg-[#02130F] p-1.5 rounded-2xl border border-[#D4AF37]/20 max-w-md mx-auto mb-6">
              <button
                onClick={() => setQuranMode('read')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  quranMode === 'read'
                    ? 'bg-[#D4AF37] text-[#02130F] shadow-lg font-black'
                    : 'text-gray-400 hover:text-[#FAF6EE]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{t('nav.quran_read')}</span>
              </button>
              <button
                onClick={() => setQuranMode('listen')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  quranMode === 'listen'
                    ? 'bg-[#D4AF37] text-[#02130F] shadow-lg font-black'
                    : 'text-gray-400 hover:text-[#FAF6EE]'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{t('nav.quran_listen')}</span>
              </button>
            </div>

            {/* 1. QURAN READING VIEW */}
            {quranMode === 'read' && (
              <div className="space-y-6 animate-fade-in">
                {/* Search & Navigation Bar */}
                <div className="bg-[#042019] border border-[#D4AF37]/20 p-5 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Select Surah */}
                  <div className="space-y-1 text-right">
                    <label className="block text-[10px] text-gray-400 font-bold">انتقل إلى السورة:</label>
                    <select
                      value={getSurahForPage(quranPage, SURAHS)?.name || 'البقرة'}
                      onChange={(e) => {
                        const sName = e.target.value;
                        const matched = SURAHS.find(s => s.name === sName);
                        if (matched) {
                          const startP = SURAH_START_PAGES[matched.id] || 1;
                          updateQuranPageAndProgress(startP, startP > quranPage ? 'next' : 'prev');
                          triggerToast(`تم الانتقال لـ سورة ${sName} (صفحة ${startP}) 📖`);
                        }
                      }}
                      className="w-full bg-[#02130F] border border-[#D4AF37]/25 rounded-xl px-3 py-2.5 text-xs font-bold text-[#FAF6EE] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      {SURAHS.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.id}. سورة {s.name} ({SURAH_START_PAGES[s.id]} ص)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Juz */}
                  <div className="space-y-1 text-right">
                    <label className="block text-[10px] text-gray-400 font-bold">انتقل إلى الجزء:</label>
                    <select
                      value={getJuzForPage(quranPage)}
                      onChange={(e) => {
                        const jNum = Number(e.target.value);
                        // Map Juz to start pages: Juz 1 -> p.1, Juz 2 -> p.22, Juz 3 -> p.42, etc. (roughly 20 pages per Juz)
                        const startP = jNum === 1 ? 1 : (jNum - 1) * 20 + 2;
                        updateQuranPageAndProgress(startP, startP > quranPage ? 'next' : 'prev');
                        triggerToast(`تم الانتقال إلى الجزء ${jNum} (صفحة ${startP}) 🕊️`);
                      }}
                      className="w-full bg-[#02130F] border border-[#D4AF37]/25 rounded-xl px-3 py-2.5 text-xs font-bold text-[#FAF6EE] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                        <option key={j} value={j}>
                          الجزء {j}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Page Input Field */}
                  <div className="space-y-1 text-right">
                    <label className="block text-[10px] text-gray-400 font-bold">رقم الصفحة (1 - 604):</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="604"
                        value={quranPage}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 1 && val <= 604) {
                            updateQuranPageAndProgress(val, val > quranPage ? 'next' : 'prev');
                          }
                        }}
                        className="w-full bg-[#02130F] border border-[#D4AF37]/25 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#FAF6EE] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  {/* Comfort Mode / Eye-friendly filter controls */}
                  <div className="space-y-1 text-right">
                    <label className="block text-[10px] text-gray-400 font-bold flex items-center justify-end gap-1">
                      <Eye className="w-3 h-3 text-[#D4AF37]" /> مظهر وضع القراءة:
                    </label>
                    <div className="flex bg-[#02130F] p-1 rounded-xl border border-white/5 gap-1">
                      {[
                        { key: 'normal', name: 'افتراضي' },
                        { key: 'sepia', name: 'عتيق' },
                        { key: 'eyecomfort', name: 'دافيء' },
                        { key: 'dark', name: 'ليلي' }
                      ].map((mode) => (
                        <button
                          key={mode.key}
                          onClick={() => {
                            setQuranColorFilter(mode.key as any);
                            triggerToast(`تم تفعيل المظهر الـ${mode.name} للقرآن 🎨`);
                          }}
                          className={`flex-1 py-1 px-1 rounded-lg text-[9px] font-bold transition-all text-center cursor-pointer ${
                            quranColorFilter === mode.key
                              ? 'bg-[#D4AF37] text-[#02130F]'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {mode.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Interactive Stage with Page Turning */}
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                  {/* Left Column: Bookmark List & Controls */}
                  <div className="lg:w-64 bg-[#042019] border border-[#D4AF37]/15 rounded-3xl p-5 space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold text-[#D4AF37] border-b border-white/5 pb-2 flex items-center justify-end gap-2 text-right">
                        <BookMarked className="w-4 h-4" /> علاماتك المرجعية المحفوظة
                      </h4>
                      {savedBookmarks.length === 0 ? (
                        <p className="text-[11px] text-gray-400 leading-relaxed text-right">
                          لا توجد علامات مرجعية محفوظة بعد. اضغط على أيقونة حفظ العلامة أسفل المصحف لحفظ صفحتك الحالية والعودة إليها لاحقاً بضغطة زر.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-48 lg:max-h-64 overflow-y-auto pr-1">
                          {savedBookmarks.map((pageNo) => {
                            const matchingSurah = getSurahForPage(pageNo, SURAHS);
                            return (
                              <button
                                key={pageNo}
                                onClick={() => {
                                  updateQuranPageAndProgress(pageNo, pageNo > quranPage ? 'next' : 'prev');
                                  triggerToast(`تم الانتقال للعلامة: صفحة ${pageNo} 📌`);
                                }}
                                className={`p-2 bg-[#02130F] hover:bg-[#052F20] hover:border-[#D4AF37] border rounded-xl text-right transition-all flex items-center justify-between text-[11px] group cursor-pointer ${
                                  quranPage === pageNo ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-white/5 text-gray-300'
                                }`}
                              >
                                <span className="text-amber-400/70 group-hover:text-amber-400">📌</span>
                                <div className="text-right truncate">
                                  <span className="font-bold font-mono">ص {pageNo}</span>
                                  <span className="text-[9px] text-gray-400 block truncate font-amiri">سورة {matchingSurah?.name || 'القرآن'}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#02130F] p-3.5 rounded-2xl border border-[#D4AF37]/10 text-center space-y-2">
                      <span className="text-[10px] text-gray-400 block">هل تريد تفسير هذه الصفحة؟</span>
                      <button
                        onClick={() => triggerPageContemplation(quranPage)}
                        className="w-full py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer animate-pulse"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>اطلب تدبر وتفسير الصفحة</span>
                      </button>
                    </div>
                  </div>

                  {/* Center Column: The Beautiful Styled Book Stage */}
                  <div className="flex-1 bg-[#02130F] border border-[#D4AF37]/20 rounded-3xl p-4 md:p-8 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl min-h-[550px] md:min-h-[700px]">
                    
                    {/* Top Ribbon Meta */}
                    <div className="w-full flex justify-between items-center text-xs font-bold border-b border-white/5 pb-3 mb-4">
                      <div className="flex items-center gap-2 text-[#D4AF37]">
                        <span className="text-[10px] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
                          الجزء {getJuzForPage(quranPage)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-200 font-amiri flex items-center gap-1.5">
                        ✨ سورة {getSurahForPage(quranPage, SURAHS)?.name || 'القرآن الكريم'}
                      </h3>
                      <div className="text-gray-400 font-mono">
                        صفحة <span className="text-[#D4AF37] font-sans text-sm font-black">{quranPage}</span> / 604
                      </div>
                    </div>

                    {/* Book / Page Stage container */}
                    <div
                      className="flex-1 w-full max-w-lg mx-auto flex items-center justify-center py-2 relative"
                      style={{ touchAction: 'pan-y' }}
                      onTouchStart={(e) => {
                        quranTouchStartX.current = e.touches[0].clientX;
                        quranTouchStartY.current = e.touches[0].clientY;
                      }}
                      onTouchEnd={(e) => {
                        if (quranTouchStartX.current === null || quranTouchStartY.current === null) return;
                        const dx = e.changedTouches[0].clientX - quranTouchStartX.current;
                        const dy = e.changedTouches[0].clientY - quranTouchStartY.current;
                        quranTouchStartX.current = null;
                        quranTouchStartY.current = null;
                        // Only horizontal swipes with enough distance (ignore vertical scrolls)
                        if (Math.abs(dx) < 45 || Math.abs(dy) > Math.abs(dx) * 0.85) return;
                        // In RTL Quran: swipe LEFT = next page, swipe RIGHT = prev page
                        if (dx < 0 && quranPage < 604) updateQuranPageAndProgress(quranPage + 1, 'next');
                        else if (dx > 0 && quranPage > 1) updateQuranPageAndProgress(quranPage - 1, 'prev');
                      }}
                    >
                      
                      {/* Interactive Slider overlays for mobile swipe helper lines */}
                      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none rounded-l-2xl z-10"></div>
                      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none rounded-r-2xl z-10"></div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={quranPage}
                          initial={{ 
                            opacity: 0, 
                            rotateY: pageDirection === 'next' ? -80 : 80,
                            x: pageDirection === 'next' ? -100 : 100,
                            scale: 0.95 
                          }}
                          animate={{ 
                            opacity: 1, 
                            rotateY: 0,
                            x: 0,
                            scale: 1 
                          }}
                          exit={{ 
                            opacity: 0, 
                            rotateY: pageDirection === 'next' ? 80 : -80,
                            x: pageDirection === 'next' ? 100 : -100,
                            scale: 0.95 
                          }}
                          transition={{ duration: 0.45, ease: "easeInOut" }}
                          style={{ perspective: 1500, transformStyle: "preserve-3d" }}
                          className="w-full h-full flex justify-center items-center relative"
                        >
                          {/* Outer Islamic Double Golden Border Frame */}
                          <div className={`p-1.5 md:p-3 rounded-2xl border-4 border-double border-[#D4AF37]/45 shadow-inner transition-all duration-300 relative ${
                            quranColorFilter === 'sepia' 
                              ? 'bg-[#F4ECD8] border-[#a07a1b]/40' 
                              : quranColorFilter === 'eyecomfort'
                              ? 'bg-[#FCF5E3] border-[#b08828]/40'
                              : quranColorFilter === 'dark'
                              ? 'bg-[#121212] border-zinc-800'
                              : 'bg-white'
                          }`}
                          style={{ transform: `scale(${quranZoom})` }}
                          >
                            {/* Inner Thin Border */}
                            <div className={`border border-[#D4AF37]/25 p-1 rounded-xl h-full flex items-center justify-center relative ${
                              quranColorFilter === 'dark' ? 'border-zinc-800' : ''
                            }`}>
                              
                              {/* Page Image */}
                              <img
                                src={`https://quran.ksu.edu.sa/png_big/${quranPage}.png`}
                                alt={`صفحة القرآن الكريم رقم ${quranPage}`}
                                referrerPolicy="no-referrer"
                                loading="eager"
                                className={`max-h-[420px] md:max-h-[580px] w-auto object-contain transition-all duration-300 rounded-lg select-none ${
                                  quranColorFilter === 'sepia'
                                    ? 'sepia brightness-90 contrast-110 saturate-[80%]'
                                    : quranColorFilter === 'eyecomfort'
                                    ? 'brightness-95 contrast-105 saturate-[60%] hue-rotate-15'
                                    : quranColorFilter === 'dark'
                                    ? 'invert hue-rotate-180 brightness-90 contrast-115 text-zinc-300'
                                    : ''
                                }`}
                              />

                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>

                    </div>

                    {/* Bottom Action bar */}
                    <div className="w-full flex flex-col items-center gap-4 border-t border-white/5 pt-4 mt-4">
                      {/* Page Scroller Slider */}
                      <div className="w-full flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 font-sans whitespace-nowrap">الفاتحة (1)</span>
                        <input
                          type="range"
                          min="1"
                          max="604"
                          value={quranPage}
                          onChange={(e) => {
                            const nextP = Number(e.target.value);
                            updateQuranPageAndProgress(nextP, nextP > quranPage ? 'next' : 'prev');
                          }}
                          className="w-full accent-[#D4AF37] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                        />
                        <span className="text-[10px] text-gray-400 font-sans whitespace-nowrap font-amiri">الناس (604)</span>
                      </div>

                      {/* Main Flip Controls & Actions */}
                      <div className="w-full flex flex-wrap items-center justify-between gap-3 font-sans">
                        
                        {/* Right/Next Button in RTL */}
                        <button
                          disabled={quranPage >= 604}
                          onClick={() => {
                            if (quranPage < 604) updateQuranPageAndProgress(quranPage + 1, 'next');
                          }}
                          className={`flex items-center gap-2 px-5 py-3 bg-[#042019] border border-[#D4AF37]/25 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#02130F] rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            quranPage >= 604 ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'
                          }`}
                        >
                          <ChevronRight className="w-4 h-4" />
                          <span>الصفحة التالية</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {/* Zoom Level button */}
                          <button
                            onClick={() => {
                              const nextZoom = quranZoom === 1 ? 1.15 : quranZoom === 1.15 ? 1.3 : 1;
                              setQuranZoom(nextZoom);
                              triggerToast(`تم ضبط تكبير الصفحة إلى: x${nextZoom}`);
                            }}
                            className="p-3 bg-[#042019] text-[#D4AF37] border border-white/5 hover:border-[#D4AF37]/45 rounded-xl transition-all cursor-pointer hover:scale-105"
                            title="تكبير الصفحة"
                          >
                            {quranZoom === 1 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
                          </button>

                          {/* Bookmark Page button */}
                          <button
                            onClick={() => toggleBookmark(quranPage)}
                            className={`p-3 border rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 ${
                              savedBookmarks.includes(quranPage)
                                ? 'bg-amber-500 text-[#02130F] border-amber-500 font-bold'
                                : 'bg-[#042019] text-[#D4AF37] border-white/5 hover:border-[#D4AF37]/45'
                            }`}
                            title="حفظ العلامة المرجعية"
                          >
                            <Bookmark className={`w-4 h-4 ${savedBookmarks.includes(quranPage) ? 'fill-current' : ''}`} />
                            <span className="text-[10px] hidden sm:inline">علامة</span>
                          </button>

                          {/* Save Progress to reading log */}
                          <button
                            onClick={() => {
                              const match = getSurahForPage(quranPage, SURAHS);
                              saveQuranProgress(match?.name || 'البقرة', 1, quranPage);
                            }}
                            className="px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            حفظ كموضعي الحالي
                          </button>
                        </div>

                        {/* Left/Prev Button in RTL */}
                        <button
                          disabled={quranPage <= 1}
                          onClick={() => {
                            if (quranPage > 1) updateQuranPageAndProgress(quranPage - 1, 'prev');
                          }}
                          className={`flex items-center gap-2 px-5 py-3 bg-[#042019] border border-[#D4AF37]/25 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#02130F] rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            quranPage <= 1 ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'
                          }`}
                        >
                          <span>الصفحة السابقة</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                      </div>

                      {/* Hotkey notice */}
                      <span className="text-[10px] text-gray-500 font-sans select-none hidden md:block">
                        💡 تلميح: يمكنك استخدام أزرار الأسهم يميناً ويساراً (⬅️ ➡️) على لوحة المفاتيح لتقليب صفحات المصحف الشريف بسلاسة تامة.
                      </span>

                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* 2. AUDIO RECITER & SURAH LISTING VIEW */}
            {quranMode === 'listen' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex p-1 bg-[#02130F] rounded-2xl border border-[#D4AF37]/20 relative overflow-hidden max-w-sm mx-auto mb-8">
                  <button 
                    onClick={() => setListenSubTab('surahs')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 flex items-center justify-center gap-2 ${listenSubTab === 'surahs' ? 'text-[#02130F]' : 'text-gray-400 hover:text-gray-200'}`}>
                    {listenSubTab === 'surahs' && (
                      <motion.div 
                        layoutId="activeSubTab"
                        className="absolute inset-0 bg-[#D4AF37] rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <BookOpen className="w-4 h-4" />
                    {t('quran.listen.surahs')}
                  </button>
                  <button 
                    onClick={() => setListenSubTab('history')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 flex items-center justify-center gap-2 ${listenSubTab === 'history' ? 'text-[#02130F]' : 'text-gray-400 hover:text-gray-200'}`}>
                    {listenSubTab === 'history' && (
                      <motion.div 
                        layoutId="activeSubTab"
                        className="absolute inset-0 bg-[#D4AF37] rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <History className="w-4 h-4" />
                    {t('quran.listen.history')}
                  </button>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-[#042019] to-[#02130F] border border-[#D4AF37]/20 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(212,175,55,0.05)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <span className="text-sm font-bold text-gray-300 font-sans">{t('quran.listen.reciter_prompt')}</span>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto bg-[#02130F] p-2 rounded-2xl border border-white/5">
                    <span className="text-xs font-semibold text-[#D4AF37] whitespace-nowrap pr-2">{t('quran.listen.current_reciter')}</span>
                    <select 
                      value={selectedReciter.id} 
                      onChange={(e) => changeReciter(e.target.value)}
                      className="bg-transparent text-[#FAF6EE] text-sm font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer appearance-none"
                    >
                      {recitersList.map((r) => (
                        <option key={r.id} value={r.id} className="bg-[#02130F]">
                          {i18n.language === 'ar' ? r.name : (r.nameEn || r.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>

                {/* Search Input */}
                <div className="relative max-w-md">
                  <input 
                    type="text" 
                    value={quranSearchQuery}
                    onChange={(e) => setQuranSearchQuery(e.target.value)}
                    placeholder={t('quran.listen.search_placeholder')} 
                    className="w-full bg-[#042019]/80 backdrop-blur-sm border border-[#D4AF37]/20 rounded-xl py-3.5 pl-4 pr-11 text-xs text-[#FAF6EE] focus:outline-none focus:border-[#D4AF37] placeholder-gray-500 transition-all focus:ring-1 focus:ring-[#D4AF37]/30 shadow-inner"
                  />
                  <Search className="absolute right-4 top-4 w-4 h-4 text-gray-400" />
                  {quranSearchQuery && (
                    <button 
                      onClick={() => setQuranSearchQuery('')} 
                      className="absolute left-3 top-4 text-xs text-red-400 font-bold hover:underline"
                    >
                      {t('quran.listen.clear')}
                    </button>
                  )}
                </div>

                {/* Surah List Grid */}
                <motion.div 
                  layout
                  className={`${listenSubTab === 'surahs' ? 'grid' : 'hidden'} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}
                >
                  <AnimatePresence mode="popLayout">
                    {filteredSurahs.map((surah) => {
                      const isCurrentPlaying = currentPlayingSurah?.id === surah.id;
                      return (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={isCurrentPlaying ? {} : { scale: 1.02, y: -2 }}
                          key={surah.id}
                          onClick={() => {
                            playSurah(surah);
                          }}
                          className={`p-5 rounded-3xl border transition-all flex flex-col justify-between group relative overflow-hidden ${
                            isCurrentPlaying 
                              ? 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 xl:col-span-2 bg-[#052F20] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/30' 
                              : 'bg-[#042019] border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#062c23] cursor-pointer'
                          }`}
                        >
                          {/* Ornamental Background Pattern */}
                          <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none" 
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)', backgroundSize: '16px 16px' }}
                          ></div>
                          
                          {isCurrentPlaying && (
                            <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />
                          )}

                          {/* Top part: Surah Info */}
                          <div className={`flex items-center justify-between w-full ${isCurrentPlaying ? 'pb-3 border-b border-[#D4AF37]/15 mb-3' : ''}`}>
                            <div className="flex items-center gap-3 relative z-10">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm transition-all border border-[#D4AF37]/10 ${
                                isCurrentPlaying ? 'bg-[#D4AF37] text-[#02130F] shadow-lg shadow-[#D4AF37]/20 border-transparent' : 'bg-[#02130F] text-amber-200/80 group-hover:bg-[#D4AF37] group-hover:text-[#02130F]'
                              }`}>
                                {surah.id}
                              </div>
                              <div>
                                <h4 className={`text-base font-bold font-amiri ${isCurrentPlaying ? 'text-[#FAF6EE]' : 'text-gray-200'}`}>
                                  {t('quran.listen.surah_prefix')} {surah.name}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {surah.englishName} • {surah.verses} {t('quran.listen.ayahs')}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                surah.type === 'مكية' ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' : 'bg-teal-400/10 text-teal-300 border border-teal-400/20'
                              }`}>
                                {surah.type === 'مكية' ? t('quran.listen.type_meccan') : t('quran.listen.type_medinan')}
                              </span>
                              <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={() => playSurah(surah)}
                                className={`p-2 rounded-full transition-all cursor-pointer ${
                                  isCurrentPlaying 
                                    ? 'bg-[#D4AF37] text-[#02130F] shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                                    : 'bg-[#02130F] text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#02130F] border border-[#D4AF37]/20 group-hover:border-transparent shadow-[0_0_10px_rgba(0,0,0,0.2)]'
                                }`}>
                                {isCurrentPlaying && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              </motion.button>
                            </div>
                          </div>

                          {/* Bottom part: Embedded Player Controls (under each Surah) */}
                          {isCurrentPlaying && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="w-full space-y-4 pt-1 relative z-10 font-sans text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Reciter display inside card */}
                              <div className="flex justify-between items-center text-[10px] text-amber-200/75 bg-[#02130F]/40 p-2 rounded-lg border border-[#D4AF37]/10">
                                <span>{i18n.language === 'ar' ? 'القارئ الحالي:' : 'Current Reciter:'}</span>
                                <span className="font-bold text-white">
                                  {i18n.language === 'ar' ? selectedReciter.name : (selectedReciter.nameEn || selectedReciter.name)}
                                </span>
                              </div>

                              {/* Progress Slider */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                                  <span>{formatTime(currentTime)}</span>
                                  <span>{formatTime(duration)}</span>
                                </div>
                                <div 
                                  className="h-2.5 bg-white/10 rounded-full w-full overflow-hidden cursor-pointer relative hover:h-3 transition-all touch-none" 
                                  onClick={seekAudio}
                                  onTouchEnd={seekAudio}
                                >
                                  <div 
                                    className="h-full bg-gradient-to-r from-amber-500 to-[#D4AF37] rounded-full" 
                                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Action Buttons, Volume, Speed */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
                                {/* Left: Skip controls */}
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => skipTime(-10)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-300 hover:bg-white/5 transition-all cursor-pointer active:scale-90"
                                    title={i18n.language === 'ar' ? 'رجوع 10 ثوانٍ' : 'Rewind 10s'}
                                  >
                                    <SkipBack className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={togglePlay}
                                    className="p-2 rounded-full bg-[#D4AF37] text-[#02130F] hover:bg-amber-500 transition-all cursor-pointer active:scale-95 animate-pulse-slow"
                                  >
                                    {isAudioLoading ? (
                                      <div className="w-3.5 h-3.5 border-2 border-[#02130F]/30 border-t-[#02130F] rounded-full animate-spin" />
                                    ) : isPlaying ? (
                                      <Pause className="w-3.5 h-3.5 fill-[#02130F]" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 fill-[#02130F] ml-0.5" />
                                    )}
                                  </button>
                                  <button 
                                    onClick={() => skipTime(10)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-300 hover:bg-white/5 transition-all cursor-pointer active:scale-90"
                                    title={i18n.language === 'ar' ? 'تقديم 10 ثوانٍ' : 'Forward 10s'}
                                  >
                                    <SkipForward className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Center: Playback Speed */}
                                <div className="flex items-center gap-1 bg-[#011B12]/80 px-2 py-1 rounded-lg border border-[#D4AF37]/10 text-[9px]">
                                  <span className="text-gray-400">{i18n.language === 'ar' ? 'السرعة' : 'Speed'}</span>
                                  <select 
                                    value={playbackRate}
                                    onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                                    className="bg-transparent text-[#D4AF37] font-bold focus:outline-none cursor-pointer"
                                  >
                                    <option value="0.75" className="bg-[#02130F]">0.75x</option>
                                    <option value="1.0" className="bg-[#02130F]">1.0x</option>
                                    <option value="1.25" className="bg-[#02130F]">1.25x</option>
                                    <option value="1.5" className="bg-[#02130F]">1.5x</option>
                                    <option value="2.0" className="bg-[#02130F]">2.0x</option>
                                  </select>
                                </div>

                                {/* Right: Volume bar */}
                                <div className="flex items-center gap-1.5">
                                  <button 
                                    onClick={() => setIsMuted(!isMuted)} 
                                    className="text-gray-400 hover:text-[#FAF6EE] cursor-pointer p-1 rounded-md hover:bg-white/5 transition-colors"
                                  >
                                    {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                                  </button>
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05" 
                                    value={volume}
                                    onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                                    className="w-12 accent-[#D4AF37] bg-white/10 h-1 rounded-full cursor-pointer hover:accent-amber-400 transition-all" 
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>

                {listenSubTab === 'history' && (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 max-w-3xl mx-auto"
                  >
                    <AnimatePresence mode="popLayout">
                      {listeningHistory.length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-16 bg-[#042019]/50 border border-[#D4AF37]/10 rounded-3xl"
                        >
                          <div className="w-16 h-16 bg-[#02130F] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/20">
                            <Headphones className="w-8 h-8 text-[#D4AF37]/50" />
                          </div>
                          <p className="text-gray-400 text-sm font-sans">{t('quran.listen.history_empty')}</p>
                        </motion.div>
                      ) : (
                        listeningHistory.map((item, index) => {
                          const surah = SURAHS.find(s => s.id === item.surahId);
                          return (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              key={item.id} 
                              className="bg-gradient-to-r from-[#042019] to-[#02130F] border border-[#D4AF37]/15 p-5 rounded-2xl flex items-center justify-between group hover:border-[#D4AF37]/40 transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] relative overflow-hidden"
                            >
                              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)', backgroundSize: '16px 16px' }}
                              ></div>
                              <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-[#02130F] rounded-full flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 group-hover:scale-110 transition-transform">
                                  <History className="w-5 h-5 opacity-80" />
                                </div>
                                <div>
                                  <div className="text-base font-bold text-[#FAF6EE] font-amiri tracking-wide">{t('quran.listen.surah_prefix')} {surah?.name}</div>
                                  <div className="text-[11px] font-sans text-gray-400 flex items-center gap-2 mt-1">
                                    <Clock className="w-3 h-3 opacity-50" />
                                    {item.lastListenedAt ? new Date(item.lastListenedAt.toDate()).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                  </div>
                                </div>
                              </div>
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (surah) {
                                    playSurah(surah, item.lastPosition || 0);
                                  }
                                }}
                                className="bg-[#D4AF37] text-[#02130F] px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 transition-all relative z-10 flex items-center gap-2"
                              >
                                <Play className="w-3.5 h-3.5" />
                                {t('quran.listen.continue')}
                              </motion.button>
                            </motion.div>
                          )
                        })
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
                
                {filteredSurahs.length === 0 && listenSubTab === 'surahs' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 text-gray-500 font-bold"
                  >
                    لا توجد سور مطابقة لبحثك الحالي. جرب كتابة اسم سورة آخر.
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Feature 2: Quran Reading & Memorization Progress Tracker */}
            <div className="bg-gradient-to-br from-[#042019] to-[#01140F] border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 space-y-8 mt-12 shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#D4AF37]/15 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37]">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#FAF6EE] font-amiri">لوحة متابعة تلاوة وحفظ القرآن الكريم</h3>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">سجل تقدّمك اليومي في قراءة وحفظ آيات الله وتلقى الهدايات الروحية</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
                {/* 1. Reading Ward Logger */}
                <div className="bg-[#02130F] border border-[#D4AF37]/10 p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2 font-amiri">
                    📖 ورد التلاوة الحالي
                  </h4>
                  <p className="text-xs text-gray-400">
                    أين وصلت في قراءتك للذكر الحكيم؟ حدّث موضعك لتعود إليه وتثابر على الختمة بانتظام.
                  </p>

                  <div className="space-y-3 text-xs text-gray-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block mb-1 text-gray-400 font-bold">اسم السورة</label>
                        <select
                          value={quranReadingSurah}
                          onChange={(e) => setQuranReadingSurah(e.target.value)}
                          className="w-full bg-[#042019] border border-[#D4AF37]/20 rounded-xl px-3 py-2.5 text-[#FAF6EE] text-xs font-bold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                        >
                          {SURAHS.map((s) => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1 text-gray-400 font-bold">رقم الآية</label>
                        <input
                          type="number"
                          min="1"
                          max="286"
                          value={quranReadingAyah}
                          onChange={(e) => setQuranReadingAyah(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-[#042019] border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-[#FAF6EE] text-xs font-bold focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-gray-400 font-bold">رقم الصفحة</label>
                        <input
                          type="number"
                          min="1"
                          max="604"
                          value={quranReadingPage}
                          onChange={(e) => setQuranReadingPage(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-[#042019] border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-[#FAF6EE] text-xs font-bold focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => saveQuranProgress(quranReadingSurah, quranReadingAyah, quranReadingPage)}
                      className="w-full py-3 bg-[#D4AF37] hover:bg-amber-500 text-[#02130F] rounded-xl font-bold transition-all text-center cursor-pointer shadow-md"
                    >
                      حفظ التقدم وموضعي الحالي
                    </button>
                  </div>

                  {/* Saved Status Indicator */}
                  <div className="bg-[#031C16] border border-teal-500/10 p-3.5 rounded-xl flex items-center justify-between mt-4">
                    <span className="text-[10px] text-teal-400 font-bold uppercase">الورد المحفوظ حالياً:</span>
                    <span className="text-xs font-bold text-[#FAF6EE]">
                      سورة {localStorage.getItem('quranReadingSurah') || 'البقرة'} • الآية {localStorage.getItem('quranReadingAyah') || '1'} • الصفحة {localStorage.getItem('quranReadingPage') || '1'}
                    </span>
                  </div>
                </div>

                {/* 2. Memorization Tracker */}
                <div className="bg-[#02130F] border border-[#D4AF37]/10 p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2 font-amiri">
                    🌟 تقدّم حفظ السور والآيات
                  </h4>
                  <p className="text-xs text-gray-400">
                    تابع عدد السور التي منَّ الله عليك بحفظها واستمر لبلوغ الختم والتاج المبارك.
                  </p>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between items-center mb-1 text-gray-300">
                        <span>عدد السور المحفوظة:</span>
                        <span className="text-sm font-bold text-[#D4AF37] font-mono">{quranMemorizedCount} من أصل 114 سورة</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="114"
                          value={quranMemorizedCount}
                          onChange={(e) => setQuranMemorizedCount(Number(e.target.value))}
                          className="w-full accent-[#D4AF37] cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="114"
                          value={quranMemorizedCount}
                          onChange={(e) => setQuranMemorizedCount(Math.max(0, Math.min(114, Number(e.target.value))))}
                          className="w-16 bg-[#042019] border border-[#D4AF37]/20 rounded-xl px-2 py-1.5 text-center text-[#FAF6EE] text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => saveQuranMemorization(quranMemorizedCount)}
                      className="w-full py-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl font-bold transition-all border border-[#D4AF37]/25 text-center cursor-pointer"
                    >
                      حفظ تقدّم الحفظ الشريف
                    </button>

                    {/* Badge and Motivation */}
                    <div className="p-3.5 rounded-xl bg-[#031C16] border border-[#D4AF37]/15 flex items-center gap-3 mt-2">
                      <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-2xl">
                        {quranMemorizedCount >= 81 ? '👑' : quranMemorizedCount >= 31 ? '🎖️' : quranMemorizedCount >= 6 ? '📜' : '🌱'}
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">الوسام الروحي واللقب الحالي</span>
                        <span className="text-xs font-bold text-[#FAF6EE] block">
                          {quranMemorizedCount >= 114 
                            ? 'تاج الوقار (ختام الحفظ المبارك)' 
                            : quranMemorizedCount >= 81 
                            ? 'الحافظ المجتهد لكتاب الله' 
                            : quranMemorizedCount >= 31 
                            ? 'حامل أجزاء الهداية والهدى' 
                            : quranMemorizedCount >= 6 
                            ? 'القارئ المثابر في روض النور' 
                            : quranMemorizedCount >= 1 
                            ? 'مبتدئ النور في درجات الحفظ' 
                            : 'بذر الهمة لحفظ كتاب الرحمن'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== DAILY DUA TAB ==================== */}
        {activeTab === 'dua' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-[#D4AF37]/15 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-[#FAF6EE] font-amiri">الأدعية النبوية والابتهالات المأثورة</h2>
                <p className="text-sm text-gray-400 mt-1">حصن نفسك بأدعية مأثورة صحيحة من السنة النبوية، يتم تحديثها تلقائياً كل يوم</p>
              </div>
              <div className="bg-[#042019] border border-[#D4AF37]/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                <span className="text-xs font-bold text-[#D4AF37] font-sans">تحديث يومي تلقائي</span>
              </div>
            </div>

            {/* Main Featured Du'a Card */}
            {(() => {
              const activeDua = SUNNAH_DUAS[selectedDuaIndex];
              const todayIndex = (new Date().getDate() - 1) % SUNNAH_DUAS.length;
              const isToday = selectedDuaIndex === todayIndex;

              return (
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#04251D] to-[#01140F] border border-[#D4AF37]/30 rounded-3xl p-6 md:p-10 space-y-8 shadow-2xl relative overflow-hidden">
                  {/* Decorative background lights */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl -z-10"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full filter blur-3xl -z-10"></div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/15 pb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🤲</span>
                      <div>
                        <h3 className="text-lg font-bold text-[#FAF6EE] font-amiri">
                          {isToday ? 'دعاء اليوم المبارك' : `دعاء اليوم ${selectedDuaIndex + 1} من الشهر`}
                        </h3>
                        <p className="text-xs text-gray-400 font-sans">مأثور ومروي بالأسانيد الصحيحة</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isToday && (
                        <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold text-[10px] rounded-full uppercase tracking-wider animate-bounce">
                          دعاء اليوم الحالي
                        </span>
                      )}
                      <span className="px-3 py-1 bg-[#D4AF37]/15 border border-[#D4AF37]/25 text-[#D4AF37] font-mono text-xs font-bold rounded-full">
                        يوم {selectedDuaIndex + 1} / 31
                      </span>
                    </div>
                  </div>

                  {/* Prayer Text Display */}
                  <div className="bg-[#02130F] border-r-4 border-[#D4AF37] p-6 md:p-8 rounded-2xl relative shadow-inner">
                    <span className="absolute top-3 right-4 text-6xl text-white/5 font-serif select-none pointer-events-none">«</span>
                    <p className="text-2xl md:text-3xl font-black font-amiri text-center text-amber-100/95 leading-relaxed py-4 md:px-6">
                      {activeDua.text}
                    </p>
                    <span className="absolute bottom-3 left-4 text-6xl text-white/5 font-serif select-none pointer-events-none">»</span>
                  </div>

                  {/* Supplemental Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-right">
                    <div className="bg-[#031C16] border border-[#D4AF37]/10 p-5 rounded-2xl space-y-2">
                      <span className="text-xs text-[#D4AF37] font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
                        📜 لطائف الشرح والبيان:
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {activeDua.explanation}
                      </p>
                    </div>

                    <div className="bg-[#031C16] border border-[#D4AF37]/10 p-5 rounded-2xl space-y-2">
                      <span className="text-xs text-[#D4AF37] font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
                        🌟 الفائدة والفضل الروحي:
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {activeDua.benefit}
                      </p>
                    </div>
                  </div>

                  {/* Narration Reference */}
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-[#02130F] border border-white/5 p-4 rounded-xl text-xs gap-3">
                    <span className="text-gray-400 font-sans">
                      📖 رواه وأخرجه: <strong className="text-[#FAF6EE] font-sans">{activeDua.reference}</strong>
                    </span>
                    <span className="text-[10px] text-teal-400 font-bold font-sans uppercase">
                      مأثور وموثق من كتب السنة النبوية المطهرة
                    </span>
                  </div>

                  {/* Action controls */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 pt-2">
                    <button
                      onClick={() => copyDuaToClipboard(activeDua)}
                      className="px-6 py-3.5 bg-[#D4AF37] hover:bg-amber-500 text-[#02130F] rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 hover:scale-[1.02]"
                    >
                      <Copy className="w-4 h-4" />
                      <span>نسخ الدعاء كاملاً ونشره للغير</span>
                    </button>

                    <button
                      onClick={() => triggerDuaContemplation(activeDua.text, activeDua.explanation)}
                      className="px-6 py-3.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/35 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 animate-pulse"
                    >
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>اطلب تفسيراً وشرحاً ذكياً عميقاً</span>
                    </button>

                    {!isToday && (
                      <button
                        onClick={() => {
                          setSelectedDuaIndex(todayIndex);
                          triggerToast('تم الرجوع إلى دعاء اليوم الحالي تلقائياً 🤲🍃');
                        }}
                        className="px-5 py-3.5 bg-[#031C16] border border-teal-500/20 text-teal-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        العودة لدعاء اليوم
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Calendar Repository of Duas */}
            <div className="bg-gradient-to-br from-[#042019] to-[#01140F] border border-[#D4AF37]/15 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="border-b border-[#D4AF37]/15 pb-4">
                <h3 className="text-xl font-bold text-[#FAF6EE] font-amiri">مستودع الأدعية والابتهالات لشهر كامل</h3>
                <p className="text-xs text-gray-400 mt-1 font-sans">تصفح وتزود بالهدى النبوي طوال أيام الشهر (31 يوماً). انقر على أي يوم لقراءة الدعاء الخاص به وحفظه ونشره.</p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3.5 font-sans text-center">
                {SUNNAH_DUAS.map((dua, index) => {
                  const todayIndex = (new Date().getDate() - 1) % SUNNAH_DUAS.length;
                  const isToday = index === todayIndex;
                  const isSelected = index === selectedDuaIndex;

                  return (
                    <button
                      key={dua.id}
                      onClick={() => {
                        setSelectedDuaIndex(index);
                        if (navigator.vibrate) navigator.vibrate(20);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-between gap-1 cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#052F20] border-[#D4AF37] text-[#D4AF37] shadow-lg scale-[1.05]'
                          : isToday
                          ? 'bg-[#031C16] border-teal-500 text-teal-300 shadow-md animate-pulse'
                          : 'bg-[#02130F] border-white/5 text-gray-400 hover:text-[#FAF6EE] hover:border-[#D4AF37]/35'
                      }`}
                    >
                      <span className="text-xs font-black block">يوم {index + 1}</span>
                      <span className="text-[18px] block">🤲</span>
                      {isToday && (
                        <span className="text-[8px] bg-teal-500/20 text-teal-400 font-bold px-1.5 py-0.5 rounded-full border border-teal-500/20 block uppercase tracking-wider">
                          اليوم
                        </span>
                      )}
                      {!isToday && isSelected && (
                        <span className="text-[8px] bg-[#D4AF37]/10 text-[#D4AF37] font-bold px-1.5 py-0.5 rounded-full border border-[#D4AF37]/20 block">
                          معروض
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== AZKAR TAB ==================== */}
        {activeTab === 'hisn' && (
          <div className="space-y-8 animate-fade-in font-sans">
            {/* Header & Search */}
            <div className="bg-gradient-to-br from-[#03251B] to-[#02130F] border border-[#D4AF37]/20 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[100px] rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-right flex-1">
                  <h2 className="text-4xl font-black text-[#FAF6EE] font-amiri tracking-tight">{t('header.hisn')}</h2>
                  <p className="text-base text-gray-400 mt-2 max-w-xl">
                    المكتبة الشاملة للأذكار والأدعية النبوية الموثقة، مبوبة ومنظمة لتسهل عليك الوصول للذكر المناسب في كل وقت وحال.
                  </p>
                </div>
                <div className="w-full md:w-96">
                  <div className="relative group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="ابحث عن ذكر، دعاء، أو مناسبة..." 
                      className="w-full bg-[#02130F]/60 border border-white/5 rounded-2xl py-4 pr-12 pl-4 text-sm text-[#FAF6EE] placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-sans"
                      value={hisnSearchQuery}
                      onChange={(e) => setHisnSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Categories & Results */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar: Filters */}
              <div className="lg:col-span-1 space-y-6">
                {/* Category Filter */}
                <div className="bg-[#02130F]/40 border border-[#D4AF37]/10 rounded-3xl p-6">
                  <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    التصنيفات
                  </h3>
                  <div className="space-y-1.5">
                    <button 
                      onClick={() => setActiveHisnCategory(null)}
                      className={`w-full text-right px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        activeHisnCategory === null ? 'bg-[#D4AF37] text-[#02130F]' : 'text-gray-400 hover:text-[#FAF6EE] hover:bg-white/5'
                      }`}
                    >
                      الكل
                    </button>
                    {Array.from(new Set(HISN_AL_MUSLIM.map(h => h.category))).map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setActiveHisnCategory(cat)}
                        className={`w-full text-right px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                          activeHisnCategory === cat ? 'bg-[#D4AF37] text-[#02130F]' : 'text-gray-400 hover:text-[#FAF6EE] hover:bg-white/5'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Filter (Time-based) */}
                <div className="bg-[#02130F]/40 border border-[#D4AF37]/10 rounded-3xl p-6">
                  <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    الأوقات المستحبة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['الصباح', 'المساء', 'قبل النوم', 'دبر الصلاة'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setActiveHisnTag(activeHisnTag === tag ? null : tag)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                          activeHisnTag === tag 
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' 
                            : 'bg-white/5 border-transparent text-gray-400 hover:border-white/10'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-6">
                  <h4 className="text-xs font-bold text-indigo-300 mb-2">💡 نصيحة للذاكرين</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                    أفضل الذكر ما واطأ فيه القلب اللسان، وكان عن تدبر وخشوع. استشعر معاني الكلمات أثناء تكرارها.
                  </p>
                </div>
              </div>

              {/* Main Content: Dhikr Grid */}
              <div className="lg:col-span-3 space-y-6">
                {/* Breadcrumbs */}
                {(activeHisnCategory || activeHisnTag) && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-[#02130F]/40 px-4 py-2 rounded-xl border border-white/5 w-fit"
                  >
                    <button 
                      onClick={() => { setActiveHisnCategory(null); setActiveHisnTag(null); }}
                      className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                    >
                      حصن المسلم
                    </button>
                    {activeHisnCategory && (
                      <>
                        <ChevronLeft className="w-3 h-3 text-gray-700" />
                        <button 
                          onClick={() => setActiveHisnTag(null)}
                          className={`hover:text-[#D4AF37] transition-colors cursor-pointer ${!activeHisnTag ? 'text-[#D4AF37]' : ''}`}
                        >
                          {activeHisnCategory}
                        </button>
                      </>
                    )}
                    {activeHisnTag && (
                      <>
                        <ChevronLeft className="w-3 h-3 text-gray-700" />
                        <span className="text-[#D4AF37]">{activeHisnTag}</span>
                      </>
                    )}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredHisn.map((dhikr) => (
                    <div 
                      key={dhikr.id}
                      onClick={() => setSelectedHisnDhikr(dhikr)}
                      className="group bg-[#031D16] border border-white/5 p-6 rounded-[2rem] hover:border-[#D4AF37]/30 hover:bg-[#04251D] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 left-0 w-16 h-16 bg-[#D4AF37]/5 blur-3xl -ml-8 -mt-8 group-hover:bg-[#D4AF37]/10 transition-colors"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/5 px-2 py-0.5 rounded-md border border-[#D4AF37]/10">
                              {dhikr.category}
                            </span>
                            {dhikr.tags?.map(tag => (
                              <span key={tag} className="text-[9px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="p-2 bg-white/5 rounded-lg text-gray-500 group-hover:text-[#D4AF37] transition-colors">
                            <Scroll className="w-4 h-4" />
                          </div>
                        </div>
                        <h4 className="text-xl font-black text-[#FAF6EE] font-amiri leading-tight mb-2 group-hover:translate-x-[-4px] transition-transform">{dhikr.title}</h4>
                        <p className="text-[10px] text-gray-500 font-sans line-clamp-1">{dhikr.items[0].text}</p>
                      </div>

                      <div className="relative z-10 mt-6 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold">{dhikr.items.length} {dhikr.items.length > 1 ? 'أذكار' : 'ذكر'}</span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <span>عرض التفاصيل</span>
                          <ChevronLeft className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredHisn.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600 mb-6 border border-white/5">
                      <Search className="w-8 h-8" />
                    </div>
                    <h5 className="text-lg font-bold text-gray-400">عذراً، لم نجد ما تبحث عنه</h5>
                    <p className="text-sm text-gray-600 mt-2 font-sans">حاول استخدام كلمات مفتاحية أخرى أو تصفح الأقسام.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dhikr Detail Modal */}
            <AnimatePresence>
              {selectedHisnDhikr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedHisnDhikr(null)}
                    className="absolute inset-0 bg-[#02130F]/90 backdrop-blur-md"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-3xl max-h-[85vh] bg-[#031D16] border border-[#D4AF37]/30 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                  >
                    {/* Modal Header */}
                    <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#031D16] z-10">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest block mb-1">{selectedHisnDhikr.category}</span>
                        <h3 className="text-2xl font-black text-[#FAF6EE] font-amiri">{selectedHisnDhikr.title}</h3>
                      </div>
                      <button 
                        onClick={() => setSelectedHisnDhikr(null)}
                        className="p-3 bg-white/5 rounded-2xl text-gray-400 hover:text-[#FAF6EE] hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                      {selectedHisnDhikr.items.map((item, idx) => (
                        <div key={idx} className="bg-[#02130F]/60 border border-white/5 p-8 rounded-3xl relative group">
                          <div className="absolute top-4 left-4 flex gap-2">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(item.text);
                                triggerToast('تم نسخ الذكر بنجاح ✨');
                              }}
                              className="p-2.5 bg-white/5 rounded-xl text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all opacity-0 group-hover:opacity-100"
                              title="نسخ الذكر"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-2xl text-[#FAF6EE] font-amiri leading-loose text-center mb-8">
                            {item.text}
                          </p>
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1.5 rounded-full border border-[#D4AF37]/20 font-black">
                                تكرار: {item.count} {item.count > 10 ? 'مرة' : 'مرات'}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-sans italic text-center sm:text-right">
                              {item.reference}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 sm:p-8 border-t border-white/5 bg-[#02130F]/40 flex items-center justify-between">
                      <p className="text-[10px] text-gray-500 font-sans">
                        المصدر: حصن المسلم من أذكار الكتاب والسنة - د. سعيد بن علي بن وهف القحطاني
                      </p>
                      <button 
                        onClick={() => {
                          const text = selectedHisnDhikr.items.map(i => i.text).join('\n\n');
                          navigator.share({ title: selectedHisnDhikr.title, text }).catch(() => {
                            navigator.clipboard.writeText(text);
                            triggerToast('تم نسخ جميع الأذكار للمشاركة ✨');
                          });
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-[#02130F] text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20"
                      >
                        <Share2 className="w-4 h-4" />
                        مشاركة الكل
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'azkar' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-[#D4AF37]/15 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-[#FAF6EE] font-amiri">{t('header.azkar')}</h2>
                <p className="text-sm text-gray-400 mt-1 font-sans">أذكار اليوم والليلة كاملة بالتشكيل والفضل، مع عداد فائق السرعة والاستجابة لمرافقة الذكر.</p>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto items-end">
                {/* Mode Switcher */}
                <div className="flex bg-[#02130F]/60 p-1 rounded-2xl border border-[#D4AF37]/15 font-sans">
                  <button 
                    onClick={() => setAzkarMode('text')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      azkarMode === 'text' ? 'bg-[#D4AF37] text-[#02130F] shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    الأذكار المكتوبة
                  </button>
                  <button 
                    onClick={() => setAzkarMode('audio')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      azkarMode === 'audio' ? 'bg-[#D4AF37] text-[#02130F] shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    الأذكار الصوتية
                  </button>
                </div>

                {azkarMode === 'text' && (
                  <button 
                    onClick={resetCurrentCategoryAzkar} 
                    className="px-4 py-2 text-[10px] font-bold bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-all flex items-center gap-2 cursor-pointer font-sans"
                  >
                    <RotateCcw className="w-3 h-3" />
                    تصفير أذكار القسم الحالي
                  </button>
                )}
              </div>
            </div>

            {/* Daily Dhikr Analytics Dashboard */}
            <div className="bg-[#031d16]/80 backdrop-blur-md rounded-3xl border border-[#D4AF37]/25 p-5 md:p-6 shadow-xl transition-all relative overflow-hidden">
              {/* Background elegant pattern */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

              <div className="flex justify-between items-center border-b border-[#D4AF37]/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#FAF6EE] font-sans">
                      {i18n.language === 'ar' ? 'لوحة إحصائيات الذاكرين' : 'Dhikr Statistics Dashboard'}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-sans">
                      {i18n.language === 'ar' ? 'تتبع وردك اليومي وبناء سلسلة الاستمرار بالذكر الحكيم' : 'Track your daily wird and build a streak of consistent remembrance'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${dhikrStats.badgeColor} font-sans flex items-center gap-1.5`}>
                    <Award className="w-3.5 h-3.5" />
                    {i18n.language === 'ar' ? dhikrStats.levelTitle : dhikrStats.levelTitleEn}
                  </span>

                  <button 
                    onClick={() => setShowDhikrDashboard(!showDhikrDashboard)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title={showDhikrDashboard ? (i18n.language === 'ar' ? 'طي' : 'Collapse') : (i18n.language === 'ar' ? 'توسيع' : 'Expand')}
                  >
                    {showDhikrDashboard ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {showDhikrDashboard && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
                  {/* Chart section */}
                  <div className="lg:col-span-7 bg-[#02130F]/40 p-4 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[250px] lg:min-h-[280px]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-gray-300 font-sans flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {i18n.language === 'ar' ? 'معدل الذكر لأخر 7 أيام' : 'Remembrance rate for the last 7 days'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {i18n.language === 'ar' ? 'تحديث تلقائي' : 'Auto synced'}
                      </span>
                    </div>

                    <div className="w-full h-44 md:h-52 font-mono text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={dhikrStats.chartData}
                          margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.05)" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#888" 
                            fontSize={10}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#888" 
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#02130F',
                              borderColor: 'rgba(212, 175, 55, 0.3)',
                              borderRadius: '12px',
                              color: '#FAF6EE',
                              fontSize: '11px',
                              fontFamily: 'sans-serif'
                            }}
                            labelStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#D4AF37" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill="url(#colorCount)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Stats Cards & Motivation section */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    {/* BENTO STATS GRID */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Stat 1: Today's Count */}
                      <div className="bg-[#02130F]/40 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-[#D4AF37]/20 transition-all group">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-gray-400 font-sans">{i18n.language === 'ar' ? 'أذكار اليوم' : "Today's Dhikr"}</span>
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">📿</span>
                        </div>
                        <div className="mt-2.5">
                          <span className="text-2xl font-black text-[#FAF6EE] font-mono">{dhikrStats.todayCount.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 block font-sans mt-0.5">
                            {i18n.language === 'ar' ? 'تسبيحة / ذكر' : 'chants'}
                          </span>
                        </div>
                      </div>

                      {/* Stat 2: Streak */}
                      <div className="bg-[#02130F]/40 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-orange-500/20 transition-all group">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-gray-400 font-sans">{i18n.language === 'ar' ? 'سلسلة الذكر' : 'Remembrance Streak'}</span>
                          <Flame className={`w-4 h-4 ${dhikrStats.streak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-500'}`} />
                        </div>
                        <div className="mt-2.5">
                          <span className="text-2xl font-black text-[#FAF6EE] font-mono">{dhikrStats.streak.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 block font-sans mt-0.5">
                            {i18n.language === 'ar' ? 'أيام متتالية 🔥' : 'consecutive days 🔥'}
                          </span>
                        </div>
                      </div>

                      {/* Stat 3: Daily Average */}
                      <div className="bg-[#02130F]/40 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-blue-500/20 transition-all group">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-gray-400 font-sans">{i18n.language === 'ar' ? 'المعدل اليومي' : 'Daily Average'}</span>
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="mt-2.5">
                          <span className="text-2xl font-black text-[#FAF6EE] font-mono">{dhikrStats.dailyAverage.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 block font-sans mt-0.5">
                            {i18n.language === 'ar' ? 'ذكر يومياً' : 'chants/day'}
                          </span>
                        </div>
                      </div>

                      {/* Stat 4: Grand Total */}
                      <div className="bg-[#02130F]/40 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-yellow-500/20 transition-all group">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-gray-400 font-sans">{i18n.language === 'ar' ? 'الإجمالي العام' : 'Grand Total'}</span>
                          <Award className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="mt-2.5">
                          <span className="text-2xl font-black text-[#FAF6EE] font-mono">{dhikrStats.grandTotal.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 block font-sans mt-0.5">
                            {i18n.language === 'ar' ? 'تسبيحة وذكر 🌟' : 'total chants 🌟'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress to Next Level Goal */}
                    <div className="bg-[#02130F]/40 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between text-[11px] mb-1.5 font-sans">
                        <span className="text-gray-400">
                          {i18n.language === 'ar' ? 'الهدف القادم' : 'Next Goal'}: <strong className="text-white">{dhikrStats.nextGoal}</strong>
                        </span>
                        <span className="text-[#D4AF37] font-bold">
                          {Math.min(100, Math.round((dhikrStats.todayCount / dhikrStats.nextGoal) * 100))}%
                        </span>
                      </div>

                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#D4AF37]" 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (dhikrStats.todayCount / dhikrStats.nextGoal) * 100)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>

                      <p className="text-[10px] text-gray-400 mt-2 font-sans leading-relaxed">
                        {i18n.language === 'ar' ? (
                          <>
                            {dhikrStats.todayCount >= dhikrStats.nextGoal ? (
                              <span>🎉 تهانينا! لقد تجاوزت هدفك اليومي وتألقت روحانياً، استمر في الارتقاء بمقامك المبارك.</span>
                            ) : (
                              <span>يتبقّى لك <strong className="text-white">{dhikrStats.nextGoal - dhikrStats.todayCount}</strong> تسبيحة للوصول للمستوى التالي <strong>({dhikrStats.levelTitle})</strong>.</span>
                            )}
                          </>
                        ) : (
                          <>
                            {dhikrStats.todayCount >= dhikrStats.nextGoal ? (
                              <span>🎉 Congratulations! You reached your goal for today. Keep building your daily habit.</span>
                            ) : (
                              <span>Only <strong className="text-white">{dhikrStats.nextGoal - dhikrStats.todayCount}</strong> more to reach the next milestone.</span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Dhikr Widget for Intermediate Times */}
            <div className="bg-[#031d16]/60 backdrop-blur-md rounded-3xl border border-[#D4AF37]/20 p-5 md:p-6 shadow-xl space-y-5 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#D4AF37]/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#FAF6EE] font-sans flex items-center gap-2">
                    <span className="text-[#D4AF37]">✨</span>
                    {i18n.language === 'ar' ? 'أذكاري الخاصة للأوقات البينية' : 'My Custom Dhikr for Spare Moments'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-sans">
                    {i18n.language === 'ar' 
                      ? 'أضف أذكاراً مخصصة تلازمك في أوقاتك الفائضة، لتعمر لسانك بذكر الله بنقرة واحدة سريعة.' 
                      : 'Add personalized dhikrs for spare moments to keep your tongue busy in the remembrance of Allah.'}
                  </p>
                </div>

                {customDhikrList.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm(i18n.language === 'ar' ? 'هل تريد تصفير جميع العدادات المخصصة؟' : 'Are you sure you want to reset all custom counters?')) {
                        const updated = customDhikrList.map(item => ({ ...item, count: 0 }));
                        setCustomDhikrList(updated);
                        localStorage.setItem('custom_dhikr_list', JSON.stringify(updated));
                        triggerToast(i18n.language === 'ar' ? 'تم تصفير جميع عداداتك الخاصة 🔄' : 'All custom counters reset');

                      }
                    }}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 font-sans cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {i18n.language === 'ar' ? 'تصفير كافة العدادات' : 'Reset All Counters'}
                  </button>
                )}
              </div>

              {/* Add Custom Dhikr Form & Presets */}
              <div className="space-y-4 font-sans">
                {/* Input row */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-grow relative">
                    <input
                      type="text"
                      value={newCustomDhikrText}
                      onChange={(e) => setNewCustomDhikrText(e.target.value)}
                      placeholder={i18n.language === 'ar' ? 'اكتب ذكراً أو دعاءً مخصصاً هنا...' : 'Write custom dhikr or prayer here...'}
                      maxLength={100}
                      className="w-full bg-[#02130F]/70 border border-[#D4AF37]/25 rounded-2xl py-3 px-4 text-xs text-[#FAF6EE] focus:outline-none focus:border-[#D4AF37] placeholder-gray-500 transition-all focus:ring-1 focus:ring-[#D4AF37]/30"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addCustomDhikr(newCustomDhikrText);
                        }
                      }}
                    />
                    {newCustomDhikrText && (
                      <button
                        onClick={() => setNewCustomDhikrText('')}
                        className="absolute left-3 top-3.5 text-[10px] text-gray-500 hover:text-white"
                      >
                        {i18n.language === 'ar' ? 'مسح' : 'Clear'}
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => addCustomDhikr(newCustomDhikrText)}
                    disabled={!newCustomDhikrText.trim()}
                    className={`px-6 py-3 rounded-2xl text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      newCustomDhikrText.trim()
                        ? 'bg-[#D4AF37] text-[#02130F] hover:bg-amber-500 font-extrabold shadow-lg shadow-[#D4AF37]/15 active:scale-95'
                        : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{i18n.language === 'ar' ? 'إضافة ذكر' : 'Add Dhikr'}</span>
                  </button>
                </div>

                {/* Quick suggestions pills */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-400 font-bold block">
                    {i18n.language === 'ar' ? '💡 إضافة سريعة بنقرة واحدة:' : '💡 1-Click Fast Presets:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'الحمد لله حمداً كثيراً',
                      'سبحان الله وبحمده',
                      'لا حول ولا قوة إلا بالله',
                      'أستغفر الله العظيم',
                      'لا إله إلا الله',
                      'اللهم صلِّ على محمد'
                    ].map((presetText) => {
                      // Check if already exists in the list to avoid double addition
                      const alreadyInList = customDhikrList.some(item => item.text === presetText);
                      return (
                        <button
                          key={presetText}
                          disabled={alreadyInList}
                          onClick={() => addCustomDhikr(presetText)}
                          className={`px-3 py-1.5 rounded-full text-[10px] border transition-all duration-300 font-sans cursor-pointer ${
                            alreadyInList
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/50 cursor-not-allowed'
                              : 'bg-[#02130F]/45 border-[#D4AF37]/15 text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 hover:bg-[#042019]'
                          }`}
                          title={alreadyInList ? (i18n.language === 'ar' ? 'مضاف بالفعل' : 'Already added') : ''}
                        >
                          {presetText}
                          {!alreadyInList && <span className="mr-1 text-emerald-400 font-bold">+</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Custom Dhikrs List Grid */}
              <div className="mt-5">
                {customDhikrList.length === 0 ? (
                  <div className="text-center py-8 bg-[#02130F]/20 rounded-2xl border border-white/5">
                    <p className="text-xs text-gray-500 font-sans">
                      {i18n.language === 'ar' ? 'لم تقم بإضافة أي أذكار مخصصة بعد. استخدم الحقل أعلاه لبناء وردك الخاص.' : 'No custom dhikrs added yet. Use the input above to build your own.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customDhikrList.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#02130F]/45 border border-white/5 hover:border-[#D4AF37]/35 rounded-2xl p-4 flex items-center justify-between gap-3 group/card transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Decorative background flare */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/2 rounded-full blur-xl pointer-events-none group-hover/card:bg-[#D4AF37]/5 transition-colors"></div>

                        {/* Dhikr text and quick reset/delete controls */}
                        <div className="flex-grow flex flex-col justify-between h-full min-w-0">
                          <h4 className="text-xs font-bold text-[#FAF6EE] font-amiri leading-relaxed truncate-2-lines pr-1" title={item.text}>
                            {item.text}
                          </h4>
                          
                          <div className="flex items-center gap-3 mt-3 opacity-60 group-hover/card:opacity-100 transition-opacity">
                            {/* Reset Specific Zikr */}
                            <button
                              onClick={() => resetCustomDhikr(item.id)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-amber-400 transition-all cursor-pointer"
                              title={i18n.language === 'ar' ? 'تصفير عداد الذكر' : 'Reset counter'}
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                            {/* Delete Zikr */}
                            <button
                              onClick={() => deleteCustomDhikr(item.id)}
                              className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-gray-500 hover:text-red-400 transition-all cursor-pointer"
                              title={i18n.language === 'ar' ? 'حذف الذكر' : 'Delete'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Large, beautiful increment tapping button */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => incrementCustomDhikr(item.id)}
                            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#042019] to-[#01140F] border border-[#D4AF37]/30 hover:border-[#D4AF37] flex flex-col items-center justify-center shadow-lg transition-all text-[#FAF6EE] cursor-pointer group/btn"
                          >
                            <span className="text-xs font-black font-mono leading-none group-hover/btn:text-[#D4AF37] transition-colors">{item.count}</span>
                            <span className="text-[7px] text-[#D4AF37]/70 font-sans mt-0.5 group-hover/btn:scale-110 transition-all">
                              {i18n.language === 'ar' ? 'كرّر' : 'Tap'}
                            </span>
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {azkarMode === 'text' ? (
              <>
                {/* Category Selector Tabs */}
            <div className="flex flex-wrap gap-3 pb-4 font-sans overflow-x-auto no-scrollbar">
              {azkarDataState.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveAzkarCategory(cat.id)}
                  className={`px-6 py-3.5 rounded-2xl text-xs font-bold border transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-2 group ${
                    activeAzkarCategory === cat.id 
                      ? 'bg-[#D4AF37] text-[#02130F] border-[#D4AF37] font-black shadow-xl shadow-[#D4AF37]/30 scale-[1.02]' 
                      : 'bg-[#042019] border-white/5 text-gray-400 hover:text-white hover:bg-[#052a21] hover:border-white/10 hover:translate-y-[-2px]'
                  }`}
                >
                  <span className="group-hover:scale-125 transition-transform">{cat.name.split(' ')[0]}</span>
                  <span>{cat.name.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
              <button
                onClick={() => setActiveAzkarCategory('favorites')}
                className={`px-6 py-3.5 rounded-2xl text-xs font-bold border transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-2 group ${
                  activeAzkarCategory === 'favorites'
                    ? 'bg-yellow-400 text-[#02130F] border-yellow-400 font-black shadow-xl shadow-yellow-400/30 scale-[1.02]'
                    : 'bg-[#042019] border-white/5 text-yellow-500/80 hover:text-yellow-400 hover:bg-[#052a21] hover:border-white/10 hover:translate-y-[-2px]'
                }`}
              >
                <Star className={`w-4 h-4 transition-transform duration-300 ${activeAzkarCategory === 'favorites' ? 'fill-[#02130F] scale-110' : 'fill-none group-hover:scale-125'}`} />
                <span>المفضلة ({favoriteAzkarIds.length})</span>
              </button>
            </div>

            {/* Selected Category Azkar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                if (activeAzkarCategory === 'favorites' && displayedAzkarItems.length === 0) {
                  return (
                    <div className="col-span-full bg-[#042019] border border-[#D4AF37]/20 rounded-3xl p-8 md:p-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-[#D4AF37]/10 text-yellow-400 rounded-full flex items-center justify-center mx-auto">
                        <Star className="w-8 h-8 fill-current" />
                      </div>
                      <h3 className="text-xl font-bold text-[#FAF6EE] font-amiri">لا توجد أذكار مفضلة مضافة حالياً</h3>
                      <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                        أضف أذكارك المفضلة للوصول السريع إليها! انقر على رمز النجمة ⭐ الموجود في الزاوية العلوية لأي بطاقة ذكر لحفظها في هذا القسم المخصص.
                      </p>
                    </div>
                  );
                }

                return displayedAzkarItems.map((item) => {
                  const isCompleted = item.count === 0;
                  const isFav = favoriteAzkarIds.includes(item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => decrementZikrCount(item.categoryId, item.id)}
                      className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 select-none relative overflow-hidden group ${
                        isCompleted 
                          ? 'bg-[#052F20] border-emerald-500/40 text-emerald-100 opacity-75' 
                          : 'bg-[#042019] border-white/5 hover:border-[#D4AF37]/30 hover:bg-[#052a21]'
                      }`}
                    >
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-yellow-400 transition-all z-10"
                        title={isFav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-400' : ''}`} />
                      </button>

                      {/* Background Progress watermark */}
                      {!isCompleted && (
                        <div className="absolute left-4 bottom-4 text-7xl font-mono font-black text-white/2 pointer-events-none">
                          {item.count}
                        </div>
                      )}

                      <div className="space-y-3">
                        <p className="text-lg md:text-xl font-bold text-right font-amiri leading-loose pl-10">
                          {item.text}
                        </p>
                        {item.reward && (
                          <p className="text-xs text-gray-400 text-right leading-relaxed font-sans border-t border-white/5 pt-2 italic">
                            💡 {item.reward}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5 font-sans">
                        <span className="text-xs text-teal-400 font-bold">انقر فوق البطاقة للتكرار</span>
                        <div className={`px-5 py-2.5 rounded-2xl font-mono text-base font-extrabold flex items-center gap-2 ${
                          isCompleted 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                            : 'bg-[#02130F] text-[#D4AF37] border border-[#D4AF37]/15 group-hover:border-[#D4AF37]'
                        }`}>
                          <span>المتبقي:</span>
                          <span className="text-xl font-black">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
              </>
            ) : (
              <div className="space-y-8 animate-fade-in font-sans">
                {/* Audio Adhkar Player Controls (Persistent at top when playing) */}
                {currentAudioAdhkar && (
                  <div className="bg-gradient-to-r from-[#03251B] to-[#02130F] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="w-20 h-20 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-3xl shadow-inner relative group">
                           <div className="absolute inset-0 flex items-center justify-center animate-pulse opacity-20">
                             <Sparkles className="w-10 h-10 text-[#D4AF37]" />
                           </div>
                           <span>🎧</span>
                        </div>
                        <div className="text-right">
                          <h4 className="text-xl font-black text-[#FAF6EE] font-amiri">{currentAudioAdhkar.title}</h4>
                          <p className="text-xs text-[#D4AF37] font-bold mt-1">بصوت: {currentAudioAdhkar.reader}</p>
                          <div className="flex items-center gap-3 mt-2">
                             <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 text-gray-400">
                               {currentAudioAdhkar.duration} دقيقة
                             </span>
                             {isAudioLoop && (
                               <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20 flex items-center gap-1 font-bold">
                                 <RotateCcw className="w-2.5 h-2.5" />
                                 تكرار مفعل
                               </span>
                             )}
                          </div>
                        </div>
                      </div>

                      {/* Main Player UI */}
                      <div className="flex flex-col items-center gap-3 w-full max-w-md">
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => setIsAudioLoop(!isAudioLoop)}
                            className={`p-2.5 rounded-xl transition-all border ${
                              isAudioLoop 
                                ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30' 
                                : 'text-gray-500 border-transparent hover:bg-white/5'
                            }`}
                            title="تكرار تلقائي"
                          >
                            <RotateCcw className={`w-5 h-5 ${isAudioLoop ? 'animate-spin-slow' : ''}`} />
                          </button>

                          <button 
                            onClick={togglePlay}
                            className="w-14 h-14 rounded-full bg-[#D4AF37] text-[#02130F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 hover:scale-110 active:scale-95 transition-all"
                          >
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                          </button>

                          <button 
                            onClick={() => {
                              if (audioRef.current) audioRef.current.currentTime += 10;
                            }}
                            className="p-2.5 rounded-xl text-gray-400 hover:text-[#FAF6EE] transition-all border border-transparent hover:border-white/10"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Progress Bar (simplified) */}
                        <div className="w-full space-y-1">
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             const x = e.clientX - rect.left;
                             const clickedPercent = x / rect.width;
                             if (audioRef.current) audioRef.current.currentTime = clickedPercent * duration;
                          }}>
                            <div 
                              className="bg-[#D4AF37] h-full transition-all" 
                              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-gray-500 font-bold">
                            <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
                            <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio Adhkar Grid List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {AUDIO_AZKAR_DATA.map((audioAdhkar) => {
                    const isCurrent = currentAudioAdhkar?.id === audioAdhkar.id;
                    return (
                      <div 
                        key={audioAdhkar.id}
                        onClick={() => playAudioAdhkar(audioAdhkar)}
                        className={`group p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[160px] ${
                          isCurrent 
                            ? 'bg-[#052F20] border-[#D4AF37]/50 shadow-lg scale-[1.02]' 
                            : 'bg-[#031D16] border-white/5 hover:border-[#D4AF37]/30 hover:bg-[#04251D]'
                        }`}
                      >
                        {/* Decorative background icon */}
                        <div className="absolute -left-4 -bottom-4 text-7xl opacity-5 grayscale pointer-events-none group-hover:scale-110 transition-transform">
                          📻
                        </div>

                        <div className="relative z-10 flex justify-between items-start">
                          <div className="text-right">
                            <h5 className="text-lg font-black text-[#FAF6EE] font-amiri mb-1">{audioAdhkar.title}</h5>
                            <p className="text-[10px] text-gray-400 font-sans">بصوت {audioAdhkar.reader}</p>
                          </div>
                          <div className={`p-3 rounded-2xl transition-all ${isCurrent && isPlaying ? 'bg-[#D4AF37] text-[#02130F] animate-pulse' : 'bg-white/5 text-[#D4AF37] group-hover:bg-[#D4AF37]/10'}`}>
                            {isCurrent && isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                          </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                           <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                             <Clock className="w-3 h-3" />
                             <span>{audioAdhkar.duration}</span>
                           </div>
                           <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/5 px-2 py-0.5 rounded-md border border-[#D4AF37]/10">
                             {audioAdhkar.category}
                           </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Info Card */}
                <div className="bg-[#02130F]/40 border border-[#D4AF37]/10 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-5">
                   <div className="p-4 rounded-2xl bg-teal-500/10 text-teal-400">
                     <Award className="w-8 h-8" />
                   </div>
                   <div className="text-right flex-1">
                      <h6 className="text-sm font-bold text-[#FAF6EE] mb-1">الاستماع عوضاً عن القراءة</h6>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans">
                        أثبتت الدراسات أن الاستماع للأذكار والقرآن بتمهل وتدبر يساعد في خفض مستويات التوتر وزيادة التركيز الإيماني. يمكنك تفعيل خيار **التكرار التلقائي** لترك الأذكار تعمل في الخلفية أثناء انشغالك بمهامك اليومية.
                      </p>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TASBIH TAB ==================== */}
        {activeTab === 'tasbih' && (
          <div className="space-y-8 animate-fade-in text-right">
            <div className="border-b border-[#D4AF37]/15 pb-6">
              <h2 className="text-3xl font-extrabold text-[#FAF6EE] font-amiri">{t('header.tasbih')}</h2>
              <p className="text-sm text-gray-400 mt-1 font-sans">{t('nav.tasbih_desc')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Right Side: Big Interactive Tapper (lg:col-span-5) */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#042019] to-[#01140F] border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center space-y-6 shadow-2xl relative overflow-hidden">
                {/* Visual subtle mosque background watermark */}
                <div className="absolute inset-0 opacity-2 pointer-events-none flex items-center justify-center select-none">
                  <span className="text-[150px]">🕋</span>
                </div>

                {/* Total Accumulated Counter Badge */}
                <div className="w-full bg-[#02130F]/85 border border-[#D4AF37]/20 p-4 rounded-2xl flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400 animate-pulse" />
                    <span className="text-xs text-gray-300 font-sans">إجمالي التسبيحات الكلي:</span>
                  </div>
                  <span className="text-lg font-mono font-black text-amber-300">
                    {totalTasbihCount.toLocaleString('ar-EG')} <span className="text-[10px] text-gray-400 font-sans">ذكر</span>
                  </span>
                </div>

                {/* Big Tap/Click Button Area */}
                <div className="relative w-52 h-52 flex items-center justify-center z-10 select-none">
                  
                  {/* SVG circular progress ring for the target */}
                  {(() => {
                    const target = getTargetCount();
                    const progressFraction = target === Infinity || target <= 0 ? 0 : Math.min(1, tasbihCount / target);
                    const strokeDashoffset = 502 - (502 * progressFraction);
                    return (
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle
                          cx="104"
                          cy="104"
                          r="80"
                          className="stroke-white/5"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="104"
                          cy="104"
                          r="80"
                          className="stroke-[#D4AF37] transition-all duration-300"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray="502"
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                    );
                  })()}

                  <button 
                    onClick={incrementTasbih}
                    className="w-36 h-36 rounded-full bg-gradient-to-br from-[#03231B] to-[#01100C] border-2 border-[#D4AF37]/45 hover:border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.15)] active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer focus:outline-none ring-4 ring-[#D4AF37]/5"
                  >
                    <span className="text-5xl font-mono font-black text-[#D4AF37] tracking-tighter">
                      {tasbihCount.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-widest font-sans animate-pulse">انقر للعد</span>
                  </button>
                </div>

                {/* Active Phrase Display */}
                <div className="text-center w-full z-10 space-y-1">
                  <p className="text-xs text-gray-400 font-sans">الورد الحالي النشط:</p>
                  <p className="text-xl font-bold font-amiri text-amber-300 leading-relaxed max-w-xs mx-auto drop-shadow-sm">
                    {activeDhikrPreset.id === 'custom' && customTasbihText.trim() ? customTasbihText : activeDhikrPreset.text}
                  </p>
                  
                  <div className="flex justify-center items-center gap-2 pt-1">
                    <span className="text-xs text-gray-500 font-sans">
                      {isUnlimitedTarget ? 'الورد غير محدود' : `الهدف الحالي: ${getTargetCount().toLocaleString('ar-EG')} مرة`}
                    </span>
                    {!isUnlimitedTarget && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
                        {Math.min(100, Math.round((tasbihCount / getTargetCount()) * 100))}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Counter controls: Reset & Sound Toggle */}
                <div className="w-full grid grid-cols-2 gap-3 z-10 pt-2">
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      triggerToast(!soundEnabled ? 'تم تفعيل صوت نقرة التسبيح 🔊' : 'تم كتم صوت نقرة التسبيح 🔇');
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold font-sans transition-all cursor-pointer ${
                      soundEnabled 
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 border-white/5'
                    }`}
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="w-4 h-4 animate-pulse" />
                        <span>الصوت نشط</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>مكتوم</span>
                      </>
                    )}
                  </button>

                  <button 
                    onClick={resetTasbih} 
                    className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:text-red-300 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold font-sans"
                    title="تصفير المسبحة"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>تصفير الدورة</span>
                  </button>
                </div>

                <div className="w-full text-center z-10 text-[9px] text-gray-500 font-sans border-t border-white/5 pt-4">
                  💡 يمكنك التسبيح بالنقر على الزر أو مساحته الدائرية. يدعم حاسة اللمس والاهتزاز والصوت المتجاوب السريع على كافة الأجهزة.
                </div>

              </div>

              {/* Left Side: Preset Lists & Advanced Configuration (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Presets section */}
                <div className="bg-[#042019] border border-[#D4AF37]/20 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-lg font-bold text-[#FAF6EE] font-amiri flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      الأوراد المعتمدة والأذكار الجاهزة
                    </h3>
                    <span className="text-[10px] text-gray-400 font-sans">اختر للبدء فوراً</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 font-sans text-right">
                    {PRESETS_DHIKR.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => selectTasbihPreset(preset)}
                        className={`w-full p-3.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                          activeDhikrPreset.id === preset.id
                            ? 'bg-[#052F20] border-[#D4AF37] text-[#FAF6EE] shadow-md shadow-[#052F20]/50'
                            : 'bg-[#02130F] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="text-right">
                          <span className="text-sm font-bold block leading-relaxed">{preset.text}</span>
                          <span className="text-[10px] text-gray-400">{preset.description}</span>
                        </div>
                        <span className="text-xs font-mono bg-white/5 px-2.5 py-1 rounded-md text-[#D4AF37] font-bold shrink-0">
                          {preset.count.toLocaleString('ar-EG')} تكرار
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Custom configurator for thousands */}
                <div className="bg-gradient-to-br from-[#042019] to-[#01140F] border border-[#D4AF37]/25 rounded-3xl p-6 space-y-4 shadow-xl text-right">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-lg font-bold text-[#FAF6EE] font-amiri flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D4AF37]" />
                      إنشاء ورد مخصص بالآلاف والمئات ⚙️
                    </h3>
                    <span className="text-[10px] text-[#D4AF37] font-sans font-bold">مفتوح ومخصص</span>
                  </div>

                  <div className="space-y-4 font-sans text-right">
                    {/* Custom Text input */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-300 block">نص الذكر أو الدعاء المخصص:</label>
                      <input
                        type="text"
                        value={customTasbihText}
                        onChange={(e) => setCustomTasbihText(e.target.value)}
                        placeholder="مثال: اللهم صلّ على محمد، أستغفر الله وأتوب إليه..."
                        className="w-full p-3 rounded-xl bg-[#02130F] border border-white/10 text-[#FAF6EE] placeholder-gray-500 focus:border-[#D4AF37]/50 focus:outline-none text-sm text-right"
                      />
                    </div>

                    {/* Unlimited check */}
                    <div className="flex items-center justify-between bg-[#02130F]/60 p-3 rounded-xl border border-white/5 text-right">
                      <input
                        type="checkbox"
                        checked={isUnlimitedTarget}
                        onChange={(e) => {
                          setIsUnlimitedTarget(e.target.checked);
                          if (e.target.checked) {
                            setActiveDhikrPreset({ id: 'custom', text: customTasbihText.trim() || 'ورد مخصص مفتوح', count: Infinity, description: 'ورد مخصص بدون سقف' });
                          }
                        }}
                        className="w-4.5 h-4.5 accent-[#D4AF37] cursor-pointer"
                      />
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-300 block">ورد مفتوح (غير محدود)</span>
                        <span className="text-[10px] text-gray-500 block">العداد يستمر بالزيادة دون سقف أو تصفير تلقائي</span>
                      </div>
                    </div>

                    {/* Custom target input (only if not unlimited) */}
                    {!isUnlimitedTarget && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-300 block">العدد المستهدف (يدعم الآلاف والآلاف المؤلفة):</label>
                          <input
                            type="number"
                            min="1"
                            value={customDhikrTarget}
                            onChange={(e) => setCustomDhikrTarget(e.target.value)}
                            placeholder="مثال: 1000، 3000، 5000..."
                            className="w-full p-3 rounded-xl bg-[#02130F] border border-white/10 text-[#FAF6EE] placeholder-gray-500 focus:border-[#D4AF37]/50 focus:outline-none text-sm text-right font-mono font-bold"
                          />
                        </div>

                        {/* Quick preset add buttons */}
                        <div className="space-y-1.5 text-right">
                          <span className="text-[10px] text-gray-400 block">تحديد سريع للأهداف الكبيرة (بالآلاف والمئات):</span>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            {[100, 1000, 3000, 10000].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setCustomDhikrTarget(num.toString())}
                                className={`py-2 px-1.5 rounded-lg border text-center font-mono font-bold transition-all cursor-pointer ${
                                  customDhikrTarget === num.toString()
                                    ? 'bg-[#D4AF37]/25 border-[#D4AF37] text-[#FAF6EE]'
                                    : 'bg-[#02130F] border-white/5 text-gray-400 hover:bg-white/5'
                                }`}
                              >
                                {num >= 1000 ? `${num / 1000}K` : num}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Activation action */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetVal = isUnlimitedTarget ? Infinity : parseInt(customDhikrTarget, 10);
                        if (!isUnlimitedTarget && (isNaN(targetVal) || targetVal <= 0)) {
                          triggerToast('الرجاء إدخال عدد مستهدف صحيح أكبر من صفر ⚠️');
                          return;
                        }
                        const phrase = customTasbihText.trim() || 'ذكر مخصص';
                        setActiveDhikrPreset({
                          id: 'custom',
                          text: phrase,
                          count: targetVal,
                          description: isUnlimitedTarget ? 'ورد مخصص بدون سقف' : `ورد مخصص بهدف ${targetVal.toLocaleString('ar-EG')} تكرار`
                        });
                        setTasbihCount(0);
                        triggerToast(`✨ تم اعتماد وتطبيق الورد المخصص: "${phrase}"`);
                      }}
                      className="w-full py-3 bg-[#D4AF37] hover:bg-amber-500 text-[#02130F] rounded-xl text-xs font-black transition-all hover:scale-[1.01] active:scale-95 shadow-md shadow-[#D4AF37]/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>تطبيق وتفعيل الورد المخصص المختار</span>
                    </button>

                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==================== AI ADVISOR TAB ==================== */}
        {activeTab === 'ai' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-[#D4AF37]/15 pb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-[#D4AF37] animate-pulse" />
                <h2 className="text-3xl font-extrabold text-[#FAF6EE] font-amiri">✨ مستشار التدبر والذكر الذكي</h2>
              </div>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed font-sans">
                تواصل لحظياً مع المستشار الإيماني والتدبري لتفسير الآيات أو توليد ورد قلوب مخصص ومريح لروحك. يمكنك إضافة مفتاح API لـ Gemini الخاص بك أو الاعتماد على المجمع الأساسي.
              </p>
            </div>

            {/* Feature 3: Interactive Featured Verse sliding card */}
            <div className="bg-gradient-to-r from-[#04251D] to-[#02130F] border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl font-sans">
              <div className="flex justify-between items-center border-b border-[#D4AF37]/15 pb-4">
                <h3 className="text-lg font-bold text-[#FAF6EE] font-amiri flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                  آيات مقترحة للتدبر والوقوف على أسرارها 💡
                </h3>
                <div className="flex gap-1.5">
                  {FEATURED_VERSES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeaturedVerseIndex(idx)}
                      className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                        featuredVerseIndex === idx ? 'bg-[#D4AF37] scale-110' : 'bg-white/10 hover:bg-white/20'
                      }`}
                      title={`آية ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Slider Content */}
              <div className="space-y-4 animate-fade-in" key={featuredVerseIndex}>
                <div className="bg-[#02130F] border-r-4 border-[#D4AF37] p-5 rounded-2xl space-y-3">
                  <p className="text-xl md:text-2xl font-black font-amiri text-center text-amber-200/90 leading-loose">
                     {FEATURED_VERSES[featuredVerseIndex].text} 
                  </p>
                  <p className="text-xs text-left text-[#D4AF37] font-bold font-sans">
                    — سورة {FEATURED_VERSES[featuredVerseIndex].surah}
                  </p>
                </div>

                <div className="text-xs text-gray-300 leading-relaxed font-sans bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-teal-400 font-bold uppercase block mb-1">لطائف وتفسير مبسط:</span>
                  {FEATURED_VERSES[featuredVerseIndex].tafsir}
                </div>

                <button
                  onClick={() => triggerVerseContemplation(FEATURED_VERSES[featuredVerseIndex].text)}
                  className="w-full sm:w-auto px-6 py-3 bg-[#D4AF37] hover:bg-amber-500 text-[#02130F] rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  💬 اطلب من المستشار تفسيراً وتأملاً عميقاً لهذه الآية فوراً (مباشر وسريع)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Config panel */}
              <div className="lg:col-span-5 bg-[#042019] border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 space-y-6 h-fit">
                
                {/* Optional User API Key input */}
                <div className="bg-[#02130F] p-4 rounded-2xl border border-[#D4AF37]/20 space-y-2 font-sans">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-amber-300">مفتاح Gemini API الخاص بك (يُحفظ محلياً):</label>
                    {userGeminiKey && (
                      <button 
                        onClick={() => { setUserGeminiKey(''); localStorage.removeItem('userGeminiKey'); triggerToast('تم مسح المفتاح المحلي'); }}
                        className="text-[10px] text-red-400 hover:underline"
                      >
                        مسح المفتاح
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    value={userGeminiKey}
                    onChange={(e) => saveGeminiKey(e.target.value)}
                    placeholder="AIzaSy... (اختياري، نستخدم خادمنا في حال خلوه)" 
                    className="w-full bg-[#042019] border border-white/10 rounded-xl p-2.5 text-xs font-mono text-[#FAF6EE] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Sub-modes selector */}
                <div className="flex gap-2 border-b border-white/5 pb-4 font-sans">
                  <button 
                    onClick={() => setAiMode('tafsir')} 
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      aiMode === 'tafsir' ? 'bg-[#D4AF37] text-[#02130F]' : 'bg-[#02130F] text-gray-400 hover:text-white'
                    }`}
                  >
                    مستشار التدبر
                  </button>
                  <button 
                    onClick={() => setAiMode('wird')} 
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      aiMode === 'wird' ? 'bg-[#D4AF37] text-[#02130F]' : 'bg-[#02130F] text-gray-400 hover:text-white'
                    }`}
                  >
                    ورد القلوب
                  </button>
                </div>

                {/* Tafsir Form details */}
                {aiMode === 'tafsir' && (
                  <div className="space-y-4 font-sans">
                    <div>
                      <label className="block text-xs font-bold text-[#D4AF37] mb-2">اختر سورة للتدبر والمقاصد:</label>
                      <select 
                        value={aiSelectedSurah}
                        onChange={(e) => setAiSelectedSurah(e.target.value)}
                        className="w-full bg-[#02130F] border border-[#D4AF37]/30 text-[#FAF6EE] text-xs rounded-xl p-3 focus:outline-none cursor-pointer"
                      >
                        {SURAHS.map((s) => (
                          <option key={s.id} value={s.name}>سورة {s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#D4AF37] mb-2">أو اكتب آية مخصصة للتدبر بالتفصيل:</label>
                      <input 
                        type="text" 
                        value={aiCustomVerse}
                        onChange={(e) => setAiCustomVerse(e.target.value)}
                        placeholder="مثال: (ألا بذكر الله تطمئن القلوب)..." 
                        className="w-full bg-[#02130F] border border-[#D4AF37]/35 text-[#FAF6EE] text-xs rounded-xl p-3 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={generateAiTafsir}
                      disabled={aiLoading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942F] text-[#02130F] text-xs font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {aiLoading ? 'جاري الاتصال بالمستشار الإيماني...' : 'تفسير وتدبر الآية ✨'}
                    </button>
                  </div>
                )}

                {/* Wird Mood form details */}
                {aiMode === 'wird' && (
                  <div className="space-y-4 font-sans">
                    <label className="block text-xs font-bold text-[#D4AF37] mb-2">اختر الحالة الروحية أو النفسية الحالية لقلبك:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'حزن وضيق',
                        'قلق وخوف',
                        'فتور وتكاسل عن الطاعة',
                        'ذنب يثقل روحي',
                        'رغبة في زيادة الإيمان',
                        'فرح وشكر لله ونعمه'
                      ].map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => setAiSelectedMood(mood)}
                          className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            aiSelectedMood === mood
                              ? 'bg-[#052F20] border-teal-400 text-teal-300'
                              : 'bg-[#02130F] border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={generateAiWird}
                      disabled={aiLoading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942F] text-[#02130F] text-xs font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {aiLoading ? 'جاري توليد ورد القلوب السكينة...' : 'توليد ورد القلوب المخصص ✨'}
                    </button>
                  </div>
                )}
              </div>

              {/* Display Result Panel */}
              <div className="lg:col-span-7 bg-[#042019] border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[400px]">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex justify-between items-center border-b border-[#D4AF37]/10 pb-4">
                    <h4 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      نتيجة وتوصية المستشار الذكي
                    </h4>
                    {aiResponseText && (
                      <button 
                        onClick={copyAiResponse} 
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4AF37] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" /> نسخ النص
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-grow max-h-[500px] overflow-y-auto pr-1 select-text">
                    {aiLoading ? (
                      <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-[#D4AF37] animate-spin"></div>
                        <span className="text-xs text-gray-400 font-sans">جاري تدبر الآيات المباركة وتجهيز الورد الروحي المهدئ لروعك...</span>
                      </div>
                    ) : aiResponseText ? (
                      <div className="text-sm text-gray-300 leading-relaxed font-sans whitespace-pre-line bg-[#02130F]/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                        {aiResponseText}
                      </div>
                    ) : (
                      <div className="text-center py-24 text-gray-500 font-sans">
                        مرحباً بك! اختر التفاصيل واكبس على زر التوليد لتظهر لك إجابة المساعد الإيماني والروحي هنا.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== ZAKAT TAB ==================== */}
        {activeTab === 'zakat' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-[#D4AF37]/15 pb-6">
              <h2 className="text-3xl font-extrabold text-[#FAF6EE] font-amiri">💰 حاسبة الزكاة والمال الشرعية</h2>
              <p className="text-sm text-gray-400 mt-1">احسب نصاب زكاة أموالك ومدخراتك من الذهب والفضة فوراً وبدقة تامة لعام 2026</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Zakat Inputs form */}
              <form onSubmit={calculateZakat} className="lg:col-span-5 bg-[#042019] border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 space-y-4 h-fit font-sans text-right">
                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-2">إجمالي السيولة النقدية والودائع والأسهم المملوكة ($):</label>
                  <input 
                    type="number" 
                    value={zakatCash}
                    onChange={(e) => setZakatCash(e.target.value)}
                    placeholder="مثال: 10000" 
                    className="w-full bg-[#02130F] border border-[#D4AF37]/30 text-[#FAF6EE] text-sm rounded-xl p-3 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-2">وزن الذهب عيار 24 المملوك للادخار (بالغرام):</label>
                  <input 
                    type="number" 
                    value={zakatGold}
                    onChange={(e) => setZakatGold(e.target.value)}
                    placeholder="مثال: 95" 
                    className="w-full bg-[#02130F] border border-[#D4AF37]/30 text-[#FAF6EE] text-sm rounded-xl p-3 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-2">وزن الفضة المملوكة للادخار (بالغرام):</label>
                  <input 
                    type="number" 
                    value={zakatSilver}
                    onChange={(e) => setZakatSilver(e.target.value)}
                    placeholder="مثال: 600" 
                    className="w-full bg-[#02130F] border border-[#D4AF37]/30 text-[#FAF6EE] text-sm rounded-xl p-3 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3 bg-[#02130F]/40 p-3 rounded-2xl">
                  <span className="text-[10px] text-[#D4AF37] font-bold block">إعدادات أسعار السوق لعام 2026 (اختياري للضبط):</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">سعر غرام الذهب عيار 24 ($):</label>
                      <input 
                        type="number" 
                        value={customGoldPrice}
                        onChange={(e) => setCustomGoldPrice(e.target.value)}
                        className="w-full bg-[#02130F] border border-white/10 text-xs text-amber-200 rounded-lg p-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">سعر غرام الفضة ($):</label>
                      <input 
                        type="number" 
                        value={customSilverPrice}
                        onChange={(e) => setCustomSilverPrice(e.target.value)}
                        className="w-full bg-[#02130F] border border-white/10 text-xs text-amber-200 rounded-lg p-2 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942F] text-[#02130F] text-xs font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  احسب قيمة الزكاة المفروضة
                </button>
              </form>

              {/* Display Result panel */}
              <div className="lg:col-span-7 bg-[#042019] border border-[#D4AF37]/25 rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[350px]">
                {zakatReport ? (
                  zakatReport
                ) : (
                  <div className="text-center py-20 text-gray-500 font-sans h-full flex flex-col justify-center items-center">
                    <Calculator className="w-12 h-12 text-[#D4AF37]/30 mb-4" />
                    <p className="text-xs">أدخل أرقام المال والذهب ثم انقر على حساب الزكاة لعرض التقرير الشرعي والمالي المعتمد لعام 2026.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==================== PUBLISH TAB ==================== */}
        {activeTab === 'publish' && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-[#D4AF37]/15 pb-6">
              <h2 className="text-3xl font-extrabold text-[#FAF6EE] font-amiri">انشر المنصة كصدقة جارية مخصصة</h2>
              <p className="text-sm text-gray-400 mt-1">خصص منصة "الذاكرون" باسمك الشخصي أو عائلتك وانشر الرابط لكسب الأجر المستمر</p>
            </div>

            <div className="max-w-xl mx-auto bg-[#042019] border border-[#D4AF37]/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-[#FAF6EE] font-amiri">توليد الرابط الدعوي الخاص بك</h3>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  عند كتابة اسمك أو اسم من تحب في الحقل أدناه وتوليد الرابط، سيظهر اسمك في شريط الترحيب الذهبي العلوي لكل زائر يدخل عبر رابطك كصدقة جارية، لتكسب أجر كل تسبيحة وصلاة وقراءة قرآن يقومون بها عبر المنصة.
                </p>
              </div>

              <div className="space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-2 text-right">اكتب الاسم المراد عرضه بالموقع للزوار:</label>
                  <input 
                    type="text" 
                    value={customShareName}
                    onChange={(e) => setCustomShareName(e.target.value)}
                    placeholder="مثال: علي، أو عائلة علي، أو فاعل خير..." 
                    className="w-full bg-[#02130F] border border-[#D4AF37]/35 text-[#FAF6EE] text-sm rounded-xl p-3 focus:outline-none focus:border-[#D4AF37] text-right"
                  />
                </div>
                <button 
                  onClick={generatePublishLink}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B5942F] text-[#02130F] text-xs font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  توليد رابط النشر الخاص بي الآن
                </button>
              </div>

              {generatedShareLink && (
                <div className="space-y-4 bg-[#02130F] border border-[#D4AF37]/25 p-5 rounded-2xl animate-fade-in font-sans text-right">
                  <div className="text-center space-y-1">
                    <span className="inline-flex p-2.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      <Check className="w-5 h-5" />
                    </span>
                    <h4 className="text-sm font-bold text-[#FAF6EE]">تم توليد رابط موقعك الخاص بنجاح!</h4>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      value={generatedShareLink}
                      readOnly 
                      className="w-full bg-[#042019] border border-white/5 text-xs text-teal-400 rounded-xl p-3 focus:outline-none font-mono text-left"
                    />
                    <button 
                      onClick={copyPublishLink}
                      className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#02130F] text-xs font-black whitespace-nowrap cursor-pointer active:scale-95 transition-all"
                    >
                      نسخ الرابط
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* 6. STICKY BOTTOM AUDIO PLAYER */}
      {(currentPlayingSurah || currentAudioAdhkar) && (
        <div className="sticky bottom-0 z-40 bg-gradient-to-t from-[#010907] to-[#02130F]/98 border-t border-[#D4AF37]/30 px-4 py-4 md:py-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-sans">
            
            {/* Audio details */}
            <div className="flex items-center gap-3 w-full md:w-auto text-right">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-500 text-[#02130F] flex items-center justify-center font-black text-lg shadow-lg shadow-[#D4AF37]/10 animate-pulse-slow">
                {currentPlayingSurah ? '📖' : '📿'}
              </div>
              <div className="flex-grow">
                {currentPlayingSurah ? (
                  <>
                    <span className="text-[10px] text-teal-400 font-bold block tracking-wider uppercase">
                      {i18n.language === 'ar' ? `سورة ${currentPlayingSurah.name}` : `Surah ${currentPlayingSurah.englishName}`} ({i18n.language === 'ar' ? currentPlayingSurah.type : (currentPlayingSurah.type === 'مكية' ? 'Meccan' : 'Medinan')})
                    </span>
                    <h4 className="text-xs font-bold text-[#FAF6EE] mt-0.5">
                      {i18n.language === 'ar' ? selectedReciter.name : (selectedReciter.nameEn || selectedReciter.name)}
                    </h4>
                  </>
                ) : currentAudioAdhkar ? (
                  <>
                    <span className="text-[10px] text-teal-400 font-bold block tracking-wider">
                      {currentAudioAdhkar.title}
                    </span>
                    <h4 className="text-xs font-bold text-[#FAF6EE] mt-0.5">
                      {currentAudioAdhkar.reader}
                    </h4>
                  </>
                ) : null}
              </div>
            </div>

            {/* Play controls & progress bar */}
            <div className="flex items-center gap-4 w-full md:flex-grow md:max-w-2xl justify-center">
              {/* Skip Back 10s */}
              <button 
                onClick={() => skipTime(-10)}
                className="p-2 rounded-xl text-gray-400 hover:text-amber-300 hover:bg-white/5 transition-all cursor-pointer active:scale-90"
                title={i18n.language === 'ar' ? 'رجوع 10 ثوانٍ' : 'Rewind 10s'}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause */}
              <button 
                onClick={togglePlay}
                className="p-3.5 rounded-full bg-gradient-to-r from-amber-400 to-[#D4AF37] hover:from-amber-300 hover:to-amber-500 text-[#02130F] transition-all transform active:scale-95 shadow-xl shadow-[#D4AF37]/10 cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isAudioLoading ? (
                  <div className="w-4 h-4 border-2 border-[#02130F]/30 border-t-[#02130F] rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4.5 h-4.5 fill-[#02130F] text-[#02130F]" />
                ) : (
                  <Play className="w-4.5 h-4.5 fill-[#02130F] text-[#02130F] ml-0.5" />
                )}
              </button>

              {/* Skip Forward 10s */}
              <button 
                onClick={() => skipTime(10)}
                className="p-2 rounded-xl text-gray-400 hover:text-amber-300 hover:bg-white/5 transition-all cursor-pointer active:scale-90"
                title={i18n.language === 'ar' ? 'تقديم 10 ثوانٍ' : 'Forward 10s'}
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Progress Slider */}
              <div className="flex-grow flex items-center gap-2.5">
                <span className="text-[10px] text-gray-400 font-mono w-8 text-center">{formatTime(currentTime)}</span>
                <div 
                  className="h-2.5 bg-white/10 rounded-full flex-grow overflow-hidden cursor-pointer relative hover:h-3 transition-all touch-none" 
                  onClick={seekAudio}
                  onTouchEnd={seekAudio}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-300 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-gray-400 font-mono w-8 text-center">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Speed & Volume & Dismiss */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-0 border-white/5 pt-3 md:pt-0">
              {/* Speed Controller */}
              <div className="flex items-center gap-1.5 bg-[#011B12]/60 px-2 py-1.5 rounded-xl border border-[#D4AF37]/10">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  {i18n.language === 'ar' ? 'السرعة' : 'Speed'}
                </span>
                <select 
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  className="bg-transparent text-[#D4AF37] text-[10px] font-black focus:outline-none cursor-pointer"
                >
                  <option value="0.75" className="bg-[#02130F]">0.75x</option>
                  <option value="1.0" className="bg-[#02130F]">1.0x</option>
                  <option value="1.25" className="bg-[#02130F]">1.25x</option>
                  <option value="1.5" className="bg-[#02130F]">1.5x</option>
                  <option value="2.0" className="bg-[#02130F]">2.0x</option>
                </select>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="text-gray-400 hover:text-[#FAF6EE] cursor-pointer p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#D4AF37]" />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={volume}
                  onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                  className="w-16 accent-[#D4AF37] bg-white/10 h-1 rounded-full cursor-pointer hover:accent-amber-400 transition-all" 
                />
              </div>

              {/* Close Button */}
              <button 
                onClick={stopAudio}
                className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
                title={i18n.language === 'ar' ? 'إغلاق المشغل' : 'Close Player'}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. APP FOOTER */}
      <footer className="bg-[#010907] border-t border-[#D4AF37]/15 py-12 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-4 font-sans">
          <p>© 2026 منصة ذاكرون الرقمية. تم تحسين الأداء وإضافة بوصلة القبلة وحاسبة الزكاة الذكية وجدول الالتزام الإيماني.</p>
          
          <div className="flex flex-col items-center justify-center gap-4 pt-2">
            <a 
              href="https://www.facebook.com/aldhakirun" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-6 py-3 rounded-full bg-[#042019] border border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#02130F] transition-all flex items-center gap-2 font-bold shadow-lg cursor-pointer"
            >
              <Facebook className="w-4 h-4 fill-current" />
              <span>صفحتنا على فيسبوك</span>
            </a>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-500 font-sans mt-2">
              <span>تم إنشاء المنصة بالكامل بواسطة <strong className="text-gray-300">Ali Ali</strong></span>
              <span className="hidden sm:inline text-[#D4AF37]/30">•</span>
              <a 
                href="https://github.com/ali963git" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-[#D4AF37] hover:text-amber-300 hover:underline transition-all font-semibold"
              >
                <Github className="w-3.5 h-3.5" />
                <span>صفحتي على جيت هب (Github)</span>
              </a>
            </div>
          </div>
          
          <p className="text-gray-500 pt-2">تقبل الله منا ومنكم صالح الأعمال والذكر الحكيم.</p>
        </div>
      </footer>

    </div>
  );
}
