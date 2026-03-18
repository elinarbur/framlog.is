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
