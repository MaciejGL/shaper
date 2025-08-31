/*
  Warnings:

  - You are about to drop the column `stripeId` on the `Team` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeConnectedAccountId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeConnectedAccountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Team_stripeId_key";

-- AlterTable
ALTER TABLE "public"."Team" DROP COLUMN "stripeId",
ADD COLUMN     "stripeConnectedAccountId" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "stripeConnectedAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Team_stripeConnectedAccountId_key" ON "public"."Team"("stripeConnectedAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_stripeCustomerId_key" ON "public"."Team"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeConnectedAccountId_key" ON "public"."User"("stripeConnectedAccountId");
