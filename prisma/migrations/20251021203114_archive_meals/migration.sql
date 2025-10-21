-- AlterTable
ALTER TABLE "public"."Meal" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Meal_teamId_archived_idx" ON "public"."Meal"("teamId", "archived");
