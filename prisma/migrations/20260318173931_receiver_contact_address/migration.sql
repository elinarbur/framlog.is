-- CreateEnum
CREATE TYPE "receiver_address_format" AS ENUM ('IS', 'ZZ');

-- AlterTable
ALTER TABLE "receiver" ADD COLUMN     "address_format" "receiver_address_format" NOT NULL DEFAULT 'IS',
ADD COLUMN     "contact_address" TEXT,
ADD COLUMN     "contact_city" TEXT,
ADD COLUMN     "contact_postcode" TEXT;
