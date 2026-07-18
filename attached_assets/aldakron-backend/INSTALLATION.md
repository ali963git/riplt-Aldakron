# دليل التثبيت — Aldakron Backend

## المتطلبات الأساسية

- Node.js 20 أو أحدث
- npm 10 أو أحدث
- Docker + Docker Compose (لتشغيل PostgreSQL محليًا، أو استخدم قاعدة بيانات PostgreSQL موجودة لديك)
- Git

## 1) استنساخ المشروع وتثبيت الحزم

```bash
cd aldakron-backend
npm install
```

> ملاحظة: هذا الأمر يحتاج اتصالاً بالإنترنت لتحميل الحزم من npm registry.

## 2) إعداد متغيرات البيئة

```bash
cp .env.example .env
```

افتح `.env` وعدّل القيم التالية **إلزاميًا** قبل التشغيل:

| المتغيّر | الوصف | كيفية التوليد |
|---|---|---|
| `DATABASE_URL` | رابط اتصال PostgreSQL | يُبنى تلقائيًا إذا استخدمت docker-compose أدناه |
| `JWT_ACCESS_SECRET` | مفتاح توقيع رمز الدخول (32+ حرفًا) | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | مفتاح مختلف تمامًا لتجديد الجلسة | `openssl rand -hex 32` |
| `CORS_ORIGINS` | نطاقات الواجهة الأمامية المسموح بها | مثال: `http://localhost:3000` |

⚠️ **لا تستخدم القيم الافتراضية في ملف `.env.example` في الإنتاج أبدًا.**

## 3) تشغيل قاعدة البيانات

### خيار أ: عبر Docker Compose (موصى به للتطوير المحلي)

```bash
docker compose up -d postgres
```

سيتم تشغيل PostgreSQL على المنفذ `5432` مع تخزين دائم عبر Docker volume.

### خيار ب: قاعدة بيانات PostgreSQL موجودة لديك

عدّل `DATABASE_URL` في `.env` لتشير إلى قاعدتك الخاصة.

## 4) تطبيق ترحيلات قاعدة البيانات (Migrations)

```bash
npx prisma migrate dev --name init
```

هذا الأمر ينشئ جميع الجداول المعرّفة في `prisma/schema.prisma` (المستخدمون، العلامات المرجعية، الأذكار، إعدادات الصلاة... إلخ).

## 5) تعبئة بيانات الأذكار الأساسية والحساب الإداري الأول (Seed)

لإنشاء أول حساب **ADMIN** تلقائيًا، عيّن هذين المتغيّرين في `.env` قبل تشغيل الـ seed:

```bash
ADMIN_SEED_EMAIL=admin@aldakron.app
ADMIN_SEED_PASSWORD="Str0ngPassword!"
```

ثم نفّذ:

```bash
npx prisma db seed
```

يضيف هذا تصنيفات وأذكار الصباح/المساء/النوم/بعد الصلاة كبيانات حقيقية أولية، بالإضافة إلى حساب المدير إن حُدّدت بياناته.

> إن كنت تفضّل عدم وضع كلمة مرور في ملف `.env`، اترك المتغيّرين فارغين، أنشئ حسابًا عاديًا عبر `POST /api/v1/auth/register`، ثم رقِّه يدويًا إلى ADMIN عبر Prisma Studio (`npx prisma studio`) بتغيير حقل `role` إلى `ADMIN`.

## 6) تشغيل الخادم

### وضع التطوير (مع إعادة التحميل التلقائي)

```bash
npm run start:dev
```

### وضع الإنتاج

```bash
npm run build
npm run start:prod
```

الخادم سيعمل افتراضيًا على: `http://localhost:4000/api`
توثيق Swagger التفاعلي: `http://localhost:4000/api/docs`
فحص الصحة: `http://localhost:4000/api/health`

## 7) التشغيل الكامل عبر Docker (خادم + قاعدة بيانات معًا)

```bash
docker compose up -d --build
```

هذا يبني صورة الخادم من `Dockerfile` (multi-stage build، يعمل كمستخدم غير root) ويشغّله مع PostgreSQL معًا.

بعد أول تشغيل، نفّذ الترحيلات والـ seed داخل الحاوية:

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

## 8) التحقق من التثبيت

```bash
curl http://localhost:4000/api/health
# المتوقع: {"status":"ok","database":"connected",...}

curl http://localhost:4000/api/quran/surahs
# المتوقع: قائمة بالسور الـ 114 (يتطلب اتصالاً بالإنترنت من الخادم للوصول إلى Al-Quran Cloud API)
```

## استكشاف الأخطاء الشائعة

| المشكلة | الحل |
|---|---|
| `❌ Invalid environment configuration` عند الإقلاع | تأكد أن `JWT_ACCESS_SECRET` و`JWT_REFRESH_SECRET` كل منهما 32 حرفًا على الأقل ومختلفان عن بعضهما |
| فشل الاتصال بقاعدة البيانات | تأكد من تشغيل `docker compose up -d postgres` وأن `DATABASE_URL` صحيح |
| أخطاء 502 من مسارات `/quran/*` أو `/prayer/*` | هذه المسارات تعتمد على APIs خارجية حقيقية (Al-Quran Cloud وAladhan)؛ تأكد أن للخادم اتصالاً صادرًا بالإنترنت |
| `EADDRINUSE` عند التشغيل | غيّر `PORT` في `.env` أو أوقف العملية التي تستخدم المنفذ 4000 |

## الخطوات التالية (تسليمات لاحقة)

- ربط الواجهة الأمامية (Next.js) بهذا الـ API عبر `NEXT_PUBLIC_API_URL`
- بناء لوحة تحكم Admin كاملة فوق `RolesGuard` الموجود
- تكامل Push Notifications الفعلي (FCM / Web Push) فوق نماذج `DeviceToken`/`Notification`
- بناء المساعد الإسلامي الذكي كخدمة منفصلة
