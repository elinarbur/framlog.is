import { type Response } from "express";
import { minify } from "uglify-js";

export const is_str = (q: any): q is string => {
    if (typeof q === "string") {
        return true;
    }

    return false;
};

export const sleep = async (msec: number) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(msec), msec);
    });
};

export const normalise_numstr = (numstr: string) => {
    let normalised = "";
    for (const char of numstr) {
        switch (char) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9": {
                normalised += char;
            }
        }
    }

    return normalised;
};

export const format_isk = (amount: string | number) => {
    return normalise_numstr(String(amount))
        .split("")
        .reverse()
        .reduce(
            (acc, digit, index) => {
                if (index !== 0 && index % 3 === 0) {
                    acc.push(".");
                }
                acc.push(digit);
                return acc;
            },
            <string[]>[],
        )
        .reverse()
        .join("");
};

export const format_kennitala = (kennitala: string | number) => {
    const kt = String(kennitala).match(/[0-9]/g);
    if (!kt) {
        return null;
    }

    const normalized = kt.join("");

    return `${normalized.substring(0, 6)}-${normalized.substring(6, 10)}`;
};

export const format_icelandic_tel = (tel: string | number) => {
    const telnr = String(tel);

    return `${telnr.substring(0, 3)} ${telnr.substring(3, 7)}`;
};

export type ValueOf<T> = T[keyof T];

export const is_timeout = (e: any): e is Error => {
    return e instanceof Error && e.name === "TimeoutError";
};

export const stringify_error = (error: any) => {
    if (error instanceof Error) {
        return `${error}\n\nTrace: ${error?.stack ?? "N/A"}`;
    }

    return `${error}`;
};

export const srs_render = (res: Response, srs: string, data?: any & {}) => {
    return res.render(srs, data, (err, html) => {
        if (err) {
            return res.contentType("text/plain").status(500).send(stringify_error(err));
        }

        const split = html.split("\n");
        const script_tags_removed = split.slice(1, split.length - 2).join("\n");
        const minified = minify(script_tags_removed, { mangle: false, sourceMap: false, output: { comments: "all" } });
        if (minified.error) {
            return res.contentType("text/plain").status(500).send(stringify_error(err));
        }

        return res.contentType("text/javascript").status(400).send(minified.code);
    });
};
