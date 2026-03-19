import { ENABLED_LANGUAGES } from "@/lib/i18n";
import { format_icelandic_tel, format_isk, format_kennitala, is_str, srs_render } from "@/lib/utils";
import { create_3ds_jwt } from "@/lib/verifone";
import { get_verifone_connection_by_merchant_id } from "@/services/payment-gateway.service";
import { get_receiver_page_by_id } from "@/services/receiver-page.service";
import { web_services_router } from "@/src/routers/web-services";
import { parse as parse_languages } from "accept-language-parser";
import cookie_parser from "cookie-parser";
import { randomUUID } from "crypto";
import express from "express";
import rateLimit from "express-rate-limit";

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 900 * 1000,
        standardHeaders: "draft-6",
        legacyHeaders: false,
        ipv6Subnet: 56,
    }),
);
app.set("trust proxy", 1);
app.use("/", express.static("webroot"));
app.use("/public/static", express.static("static"));
app.use(cookie_parser());
app.use((req, res, next) => {
    let user_lang = "is";

    const language_cookie = req.cookies[process.env.LANGUAGE_COOKIE_NAME!];
    const accept_language = req.headers["accept-language"];
    if (is_str(language_cookie) && ENABLED_LANGUAGES.includes(language_cookie.toLowerCase())) {
        user_lang = language_cookie.toLowerCase();
    } else if (is_str(accept_language)) {
        for (const language of parse_languages(accept_language)) {
            if (ENABLED_LANGUAGES.includes(language.code.toLowerCase())) {
                user_lang = language.code.toLowerCase();
                break;
            }
        }
    }

    res.locals._request_id = randomUUID().replace(/-/g, "");
    res.locals._version = process.env.SOURCE_COMMIT;
    res.locals._generated = new Date().toISOString();
    res.locals._client_ip = req.ip;
    res.locals._pathname = req.path;
    // @ts-expect-error
    res.locals._ratelimit = req.rateLimit;
    res.locals.current_year = new Date().getUTCFullYear();
    res.locals.user_lang = user_lang;

    next();
});
app.use("/vefthjonustur", web_services_router);

app.get("/health", (_req, res) => {
    return res.status(200).send("OK");
});

app.get("/", (_req, res) => {
    return res.render("content/about");
});

app.get("/is", (_req, res) => {
    return res.status(307).cookie(process.env.LANGUAGE_COOKIE_NAME!, "is").redirect("/");
});

app.get("/en", (_req, res) => {
    return res.status(307).cookie(process.env.LANGUAGE_COOKIE_NAME!, "en").redirect("/");
});

app.get("/srs/verifone-3ds.js", async (req, res) => {
    const merchant_id = req.query.merchant_id;
    if (!is_str(merchant_id)) {
        return srs_render(res, "ssr-scripts/verifone-3ds", { error: "Missing merchant ID." });
    }

    const verifone_connection = await get_verifone_connection_by_merchant_id(merchant_id);
    if (!verifone_connection) {
        return srs_render(res, "ssr-scripts/verifone-3ds", { error: "Invalid merchant ID." });
    }

    const [jwt, error_code, error_type] = await create_3ds_jwt(verifone_connection);
    if (!jwt) {
        console.log(`lib/verifone.ts error code: ${error_code}, error side: ${error_type}`);

        return srs_render(res, "ssr-scripts/verifone-3ds", { error: error_code });
    }

    return srs_render(res, "ssr-scripts/verifone-3ds", { vfi: verifone_connection, jwt });
});

app.get("/:receiver_page_id", async (req, res) => {
    if (!is_str(req.params.receiver_page_id)) {
        return res.status(404).render("404");
    }

    const page = await get_receiver_page_by_id(req.params.receiver_page_id);
    if (!page) {
        return res.contentType("application/xml").status(404).render("404");
    }

    const i18n = {
        title: page.title_string.literal_is,
        subtitle: page.subtitle_string.literal_is,
        about_card: {
            title: page.about_card_title_string.literal_is,
            paragraphs: page.about_card_paragraphs.map((p) => p.literal_is),
        },
    };

    return res.render("content/home", {
        i18n,
        payment_gateway: {
            id: page.payment_gateway.id,
            active_schemes: page.payment_gateway.active_schemes,
            verifone_connection_merchant_id: page.payment_gateway.verifone_connection.merchant_id,
        },
        donation_limit: page.donation_limit,
        donation_amount_presets: page.donation_amount_presets.map((preset) => ({
            label: format_isk(preset / 100),
            value: preset / 100,
        })),
        receiver: {
            ...page.receiver,
            registration_id: format_kennitala(page.receiver.registration_id),
            contact_phone: page.receiver.contact_phone ? format_icelandic_tel(page.receiver.contact_phone) : null,
        },
        verifone_js: process.env.VERIFONE_JS_URL!,
        songbird_js: process.env.SONGBIRD_JS_URL!,
    });
});

app.use((_req, res) => {
    res.render("404", {}, (err, html) => {
        if (err) {
            return res.status(500);
        }

        return res.status(404).setHeader("Content-Type", "application/xml").send(html);
    });
});

app.listen(port, () => {
    if (!is_str(process.env.LANGUAGE_COOKIE_NAME)) {
        console.error("Please set the `LANGUAGE_COOKIE_NAME` environment variable.");

        return process.exit(10);
    }

    if (!is_str(process.env.VERIFONE_JS_URL)) {
        console.error("Please set the `VERIFONE_JS_URL` environment variable.");

        return process.exit(20);
    }

    if (!is_str(process.env.SONGBIRD_JS_URL)) {
        console.error("Please set the `SONGBIRD_JS_URL` environment variable.");

        return process.exit(30);
    }

    if (!is_str(process.env.VERIFONE_API_URL)) {
        console.error("Please set the `VERIFONE_API_URL` environment variable.");

        return process.exit(40);
    }

    console.log(`Server running at http://0.0.0.0:${port}`);
});
