-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
