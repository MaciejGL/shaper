-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_entityType_entityId_idx" ON "Image"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Image_order_idx" ON "Image"("order");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "exercise_image_fk" FOREIGN KEY ("entityId") REFERENCES "BaseExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
