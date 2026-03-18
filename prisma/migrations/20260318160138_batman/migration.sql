-- CreateEnum
CREATE TYPE "translation_string_type" AS ENUM ('RECEIVER_PAGE_UI', 'RECEIVER_PAGE_CUSTOM');

-- CreateEnum
CREATE TYPE "payment_gateway_schemes" AS ENUM ('VISA', 'MASTRO', 'MASTERCARD', 'AMEX', 'DINERS_CLUB', 'JCB', 'DISCOVER', 'UNIONPAY');

-- CreateEnum
CREATE TYPE "payment_gateway_connection" AS ENUM ('VERIFONE');

-- CreateEnum
CREATE TYPE "payment_gateway_currency" AS ENUM ('ISK');

-- CreateTable
CREATE TABLE "receiver" (
    "id" TEXT NOT NULL,
    "dba_name" TEXT,
    "legal_name" TEXT NOT NULL,
    "logo_url" TEXT,
    "registration_id" TEXT NOT NULL,
    "vat_id" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "terms_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receiver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receiver_page" (
    "id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "title_string_key" TEXT NOT NULL,
    "subtitle_string_key" TEXT NOT NULL,
    "about_card_title_string_key" TEXT NOT NULL,
    "payment_gateway_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receiver_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_strings" (
    "key" TEXT NOT NULL,
    "type" "translation_string_type" NOT NULL,
    "literal_is" TEXT NOT NULL,
    "literal_en" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_strings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "payment_gateway" (
    "id" TEXT NOT NULL,
    "connection_type" "payment_gateway_connection" NOT NULL,
    "active_schemes" "payment_gateway_schemes"[],
    "verifone_connection_merchant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifone_connection" (
    "merchant_id" TEXT NOT NULL,
    "currency" "payment_gateway_currency" NOT NULL,
    "user_id" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "merchant_site_id" TEXT NOT NULL,
    "payment_provider_contract_id" TEXT NOT NULL,
    "threed_secure_contract_id" TEXT NOT NULL,
    "public_key_alias" TEXT NOT NULL,
    "public_key_literal" TEXT NOT NULL,
    "token_scope_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifone_connection_pkey" PRIMARY KEY ("merchant_id")
);

-- CreateTable
CREATE TABLE "payment_gateway_connection_transaction" (
    "internal_id" TEXT NOT NULL,
    "amount" INTEGER,
    "currency" "payment_gateway_currency",
    "transaction_time" TIMESTAMP(3),
    "authorization_code" TEXT,
    "acquirer_response_code" TEXT,
    "success_response" JSONB,
    "error_response" JSONB,
    "verifone_connection_merchant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateway_connection_transaction_pkey" PRIMARY KEY ("internal_id")
);

-- AddForeignKey
ALTER TABLE "receiver_page" ADD CONSTRAINT "receiver_page_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "receiver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiver_page" ADD CONSTRAINT "receiver_page_title_string_key_fkey" FOREIGN KEY ("title_string_key") REFERENCES "translation_strings"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiver_page" ADD CONSTRAINT "receiver_page_subtitle_string_key_fkey" FOREIGN KEY ("subtitle_string_key") REFERENCES "translation_strings"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiver_page" ADD CONSTRAINT "receiver_page_about_card_title_string_key_fkey" FOREIGN KEY ("about_card_title_string_key") REFERENCES "translation_strings"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiver_page" ADD CONSTRAINT "receiver_page_payment_gateway_id_fkey" FOREIGN KEY ("payment_gateway_id") REFERENCES "payment_gateway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_gateway" ADD CONSTRAINT "payment_gateway_verifone_connection_merchant_id_fkey" FOREIGN KEY ("verifone_connection_merchant_id") REFERENCES "verifone_connection"("merchant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_gateway_connection_transaction" ADD CONSTRAINT "payment_gateway_connection_transaction_verifone_connection_fkey" FOREIGN KEY ("verifone_connection_merchant_id") REFERENCES "verifone_connection"("merchant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
