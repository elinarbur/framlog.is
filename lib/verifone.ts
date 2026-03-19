import { T_Verifone_Connection } from "@/services/payment-gateway.service";
import z from "zod";
import { is_timeout, ValueOf } from "./utils";

export const generate_bearer_from_connection = (verifone_connection: T_Verifone_Connection) => {
    return Buffer.from(`${verifone_connection.user_id}:${verifone_connection.api_key}`).toString("base64");
};

export const CREATE_3DS_JWT_ERRORS = {
    fetch: "Verifone_Create_3ds_Jwt_Fetch_Error",
    timeout: "Verifone_Create_3ds_Jwt_Timeout_Error",
    bad_request: "Verifone_Create_3ds_Jwt_Bad_Request_Error",
    authorization: "Verifone_Create_3ds_Jwt_Authorization_Error",
    access: "Verifone_Create_3ds_Jwt_Access_Error",
    not_found: "Verifone_Create_3ds_Jwt_Not_Found_Error",
    verifone_server: "Verifone_Create_3ds_Jwt_Verifone_Server_Error",
    verifone_gateway: "Verifone_Create_3ds_Jwt_Verifone_Gateway_Timeout_Error",
    server: "Verifone_Create_3ds_Jwt_Server_Error",
    lexing: "Verifone_Create_3ds_Jwt_Lexing_Error",
    parsing: "Verifone_Create_3ds_Jwt_Parsing_Error",
} as const;

export const CREATE_3DS_JWT_ERRTYPES = {
    verifone: "verifone",
    client: "client",
    unknown: "unknown",
} as const;

export const create_3ds_jwt = async (
    verifone_connection: T_Verifone_Connection,
): Promise<[string] | [null, ValueOf<typeof CREATE_3DS_JWT_ERRORS>, ValueOf<typeof CREATE_3DS_JWT_ERRTYPES>, any?]> => {
    const request_url = `${process.env.VERIFONE_API_URL!}/oidc/3ds-service/v2/jwt/create`;

    let res;
    try {
        res = await fetch(request_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Basic ${generate_bearer_from_connection(verifone_connection)}`,
            },
            signal: AbortSignal.timeout(5_000),
            body: JSON.stringify({ threeds_contract_id: verifone_connection.threed_secure_contract_id }),
        });
    } catch (e) {
        if (is_timeout(e)) {
            return [null, CREATE_3DS_JWT_ERRORS.timeout, CREATE_3DS_JWT_ERRTYPES.unknown];
        }

        return [null, CREATE_3DS_JWT_ERRORS.fetch, CREATE_3DS_JWT_ERRTYPES.unknown];
    }

    if (!res.ok) {
        let json;
        try {
            json = await res.json();
            if (json) {
                json = JSON.stringify(json, null, 1);
            }
        } catch {}

        let body;
        try {
            if (!json) {
                body = await res.text();
            }
        } catch {}

        switch (res.status) {
            case 400: {
                return [null, CREATE_3DS_JWT_ERRORS.bad_request, CREATE_3DS_JWT_ERRTYPES.client, json ?? body];
            }

            case 401: {
                return [null, CREATE_3DS_JWT_ERRORS.authorization, CREATE_3DS_JWT_ERRTYPES.client, json ?? body];
            }

            case 403: {
                return [null, CREATE_3DS_JWT_ERRORS.access, CREATE_3DS_JWT_ERRTYPES.client, json ?? body];
            }

            case 404: {
                return [null, CREATE_3DS_JWT_ERRORS.not_found, CREATE_3DS_JWT_ERRTYPES.client, json ?? body];
            }

            case 500: {
                return [null, CREATE_3DS_JWT_ERRORS.verifone_server, CREATE_3DS_JWT_ERRTYPES.verifone, json ?? body];
            }

            case 504: {
                return [null, CREATE_3DS_JWT_ERRORS.verifone_gateway, CREATE_3DS_JWT_ERRTYPES.verifone, json ?? body];
            }
        }

        return [null, CREATE_3DS_JWT_ERRORS.server, CREATE_3DS_JWT_ERRTYPES.verifone, json ?? body];
    }

    let json;
    try {
        json = await res.json();
    } catch (e) {
        return [null, CREATE_3DS_JWT_ERRORS.lexing, CREATE_3DS_JWT_ERRTYPES.unknown];
    }

    const { data } = z.object({ jwt: z.string() }).safeParse(json);
    if (!data) {
        return [null, CREATE_3DS_JWT_ERRORS.parsing, CREATE_3DS_JWT_ERRTYPES.unknown];
    }

    return [data.jwt];
};
