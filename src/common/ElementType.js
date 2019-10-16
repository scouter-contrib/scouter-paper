export default class ElementType {

    static defaultProps = {
        USER : "0",
        SERVICE : "1",
        API_CALL : "2",
        SQL : "3",
        DISPATCH : "4",
        THREAD : "5",

        toString(value) {
            switch(value){
                case this.USER : return "USER";
                case this.SERVICE : return "SERVICE";
                case this.API_CALL : return "API_CALL";
                case this.SQL : return "SQL";
                case this.DISPATCH : return "DISPATCH";
                case this.THREAD : return "THREAD";
                default:
                    return "UNKNOWN";
            }
        }
    };
}

