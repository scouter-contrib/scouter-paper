export default class ElementType {

    static defaultProps = {
        USER     : "0",
        SERVICE  : "1",
        API_CALL : "2",
        SQL      : "3",
        DISPATCH : "4",
        THREAD   : "5",

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
        ,
        toColor(value){
            switch(value){
                case this.USER : return "#aeaeae";
                case this.SERVICE : return "#6e40aa";
                case this.API_CALL : return "#417de0";
                case this.SQL : return "#1ac7c2";
                case this.DISPATCH : return "#c9510c";
                case this.THREAD : return "#76b852";
                default:
                    return "#003666";
            }
        }
    };
}

