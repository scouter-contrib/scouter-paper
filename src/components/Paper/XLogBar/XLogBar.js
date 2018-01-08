import React, {Component} from 'react';
import './XLogBar.css';

class XLogBar extends Component {

    firstStepTimestamp = null;

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {

        if (this.firstStepTimestamp !== nextProps.data.firstStepTimestamp) {
            this.firstStepTimestamp = nextProps.data.firstStepTimestamp;
            return true;
        } else {
            return false;
        }
    }

    componentDidUpdate() {

        let interval = 1000;

        let now = (new Date()).getTime();
        let divs = this.refs.xlogBar.querySelectorAll("div");
        divs.forEach((div) => {
            let endTime = div.getAttribute("data-end-time");
            if (now - endTime > interval * 3) {
                div.remove();
            }
        });


        let base = this.refs.xlogBar;
        if (this.props.data) {
            this.props.data.firstStepXlogs.forEach((xlog) => {
                let exist = base.querySelector("[data-txid='" + xlog.txid + "']");
                if (!exist) {
                    let div = document.createElement("div");
                    let now = (new Date()).getTime();
                    let delay = interval - ((now - xlog.endTime));
                    if (delay < 0) {
                        delay = 100;
                    }
                    div.setAttribute("data-txid", xlog.txid);
                    div.setAttribute("data-end-time", xlog.endTime);

                    if (xlog.error !== "0") {
                        xlog.error
                        div.classList.add("has-error");
                    }

                    div.style.right = "-100px";
                    div.style.transitionDelay = (delay) + "ms";
                    div.style.transitionDuration = "1s";
                    div.style.transitionProperty = "all";
                    div.style.transitionTimingFunction = "ease-in-out";

                    base.appendChild(div);
                    setTimeout(() => {
                        div.style.right = "calc(100% + 20px)";
                        div.style.width = "20px";

                    }, 10);
                }
            });
        }
    }

    componentDidMount() {

    }

    render() {
        return (
            <div className="xlog-bar" ref="xlogBar"></div>
        );
    }
}

export default XLogBar;
