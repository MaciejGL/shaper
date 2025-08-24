/*
  Warnings:

  - The values [TRAINING_PLAN,COACHING] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ServiceType_new" AS ENUM ('WORKOUT_PLAN', 'MEAL_PLAN', 'COACHING_COMPLETE', 'IN_PERSON_MEETING', 'PREMIUM_ACCESS');
ALTER TABLE "public"."PackageService" ALTER COLUMN "serviceType" TYPE "public"."ServiceType_new" USING ("serviceType"::text::"public"."ServiceType_new");
ALTER TABLE "public"."ServiceUsage" ALTER COLUMN "serviceType" TYPE "public"."ServiceType_new" USING ("serviceType"::text::"public"."ServiceType_new");
ALTER TABLE "public"."TrainerCommission" ALTER COLUMN "serviceType" TYPE "public"."ServiceType_new" USING ("serviceType"::text::"public"."ServiceType_new");
ALTER TABLE "public"."OneTimePurchase" ALTER COLUMN "serviceType" TYPE "public"."ServiceType_new" USING ("serviceType"::text::"public"."ServiceType_new");
ALTER TYPE "public"."ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "public"."ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "public"."ServiceType_old";
COMMIT;
