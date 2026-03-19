import { prisma } from "@/lib/prisma";

export const get_receiver_page_by_id = async (id: string) => {
    return await prisma.receiver_page.findUnique({
        where: { id },
        include: {
            title_string: {
                omit: {
                    type: true,
                    order: true,
                    receiver_page_about_card_paragraph_id: true,
                },
            },
            subtitle_string: {
                omit: {
                    type: true,
                    order: true,
                    receiver_page_about_card_paragraph_id: true,
                },
            },
            about_card_title_string: {
                omit: {
                    type: true,
                    order: true,
                    receiver_page_about_card_paragraph_id: true,
                },
            },
            about_card_paragraphs: {
                orderBy: {
                    order: "asc",
                },
                omit: {
                    type: true,
                    order: true,
                    receiver_page_about_card_paragraph_id: true,
                },
            },
            payment_gateway: {
                include: {
                    verifone_connection: true,
                },
                omit: {
                    verifone_connection_merchant_id: true,
                },
            },
            receiver: true,
        },
        omit: {
            receiver_id: true,
            title_string_key: true,
            subtitle_string_key: true,
            about_card_title_string_key: true,
            payment_gateway_id: true,
        },
    });
};

export type T_Receiver_Page = NonNullable<Awaited<ReturnType<typeof get_receiver_page_by_id>>>;
