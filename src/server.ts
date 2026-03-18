import { prisma } from "@/lib/prisma";
import { format_isk, is_str } from "@/lib/utils";
import { web_services_router } from "@/src/routers/web-services";
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
app.use((req, res, next) => {
    res.locals._request_id = randomUUID().replace(/-/g, "");
    res.locals._version = process.env.SOURCE_COMMIT;
    res.locals._generated = new Date().toISOString();
    res.locals._client_ip = req.ip;
    res.locals._pathname = req.path;
    // @ts-expect-error
    res.locals._ratelimit = req.rateLimit;
    res.locals.current_year = new Date().getUTCFullYear();

    next();
});
app.use("/vefthjonustur", web_services_router);

app.get("/health", (_req, res) => {
    return res.status(200).send("OK");
});

app.get("/", (req, res) => {
    return res.render("content/about");
});

app.get("/:receiver_page_id", async (req, res) => {
    if (!is_str(req.params.receiver_page_id)) {
        return res.status(404).render("404");
    }

    const page = await prisma.receiver_page.findUnique({
        where: { id: req.params.receiver_page_id },
        include: {
            title_string: true,
            subtitle_string: true,
            about_card_title_string: true,
            about_card_paragraphs: {
                orderBy: {
                    order: "asc",
                },
            },
            payment_gateway: {
                include: {
                    verifone_connection: true,
                },
            },
            receiver: true,
        },
    });
    if (!page) {
        return res.status(404).render("404");
    }

    console.log(page);

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
        },
        donation_limit: page.donation_limit,
        donation_amount_presets: page.donation_amount_presets.map((preset) => ({
            label: format_isk(preset / 100),
            value: preset / 100,
        })),
        receiver: page.receiver,
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
    console.log(`Server running at http://0.0.0.0:${port}`);
});
