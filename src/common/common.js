import jQuery from "jquery";

const get = (url, success, fail, always) => {
    jQuery.ajax({
        method: "GET",
        async: true,
        url: url,
        xhrFields: {
            withCredentials: true
        },
    }).done((msg) => {
        if (msg) {
            console.log(msg);
            if (msg.status === "200" && msg.resultCode === "0" && msg.result) {
                this.props.setUserId(msg.result.id);
            }
        }
    }).fail((jqXHR, textStatus) => {
        console.log(jqXHR, textStatus);
    }).always(() => {
        this.props.setControlVisibility("Loading", false);
    });
}

export default AjaxHelper;