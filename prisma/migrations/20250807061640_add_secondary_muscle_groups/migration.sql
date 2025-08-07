-- CreateTable
CREATE TABLE "_ExerciseSecondaryMuscleGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExerciseSecondaryMuscleGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ExerciseSecondaryMuscleGroups_B_index" ON "_ExerciseSecondaryMuscleGroups"("B");

-- AddForeignKey
ALTER TABLE "_ExerciseSecondaryMuscleGroups" ADD CONSTRAINT "_ExerciseSecondaryMuscleGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "BaseExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseSecondaryMuscleGroups" ADD CONSTRAINT "_ExerciseSecondaryMuscleGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "MuscleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
