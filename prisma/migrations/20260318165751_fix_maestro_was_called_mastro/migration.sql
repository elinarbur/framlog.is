/*
  Warnings:

  - The values [MASTRO] on the enum `payment_gateway_schemes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "payment_gateway_schemes_new" AS ENUM ('VISA', 'MAESTRO', 'MASTERCARD', 'AMEX', 'DINERS_CLUB', 'JCB', 'DISCOVER', 'UNIONPAY');
ALTER TABLE "payment_gateway" ALTER COLUMN "active_schemes" TYPE "payment_gateway_schemes_new"[] USING ("active_schemes"::text::"payment_gateway_schemes_new"[]);
ALTER TYPE "payment_gateway_schemes" RENAME TO "payment_gateway_schemes_old";
ALTER TYPE "payment_gateway_schemes_new" RENAME TO "payment_gateway_schemes";
DROP TYPE "public"."payment_gateway_schemes_old";
COMMIT;
