-- DropForeignKey
ALTER TABLE "public"."PersonalRecord" DROP CONSTRAINT "PersonalRecord_baseExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PersonalRecord" DROP CONSTRAINT "PersonalRecord_dayId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PersonalRecord" DROP CONSTRAINT "PersonalRecord_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."PersonalRecord" ADD CONSTRAINT "PersonalRecord_baseExerciseId_fkey" FOREIGN KEY ("baseExerciseId") REFERENCES "public"."BaseExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalRecord" ADD CONSTRAINT "PersonalRecord_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."TrainingDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalRecord" ADD CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
