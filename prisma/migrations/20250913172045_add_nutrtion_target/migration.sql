-- CreateTable
CREATE TABLE "public"."MacroTarget" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "calories" INTEGER,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MacroTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MacroTarget_clientId_key" ON "public"."MacroTarget"("clientId");

-- CreateIndex
CREATE INDEX "MacroTarget_clientId_idx" ON "public"."MacroTarget"("clientId");

-- CreateIndex
CREATE INDEX "MacroTarget_trainerId_idx" ON "public"."MacroTarget"("trainerId");

-- AddForeignKey
ALTER TABLE "public"."MacroTarget" ADD CONSTRAINT "MacroTarget_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MacroTarget" ADD CONSTRAINT "MacroTarget_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
