import React, {Component} from 'react';
import './XLogPipe.css';

class XLogPipe extends Component {

    firstStepTimestamp = null;

    shouldComponentUpdate(nextProps, nextState) {
        if (this.firstStepTimestamp !== nextProps.firstStepTimestamp) {
            this.firstStepTimestamp = nextProps.firstStepTimestamp;
            return true;
        } else {
            return false;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let interval = 1000;


        let now = (new Date()).getTime();
        let divs = this.refs.xlogPipe.querySelectorAll("div");
        divs.forEach((div) => {
            let endTime = div.getAttribute("data-end-time");
            if (now - endTime > interval * 3) {
                div.remove();
            }
        });

        let base = this.refs.xlogPipe;
        this.props.xlogs.forEach((xlog) => {
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


                div.style.right = "-20px";
                div.style.transitionDelay = (delay) + "ms";
                div.style.transitionDuration = "1s";
                div.style.transitionProperty = "right";
                div.style.transitionTimingFunction = "ease-in-out";

                base.appendChild(div);
                setTimeout(() => {
                    div.style.right = "calc(100% + 20px)";
                }, 10);
            }
        });
    }

    render() {
        return (
            <div className="xlog-pipe" ref="xlogPipe"></div>
        );
    }
}


export default XLogPipe;