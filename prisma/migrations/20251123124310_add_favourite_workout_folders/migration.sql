-- AlterTable
ALTER TABLE "FavouriteWorkout" ADD COLUMN     "folderId" TEXT;

-- CreateTable
CREATE TABLE "FavouriteWorkoutFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavouriteWorkoutFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavouriteWorkoutFolder_createdById_idx" ON "FavouriteWorkoutFolder"("createdById");

-- CreateIndex
CREATE INDEX "FavouriteWorkout_folderId_idx" ON "FavouriteWorkout"("folderId");

-- AddForeignKey
ALTER TABLE "FavouriteWorkoutFolder" ADD CONSTRAINT "FavouriteWorkoutFolder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteWorkout" ADD CONSTRAINT "FavouriteWorkout_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "FavouriteWorkoutFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
