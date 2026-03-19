import { prisma } from "@/lib/prisma";

export const get_verifone_connection_by_merchant_id = async (merchant_id: string) => {
    return await prisma.verifone_connection.findUnique({
        where: { merchant_id },
    });
};

export type T_Verifone_Connection = NonNullable<Awaited<ReturnType<typeof get_verifone_connection_by_merchant_id>>>;
