import { PrismaClient, AzkarPeriod, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedFirstAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.log(
      'ℹ️  ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD not set — skipping first-admin creation. ' +
        'Set both in .env and re-run "npx prisma db seed" to create one, or promote an ' +
        'existing user to ADMIN manually (see INSTALLATION.md).',
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`ℹ️  Admin user ${email} already exists — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'مدير المنصة',
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });
  // eslint-disable-next-line no-console
  console.log(`✅ Created first admin user: ${admin.email}`);
}

async function main() {
  await seedFirstAdmin();

  const existingCategories = await prisma.azkarCategory.count();
  if (existingCategories > 0) {
    // eslint-disable-next-line no-console
    console.log(`ℹ️  ${existingCategories} azkar categories already exist — skipping content seed.`);
    await prisma.$disconnect();
    return;
  }

  const morning = await prisma.azkarCategory.create({
    data: {
      period: AzkarPeriod.MORNING,
      titleAr: 'أذكار الصباح',
      titleEn: 'Morning Remembrance',
      titleTr: 'Sabah Zikirleri',
      order: 1,
      items: {
        create: [
          {
            textAr: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
            repeatCount: 1,
            source: 'رواه مسلم',
            order: 1,
          },
          {
            textAr: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ (سيد الاستغفار)',
            repeatCount: 1,
            source: 'رواه البخاري',
            order: 2,
          },
          {
            textAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
            repeatCount: 100,
            source: 'رواه مسلم',
            order: 3,
          },
        ],
      },
    },
  });

  const evening = await prisma.azkarCategory.create({
    data: {
      period: AzkarPeriod.EVENING,
      titleAr: 'أذكار المساء',
      titleEn: 'Evening Remembrance',
      titleTr: 'Akşam Zikirleri',
      order: 2,
      items: {
        create: [
          {
            textAr: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
            repeatCount: 1,
            source: 'رواه مسلم',
            order: 1,
          },
          {
            textAr: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
            repeatCount: 3,
            source: 'رواه مسلم',
            order: 2,
          },
        ],
      },
    },
  });

  const sleep = await prisma.azkarCategory.create({
    data: {
      period: AzkarPeriod.SLEEP,
      titleAr: 'أذكار النوم',
      titleEn: 'Before Sleep',
      titleTr: 'Uyku Zikirleri',
      order: 3,
      items: {
        create: [
          {
            textAr: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
            repeatCount: 1,
            source: 'رواه البخاري',
            order: 1,
          },
        ],
      },
    },
  });

  const afterPrayer = await prisma.azkarCategory.create({
    data: {
      period: AzkarPeriod.AFTER_PRAYER,
      titleAr: 'أذكار بعد الصلاة',
      titleEn: 'After Prayer',
      titleTr: 'Namaz Sonrası Zikirler',
      order: 4,
      items: {
        create: [
          { textAr: 'أَسْتَغْفِرُ اللَّهَ', repeatCount: 3, source: 'رواه مسلم', order: 1 },
          { textAr: 'سُبْحَانَ اللَّهِ', repeatCount: 33, order: 2 },
          { textAr: 'الْحَمْدُ لِلَّهِ', repeatCount: 33, order: 3 },
          { textAr: 'اللَّهُ أَكْبَرُ', repeatCount: 34, order: 4 },
        ],
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('✅ Seeded categories:', {
    morning: morning.id,
    evening: evening.id,
    sleep: sleep.id,
    afterPrayer: afterPrayer.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
