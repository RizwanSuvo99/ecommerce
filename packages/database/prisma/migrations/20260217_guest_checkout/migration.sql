-- AlterTable: Make userId optional on addresses (for guest addresses)
ALTER TABLE "addresses" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable: Make userId optional on orders and add guest contact fields
ALTER TABLE "orders" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "orders" ADD COLUMN "guestEmail" TEXT;
ALTER TABLE "orders" ADD COLUMN "guestPhone" TEXT;
ALTER TABLE "orders" ADD COLUMN "guestFullName" TEXT;

-- CreateIndex
CREATE INDEX "orders_guestEmail_idx" ON "orders"("guestEmail");
