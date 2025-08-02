-- CreateTable
CREATE TABLE "FavouriteWorkout" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavouriteWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavouriteWorkoutExercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "baseId" TEXT,
    "favouriteWorkoutId" TEXT NOT NULL,
    "restSeconds" INTEGER,
    "instructions" TEXT,

    CONSTRAINT "FavouriteWorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavouriteWorkoutSet" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "reps" INTEGER,
    "minReps" INTEGER,
    "maxReps" INTEGER,
    "weight" DOUBLE PRECISION,
    "rpe" INTEGER,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "FavouriteWorkoutSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavouriteWorkout_createdById_idx" ON "FavouriteWorkout"("createdById");

-- CreateIndex
CREATE INDEX "FavouriteWorkoutExercise_favouriteWorkoutId_idx" ON "FavouriteWorkoutExercise"("favouriteWorkoutId");

-- CreateIndex
CREATE INDEX "FavouriteWorkoutExercise_baseId_idx" ON "FavouriteWorkoutExercise"("baseId");

-- CreateIndex
CREATE INDEX "FavouriteWorkoutSet_exerciseId_idx" ON "FavouriteWorkoutSet"("exerciseId");

-- AddForeignKey
ALTER TABLE "FavouriteWorkout" ADD CONSTRAINT "FavouriteWorkout_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteWorkoutExercise" ADD CONSTRAINT "FavouriteWorkoutExercise_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "BaseExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteWorkoutExercise" ADD CONSTRAINT "FavouriteWorkoutExercise_favouriteWorkoutId_fkey" FOREIGN KEY ("favouriteWorkoutId") REFERENCES "FavouriteWorkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteWorkoutSet" ADD CONSTRAINT "FavouriteWorkoutSet_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "FavouriteWorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
