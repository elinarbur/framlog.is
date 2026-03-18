-- AlterTable
ALTER TABLE "translation_strings" ADD COLUMN     "receiver_page_about_card_paragraph_id" TEXT;

-- AddForeignKey
ALTER TABLE "translation_strings" ADD CONSTRAINT "translation_strings_receiver_page_about_card_paragraph_id_fkey" FOREIGN KEY ("receiver_page_about_card_paragraph_id") REFERENCES "receiver_page"("id") ON DELETE SET NULL ON UPDATE CASCADE;
