import bigInt from 'big-integer';

const PLUS = 'x';
const MINUS = 'z';

export const IdAbbr = {
    abbr: abbr,
    toString32: toString32,
    toLong32: toLong32
};

function abbr(numString) {
    if (!numString) {
        return "";
    }
    const number =  bigInt(numString);
    //Number(numString.substring(Math.max(0, numString.length - 8)));
    return toString32(number);
}

function toString32(num) {
    const minus = num < 0;
    if (minus) {
        let rad32 = MINUS + num.toString(32).replace("-","");
        return rad32;

    } else {
        let rad32 = PLUS + num.toString(32);
        return rad32;
    }
}

function toLong32(str) {
    if (!str)
        return '0';

    switch (str.charAt(0)) {
        case MINUS:
            return bigInt("-"+str.substring(1), 32).toString();
        case PLUS:
            return bigInt(str.substring(1), 32).toString();
        default:
            return bigInt(str).toString();
    }
}




