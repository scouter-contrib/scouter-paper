const PLUS = 'x';
const MINUS = 'z';

export const IdAbbr = {
    abbr: abbr,
    toString32: toString32,
    toInt32: toInt32
};

function abbr(numString) {
    if (!numString) {
        return "";
    }
    const number = Number(numString.substring(Math.max(0, numString.length - 8)));
    return number.toString(32);
}

function toString32(num) {
    const minus = num < 0;

    if (minus) {
        let rad32 = MINUS + (-num).toString(32);
        return rad32;

    } else {
        let rad32 = PLUS + num.toString(32);
        return rad32;
    }
}

function toInt32(str) {
    if (!str)
        return 0;

    switch (str.charAt(0)) {
        case MINUS:
            return -1 * parseInt(str.substring(1), 32);
        case PLUS:
            return parseInt(str.substring(1), 32);
        default:
            return 0;
    }
}




