const COMP = {
    EQU: "EQU",
    STR: "STR",
    STR_MID: "STR_MID",
    STR_END: "STR_END",
    MID: "MID",
    MID_MID: "MID_MID",
    MID_END: "MID_END",
    END: "END",
    ANY: "ANY"
};

const CHAR = "*";

class ScouterPatternMatcher {
    comp = COMP.EQU;
    start;
    end;
    mid;
    mid2;
    pattern;

    constructor(pattern = "") {
        this.pattern = pattern;

        if (pattern === "*" || pattern === "**") {
            this.comp = COMP.ANY;
            return;
        }

        const length = pattern.length;
        if (length < 2) {
            this.comp = COMP.EQU;
            this.mid = pattern;
            return;
        }

        const anyStart = pattern.charAt(0) === CHAR;
        const anyEnd = pattern.charAt(length - 1) === CHAR;
        const x = pattern.indexOf(CHAR, 1);
        const anyMid = x > 0 && x < (length - 1);

        if (anyMid) {
            if (anyStart && anyEnd) {
                this.comp = COMP.MID_MID;
                this.mid = pattern.substring(1, x);
                this.mid2 = pattern.substring(x + 1, length - 1);
            } else if (anyStart) {
                this.comp = COMP.MID_END;
                this.mid = pattern.substring(1, x);
                this.end = pattern.substring(x + 1);
            } else if (anyEnd) {
                this.comp = COMP.STR_MID;
                this.start = pattern.substring(0, x);
                this.mid = pattern.substring(x + 1, length - 1);
            } else {
                this.comp = COMP.STR_END;
                this.start = pattern.substring(0, x);
                this.end = pattern.substring(x + 1);
            }
        } else {
            if (anyStart && anyEnd) {
                this.comp = COMP.MID;
                this.mid = pattern.substring(1, length - 1);
            } else if (anyStart) {
                this.comp = COMP.END;
                this.end = pattern.substring(1);
            } else if (anyEnd) {
                this.comp = COMP.STR;
                this.start = pattern.substring(0, length - 1);
            } else {
                this.comp = COMP.EQU;
                this.mid = pattern;
            }
        }
    }

    equals(obj) {
        return this.pattern === obj.pattern;
    }


    include(target) {
        if (!target || target.length === 0)
            return false;

        switch (this.comp) {
            case COMP.ANY:
                return true;
            case COMP.EQU:
                return target === this.mid;
            case COMP.STR:
                return target.startsWith(this.start);
            case COMP.STR_MID:
                return target.startsWith(this.start) && target.indexOf(this.mid) >= 0;
            case COMP.STR_END:
                return target.startsWith(this.start) && target.endsWith(this.end);
            case COMP.MID:
                return target.indexOf(this.mid) >= 0;
            case COMP.MID_MID:
                const x = target.indexOf(this.mid);
                if (x < 0)
                    return false;
                return target.indexOf(this.mid2, x + this.mid.length) >= 0;
            case COMP.MID_END:
                return target.indexOf(this.mid) >= 0 && target.endsWith(this.end);
            case COMP.END:
                return target.endsWith(this.end);
            default:
                return false;
        }
    }

    toString() {
        return this.pattern;
    }

    getPattern() {
        return this.pattern;
    }

    getComp() {
        return this.comp;
    }
}


export default ScouterPatternMatcher;