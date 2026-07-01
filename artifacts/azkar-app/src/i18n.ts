import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      'nav.home': 'الرئيسية',
      'nav.quran': 'القرآن الكريم',
      'nav.hisn': 'حصن المسلم',
      'nav.azkar': 'أذكار المسلم',
      'nav.dua': 'دعاء اليوم',
      'nav.hadeeth': 'الحديث الشريف',
      'nav.community': 'المجتمع',
      'nav.settings': 'الإعدادات',
      'header.quran': '📖 القرآن الكريم والمصحف الشريف',
      'header.hisn': '📜 حصن المسلم',
      'header.azkar': '📿 أذكار المسلم والتحصين اليومي',
      'header.dua': '🤲 أدعية مختارة',
      'header.hadeeth': '✨ الحديث الشريف',
      'header.tasbih': '📿 المسبحة الإلكترونية ومستودع الأوراد الذكي',
      'header.history': 'حدث في مثل هذا اليوم من التاريخ الإسلامي 📜',
      'nav.tasbih_desc': 'تتبع تسبيحاتك اليومية والكلية التي تستوعب الآلاف والمليون مع مستودع أوراد مخصص وتفاعلي يعمل بسلاسة فائقة على جميع الأجهزة والمتصفحات.',
      'nav.quran_desc': 'تصفّح واقرأ آيات الذكر الحكيم بصفحات مصورة بالرسم العثماني أو استمع إلى أعذب التلاوات',
      'nav.quran_read': '📖 قراءة وتصفح المصحف',
      'nav.quran_listen': '🔊 استماع للمصحف المرتل',
      'history.hijri_current': 'اليوم الهجري الحالي',
      'quran.listen.surahs': 'السور',
      'quran.listen.history': 'سجل الاستماع',
      'quran.listen.reciter_prompt': 'اختر القارئ المفضل لديك للاستماع لوردك الصوتي:',
      'quran.listen.current_reciter': 'القارئ الحالي:',
      'quran.listen.search_placeholder': 'ابحث عن اسم السورة بالكامل (مثال: يس، الفجر)...',
      'quran.listen.clear': 'تفريغ',
      'quran.listen.ayahs': 'آية',
      'quran.listen.surah_prefix': 'سورة',
      'quran.listen.history_empty': 'لا يوجد سجل استماع مؤخراً. ابدأ بالاستماع للسور!',
      'quran.listen.continue': 'إكمال الاستماع',
      'quran.listen.type_meccan': 'مكية',
      'quran.listen.type_medinan': 'مدنية',
      'settings.language': 'لغة الواجهة',
      'settings.arabic': 'العربية',
      'settings.english': 'English',
    },
  },
  en: {
    translation: {
      'nav.home': 'Home',
      'nav.quran': 'Holy Quran',
      'nav.hisn': 'Hisn Al-Muslim',
      'nav.azkar': 'Daily Azkar',
      'nav.dua': 'Daily Dua',
      'nav.hadeeth': 'Hadith',
      'nav.community': 'Community',
      'nav.settings': 'Settings',
      'header.quran': '📖 Holy Quran & Al-Mus\'haf Al-Sharif',
      'header.hisn': '📜 Hisn Al-Muslim (Fortress of the Muslim)',
      'header.azkar': '📿 Daily Muslim Azkar & Protection',
      'header.dua': '🤲 Selected Supplications',
      'header.hadeeth': '✨ The Prophetic Hadith',
      'header.tasbih': '📿 Digital Tasbih & Smart Dhikr Repository',
      'header.history': 'On This Day in Islamic History 📜',
      'nav.tasbih_desc': 'Track your daily and total tasbih counts with a dedicated, interactive dhikr repository that works seamlessly on all devices.',
      'nav.quran_desc': 'Browse and read verses of the Holy Quran with illustrated pages or listen to beautiful recitations.',
      'nav.quran_read': '📖 Read & Browse Quran',
      'nav.quran_listen': '🔊 Listen to Recited Quran',
      'history.hijri_current': 'Current Hijri Day',
      'quran.listen.surahs': 'Surahs',
      'quran.listen.history': 'Listening History',
      'quran.listen.reciter_prompt': 'Choose your favorite reciter to listen to your daily portion:',
      'quran.listen.current_reciter': 'Current Reciter:',
      'quran.listen.search_placeholder': 'Search for surah name (e.g. Yaseen, Al-Fajr)...',
      'quran.listen.clear': 'Clear',
      'quran.listen.ayahs': 'Ayahs',
      'quran.listen.surah_prefix': 'Surah',
      'quran.listen.history_empty': 'No listening history recently. Start listening to Surahs!',
      'quran.listen.continue': 'Continue Listening',
      'quran.listen.type_meccan': 'Meccan',
      'quran.listen.type_medinan': 'Medinan',
      'settings.language': 'Interface Language',
      'settings.arabic': 'العربية',
      'settings.english': 'English',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
