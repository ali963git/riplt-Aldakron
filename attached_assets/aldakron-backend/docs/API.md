# توثيق API — Aldakron Backend

> التوثيق التفاعلي الكامل (Swagger/OpenAPI) متاح دائمًا على `/api/docs` أثناء تشغيل الخادم. هذا الملف ملخّص سريع للمرجعية.

جميع المسارات مسبوقة بـ `/api/v1` (تفعيل تلقائي عبر `VersioningType.URI`).

المصادقة: أرسل `Authorization: Bearer <accessToken>` على المسارات المحمية (🔒).

---

## Auth

| Method | Path | الوصف | حدود المعدّل |
|---|---|---|---|
| POST | `/auth/register` | إنشاء حساب جديد | 5 طلبات/دقيقة |
| POST | `/auth/login` | تسجيل الدخول | 10 طلبات/دقيقة |
| POST | `/auth/refresh` | تجديد access token عبر refresh token | عام |
| POST | `/auth/logout` | إبطال refresh token | عام |

**مثال — تسجيل الدخول:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Str0ngPass!"}'
```

## Users

| Method | Path | الوصف |
|---|---|---|
| 🔒 GET | `/users/me` | بيانات الملف الشخصي |
| 🔒 PATCH | `/users/me` | تعديل الاسم/الصورة/اللغة |

## Quran

| Method | Path | الوصف |
|---|---|---|
| GET | `/quran/surahs` | قائمة السور الـ 114 |
| GET | `/quran/surahs/:number` | نص سورة كاملة (مُشكّلة) |
| GET | `/quran/surahs/:number/ayahs/:ayah/tafsir` | تفسير آية |
| GET | `/quran/search?q=...&surah=...` | بحث نصي في القرآن |
| GET | `/quran/reciters` | قائمة القرّاء المتاحين |
| GET | `/quran/reciters/:reciter/surahs/:number/audio` | رابط تلاوة صوتية |
| 🔒 POST | `/quran/bookmarks` | إضافة/تحديث علامة مرجعية |
| 🔒 GET | `/quran/bookmarks` | قائمة العلامات المرجعية |
| 🔒 DELETE | `/quran/bookmarks/:id` | حذف علامة مرجعية |
| 🔒 POST | `/quran/favorites/toggle` | تبديل حالة المفضلة لآية |
| 🔒 GET | `/quran/favorites` | قائمة الآيات المفضّلة |
| 🔒 POST | `/quran/last-read` | حفظ آخر موضع قراءة |
| 🔒 GET | `/quran/last-read` | استرجاع آخر موضع قراءة |

القرّاء المتاحون حاليًا: `alafasy` (مشاري راشد العفاسي)، `dossari` (ياسر الدوسري)، `husary`، `minshawi`.

## Azkar

| Method | Path | الوصف |
|---|---|---|
| GET | `/azkar/categories?period=MORNING` | التصنيفات مع عناصرها |
| GET | `/azkar/categories/:id` | تفاصيل تصنيف واحد |
| 🔒 GET | `/azkar/progress?period=MORNING` | تقدّم اليوم لكل ذكر |
| 🔒 POST | `/azkar/items/:id/increment` | زيادة عداد التسبيح بمقدار 1 |
| 🔒 POST | `/azkar/items/:id/reset` | تصفير عداد اليوم لذكر معيّن |

قيم `period`: `MORNING` | `EVENING` | `SLEEP` | `AFTER_PRAYER` | `GENERAL`

## Prayer & Qibla

| Method | Path | الوصف |
|---|---|---|
| GET | `/prayer/times?lat=..&lng=..&method=MWL` | مواقيت الصلاة اليوم لإحداثيات معيّنة |
| GET | `/prayer/qibla?lat=..&lng=..` | اتجاه القبلة بالدرجات من الشمال |
| GET | `/prayer/hijri-date?date=DD-MM-YYYY` | التاريخ الهجري المقابل |
| 🔒 POST | `/prayer/settings` | حفظ موقع المستخدم وطريقة الحساب وتفضيلات التنبيه |
| 🔒 GET | `/prayer/settings` | استرجاع إعدادات المستخدم |
| 🔒 GET | `/prayer/times/me` | مواقيت اليوم بناءً على إعدادات المستخدم المحفوظة |

طرق الحساب المتاحة: `MWL`, `ISNA`, `EGYPT`, `MAKKAH`, `KARACHI`, `TEHRAN`, `JAFARI`

## Health

| Method | Path | الوصف |
|---|---|---|
| GET | `/health` | حالة الخدمة واتصال قاعدة البيانات (بدون بادئة `/v1`) |

---

## Admin (يتطلب دور ADMIN، وبعضها يقبل EDITOR أيضًا)

كل مسار هنا محمي بـ `JwtAuthGuard` + `RolesGuard`، وكل عملية تعديل/حذف تُسجَّل تلقائيًا في `AdminAuditLog` (مَن نفّذها، ماذا فعل، ومتى).

### إدارة المستخدمين — ADMIN فقط

| Method | Path | الوصف |
|---|---|---|
| GET | `/admin/users?search=&role=&page=&pageSize=` | قائمة مستخدمين مع بحث وترشيح وترقيم صفحات |
| GET | `/admin/users/:id` | تفاصيل مستخدم واحد |
| PATCH | `/admin/users/:id` | تعديل الدور (`role`) أو الحالة (`isActive`) |

### إدارة محتوى الأذكار — ADMIN وEDITOR (الحذف لـ ADMIN فقط)

| Method | Path | الوصف |
|---|---|---|
| POST | `/admin/azkar/categories` | إنشاء تصنيف أذكار جديد |
| DELETE | `/admin/azkar/categories/:id` | حذف تصنيف (ADMIN فقط) |
| POST | `/admin/azkar/items` | إضافة ذكر جديد ضمن تصنيف |
| PATCH | `/admin/azkar/items/:id` | تعديل ذكر موجود |
| DELETE | `/admin/azkar/items/:id` | حذف ذكر (ADMIN فقط) |

### الإشعارات — ADMIN فقط

| Method | Path | الوصف |
|---|---|---|
| POST | `/admin/notifications/broadcast` | إنشاء إشعار لمستخدمين محدَّدين أو لجميع المستخدمين النشطين |
| GET | `/admin/notifications?page=&pageSize=` | سجل الإشعارات المُرسلة |

> ⚠️ هذا المسار ينشئ سجلات الإشعار في قاعدة البيانات فقط (ليظهر داخل التطبيق عبر `GET /users/me` أو مسار إشعارات مستخدم لاحق). **الإرسال الفعلي عبر Push (FCM/Web Push) غير منفَّذ بعد** — راجع "الميزات غير المُنفَّذة" في README.

### الإحصائيات — ADMIN وEDITOR

| Method | Path | الوصف |
|---|---|---|
| GET | `/admin/stats/overview` | نظرة عامة: إجمالي المستخدمين، النشطون، الجدد آخر 7 أيام، العلامات المرجعية، اكتمالات الأذكار اليوم، توزيع اللغات |



## رموز الأخطاء الموحّدة

كل خطأ يُعاد بنفس الشكل:

```json
{
  "success": false,
  "statusCode": 400,
  "path": "/api/v1/auth/login",
  "timestamp": "2026-07-18T12:00:00.000Z",
  "message": "..."
}
```
