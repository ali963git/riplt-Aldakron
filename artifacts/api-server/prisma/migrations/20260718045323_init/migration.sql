-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CalculationMethod" AS ENUM ('MWL', 'ISNA', 'EGYPT', 'MAKKAH', 'KARACHI', 'TEHRAN', 'JAFARI');

-- CreateEnum
CREATE TYPE "AzkarPeriod" AS ENUM ('MORNING', 'EVENING', 'SLEEP', 'AFTER_PRAYER', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PRAYER', 'AZKAR', 'DAILY_WIRD', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quran_bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "ayahNumber" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quran_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quran_favorite_ayahs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "ayahNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quran_favorite_ayahs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quran_last_read" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "surahNumber" INTEGER NOT NULL,
    "ayahNumber" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quran_last_read_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "azkar_categories" (
    "id" TEXT NOT NULL,
    "period" "AzkarPeriod" NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleTr" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "azkar_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "azkar_items" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "textAr" TEXT NOT NULL,
    "textEn" TEXT,
    "textTr" TEXT,
    "repeatCount" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "azkar_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "azkar_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "azkarItemId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "azkar_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timezone" TEXT NOT NULL,
    "calculationMethod" "CalculationMethod" NOT NULL DEFAULT 'MWL',
    "notifyFajr" BOOLEAN NOT NULL DEFAULT true,
    "notifyDhuhr" BOOLEAN NOT NULL DEFAULT true,
    "notifyAsr" BOOLEAN NOT NULL DEFAULT true,
    "notifyMaghrib" BOOLEAN NOT NULL DEFAULT true,
    "notifyIsha" BOOLEAN NOT NULL DEFAULT true,
    "reminderMinutesBefore" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prayer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "titleAr" TEXT NOT NULL,
    "bodyAr" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "quran_bookmarks_userId_idx" ON "quran_bookmarks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "quran_bookmarks_userId_surahNumber_ayahNumber_key" ON "quran_bookmarks"("userId", "surahNumber", "ayahNumber");

-- CreateIndex
CREATE INDEX "quran_favorite_ayahs_userId_idx" ON "quran_favorite_ayahs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "quran_favorite_ayahs_userId_surahNumber_ayahNumber_key" ON "quran_favorite_ayahs"("userId", "surahNumber", "ayahNumber");

-- CreateIndex
CREATE UNIQUE INDEX "quran_last_read_userId_key" ON "quran_last_read"("userId");

-- CreateIndex
CREATE INDEX "azkar_items_categoryId_idx" ON "azkar_items"("categoryId");

-- CreateIndex
CREATE INDEX "azkar_progress_userId_date_idx" ON "azkar_progress"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "azkar_progress_userId_azkarItemId_date_key" ON "azkar_progress"("userId", "azkarItemId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "prayer_settings_userId_key" ON "prayer_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_userId_idx" ON "device_tokens"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "admin_audit_logs_adminId_idx" ON "admin_audit_logs"("adminId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quran_bookmarks" ADD CONSTRAINT "quran_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quran_favorite_ayahs" ADD CONSTRAINT "quran_favorite_ayahs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "azkar_items" ADD CONSTRAINT "azkar_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "azkar_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "azkar_progress" ADD CONSTRAINT "azkar_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "azkar_progress" ADD CONSTRAINT "azkar_progress_azkarItemId_fkey" FOREIGN KEY ("azkarItemId") REFERENCES "azkar_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_settings" ADD CONSTRAINT "prayer_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
