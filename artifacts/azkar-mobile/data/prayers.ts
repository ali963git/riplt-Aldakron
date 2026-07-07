export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface PrayerInfo {
  name: string;
  nameAr: string;
  key: keyof PrayerTimes;
}

export const PRAYERS: PrayerInfo[] = [
  { name: 'Fajr', nameAr: 'الفجر', key: 'fajr' },
  { name: 'Dhuhr', nameAr: 'الظهر', key: 'dhuhr' },
  { name: 'Asr', nameAr: 'العصر', key: 'asr' },
  { name: 'Maghrib', nameAr: 'المغرب', key: 'maghrib' },
  { name: 'Isha', nameAr: 'العشاء', key: 'isha' },
];

// Default: Mecca coordinates
export const DEFAULT_LAT = 21.3891;
export const DEFAULT_LON = 39.8579;

function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }

export function calculatePrayerTimes(
  lat: number,
  lon: number,
  date: Date = new Date(),
): PrayerTimes {
  // Days from J2000.0
  const D = (date.getTime() / 86400000) + 2440587.5 - 2451545.0;

  // Sun mean longitude/anomaly
  const g = toRad((357.529 + 0.98560028 * D) % 360);
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = toRad((q + 1.9146 * Math.sin(g) + 0.020 * Math.sin(2 * g)) % 360);

  // Obliquity + declination
  const e = toRad(23.439 - 0.00000036 * D);
  const dec = Math.asin(Math.sin(e) * Math.sin(L));

  // Equation of time (hours)
  const RA = toDeg(Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L))) / 15;
  const EqT = q / 15 - ((RA + 360) % 24);

  // Local timezone offset
  const tzOff = -date.getTimezoneOffset() / 60;

  // Transit (Dhuhr)
  const dhuhr = 12 - lon / 15 - EqT + tzOff;

  const ha = (angle: number): number => {
    const cosH = (Math.sin(toRad(angle)) - Math.sin(toRad(lat)) * Math.sin(dec)) /
                 (Math.cos(toRad(lat)) * Math.cos(dec));
    if (Math.abs(cosH) > 1) return NaN;
    return toDeg(Math.acos(cosH)) / 15;
  };

  // Asr (Shafi'i: shadow factor = 1)
  const asrElev = toDeg(Math.atan(1 / (1 + Math.abs(Math.tan(toRad(lat) - dec)))));
  const asrHA = ha(-asrElev);

  const fmt = (h: number): string => {
    if (isNaN(h)) return '--:--';
    const n = ((h % 24) + 24) % 24;
    const hr = Math.floor(n);
    const mn = Math.round((n - hr) * 60);
    const mn2 = mn >= 60 ? 0 : mn;
    const hr2 = mn >= 60 ? hr + 1 : hr;
    return `${String(hr2 % 24).padStart(2, '0')}:${String(mn2).padStart(2, '0')}`;
  };

  return {
    fajr: fmt(dhuhr - ha(-18)),
    sunrise: fmt(dhuhr - ha(-0.833)),
    dhuhr: fmt(dhuhr),
    asr: fmt(dhuhr + asrHA),
    maghrib: fmt(dhuhr + ha(-0.833)),
    isha: fmt(dhuhr + ha(-17)),
  };
}

/** Returns the key of the next prayer and minutes remaining */
export function getNextPrayer(times: PrayerTimes): { key: keyof PrayerTimes; nameAr: string; remaining: string } {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const order: Array<{ key: keyof PrayerTimes; nameAr: string }> = [
    { key: 'fajr', nameAr: 'الفجر' },
    { key: 'dhuhr', nameAr: 'الظهر' },
    { key: 'asr', nameAr: 'العصر' },
    { key: 'maghrib', nameAr: 'المغرب' },
    { key: 'isha', nameAr: 'العشاء' },
  ];

  for (const p of order) {
    const t = times[p.key];
    if (t === '--:--') continue;
    const [h, m] = t.split(':').map(Number);
    const pMins = h * 60 + m;
    if (pMins > nowMins) {
      const diff = pMins - nowMins;
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      const remaining = hrs > 0 ? `${hrs}س ${mins}د` : `${mins} دقيقة`;
      return { key: p.key, nameAr: p.nameAr, remaining };
    }
  }
  // After isha — next is fajr tomorrow
  const [h, m] = times.fajr.split(':').map(Number);
  const fajrMins = h * 60 + m + 24 * 60;
  const diff = fajrMins - nowMins;
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return { key: 'fajr', nameAr: 'الفجر', remaining: `${hrs}س ${mins}د` };
}

export function toHijri(date: Date = new Date()): { day: number; month: string; year: number } {
  const Y = date.getFullYear(), M = date.getMonth() + 1, D2 = date.getDate();
  const jd = Math.floor((14 - M) / 12);
  const y = Y + 4800 - jd;
  const m2 = M + 12 * jd - 3;
  let jdn = D2 + Math.floor((153 * m2 + 2) / 5) + 365 * y +
            Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  const l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
            Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
             Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hm = Math.floor((24 * l3) / 709);
  const hd = l3 - Math.floor((709 * hm) / 24);
  const hy = 30 * n + j - 30;

  const months = ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة',
                  'رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
  return { day: hd, month: months[hm - 1] ?? '', year: hy };
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'صباح النور';
  if (h >= 12 && h < 17) return 'ظهيرة مباركة';
  if (h >= 17 && h < 20) return 'مساء الخير';
  return 'مساء النور';
}

const ARABIC_DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
export function getArabicDay(): string {
  return ARABIC_DAYS[new Date().getDay()];
}
