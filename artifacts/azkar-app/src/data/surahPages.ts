export interface SurahPageMap {
  id: number;
  startPage: number;
}

export const SURAH_START_PAGES: Record<number, number> = {
  1: 1,
  2: 2,
  3: 50,
  4: 77,
  5: 106,
  6: 128,
  7: 151,
  8: 177,
  9: 187,
  10: 208,
  11: 221,
  12: 235,
  13: 249,
  14: 255,
  15: 262,
  16: 267,
  17: 282,
  18: 293,
  19: 305,
  20: 312,
  21: 322,
  22: 332,
  23: 342,
  24: 350,
  25: 359,
  26: 367,
  27: 377,
  28: 385,
  29: 396,
  30: 404,
  31: 411,
  32: 415,
  33: 418,
  34: 428,
  35: 434,
  36: 440,
  37: 446,
  38: 453,
  39: 458,
  40: 467,
  41: 477,
  42: 483,
  43: 489,
  44: 496,
  45: 499,
  46: 502,
  47: 507,
  48: 511,
  49: 515,
  50: 518,
  51: 520,
  52: 523,
  53: 526,
  54: 528,
  55: 531,
  56: 534,
  57: 537,
  58: 542,
  59: 545,
  60: 549,
  61: 551,
  62: 553,
  63: 554,
  64: 556,
  65: 558,
  66: 560,
  67: 562,
  68: 564,
  69: 566,
  70: 568,
  71: 570,
  72: 572,
  73: 574,
  74: 575,
  75: 577,
  76: 578,
  77: 580,
  78: 582,
  79: 583,
  80: 585,
  81: 586,
  82: 587,
  83: 587,
  84: 589,
  85: 590,
  86: 591,
  87: 591,
  88: 592,
  89: 593,
  90: 594,
  91: 595,
  92: 595,
  93: 596,
  94: 596,
  95: 597,
  96: 597,
  97: 598,
  98: 598,
  99: 599,
  100: 599,
  101: 600,
  102: 600,
  103: 601,
  104: 601,
  105: 601,
  106: 602,
  107: 602,
  108: 602,
  109: 603,
  110: 603,
  111: 603,
  112: 604,
  113: 604,
  114: 604
};

// Returns Juz number for a given page number in standard 604-page Quran
export function getJuzForPage(page: number): number {
  if (page <= 21) return 1;
  if (page <= 41) return 2;
  if (page <= 61) return 3;
  if (page <= 81) return 4;
  if (page <= 101) return 5;
  if (page <= 121) return 6;
  if (page <= 141) return 7;
  if (page <= 161) return 8;
  if (page <= 181) return 9;
  if (page <= 201) return 10;
  if (page <= 221) return 11;
  if (page <= 241) return 12;
  if (page <= 261) return 13;
  if (page <= 281) return 14;
  if (page <= 301) return 15;
  if (page <= 321) return 16;
  if (page <= 341) return 17;
  if (page <= 361) return 18;
  if (page <= 381) return 19;
  if (page <= 401) return 20;
  if (page <= 421) return 21;
  if (page <= 441) return 22;
  if (page <= 461) return 23;
  if (page <= 481) return 24;
  if (page <= 501) return 25;
  if (page <= 521) return 26;
  if (page <= 541) return 27;
  if (page <= 561) return 28;
  if (page <= 581) return 29;
  return 30;
}

// Find closest Surah for a given page
export function getSurahForPage(page: number, surahsList: any[]): any {
  let matchedSurah = surahsList[0];
  for (const s of surahsList) {
    const startP = SURAH_START_PAGES[s.id] || 1;
    if (startP <= page) {
      matchedSurah = s;
    } else {
      break;
    }
  }
  return matchedSurah;
}
