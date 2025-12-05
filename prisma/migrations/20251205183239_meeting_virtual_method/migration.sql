-- CreateEnum
CREATE TYPE "VirtualMethod" AS ENUM ('VIDEO_CALL', 'PHONE', 'WHATSAPP', 'OTHER');

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "virtualMethod" "VirtualMethod";
