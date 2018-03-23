import * as common from './common';

class ServerDate {
    constructor(props) {
        if(props) {
            return new Date(new Date(props).valueOf() + common.getServerTimeGap());
        } else {
            return new Date(new Date().valueOf() + common.getServerTimeGap());
        }
    }
}

export default ServerDate;
