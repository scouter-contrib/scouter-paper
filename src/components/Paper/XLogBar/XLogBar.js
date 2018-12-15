import React, {Component} from 'react';
import './XLogBar.css';
import ServerDate from "../../../common/ServerDate";

class XLogBar extends Component {

    firstStepTimestamp = null;

    constructor(props) {
        super(props);

        let history = [];

        if (this.props.box.values.count) {
            if (this.props.box.values.history > 1) {
                for (let i=0; i<this.props.box.values.history; i++) {
                    history.push(0);
                }
            }
        }

        this.state = {
            history : history,
            fontSize: 30
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(!this.props.visible) {
            return false;
        }

        if (this.firstStepTimestamp !== nextProps.data.firstStepTimestamp) {
            this.firstStepTimestamp = nextProps.data.firstStepTimestamp;
            return true;
        } else {
            return false;
        }
    }

    getValue = (val)  => {
        let result = val;
        if (val > 1000000) {
            result = Math.floor(result / 1000000) + "M";
        } else if (val > 1000) {
            result = Math.floor(result / 1000) + "k";
        }

        return result;
    };

    componentDidUpdate() {

        this.resize();

        let interval = this.props.interval;

        let now = (new ServerDate()).getTime();
        let divs = this.refs.xlogBar.querySelectorAll("div");
        divs.forEach((div) => {
            let endTime = div.getAttribute("data-end-time");
            if (endTime) {
                if (now - endTime > interval * 3) {
                    div.remove();
                }
            }
        });


        let base = this.refs.xlogBar;
        if (this.props.data) {

            if (this.props.box.values.count) {
                let history = this.state.history.slice(0);
                history.push(this.getValue(this.props.data.firstStepXlogs.length));

                if (history.length > this.props.box.values.history) {

                    let shiftCount = history.length - this.props.box.values.history;
                    for (let i=0; i<shiftCount; i++) {
                        history.shift();
                    }
                }

                this.setState({
                    history : history
                });
            }


            this.props.data.firstStepXlogs.forEach((xlog) => {
                if (!this.props.filterMap[xlog.objHash]) {
                    return;
                }

                let exist = base.querySelector("[data-txid='" + xlog.txid + "']");
                if (!exist) {
                    let div = document.createElement("div");
                    let now = (new ServerDate()).getTime();
                    let delay = interval - ((now - xlog.endTime));
                    if (delay < 0) {
                        delay = 100;
                    }
                    div.setAttribute("data-txid", xlog.txid);
                    div.setAttribute("data-end-time", xlog.endTime);

                    if (xlog.error !== "0") {
                        div.classList.add("has-error");
                    }

                    div.style.right = "-100px";
                    div.style.transitionDelay = (delay) + "ms";
                    div.style.transitionDuration = interval + "ms";
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

    resize = () => {
        let fontSize = 30;
        if (this.refs.xlogBar) {
            let width = this.refs.xlogBar.offsetWidth;
            if (width < 200) {
                fontSize = 10;
            } else if (width < 300) {
                fontSize = 24;
            }

            if (this.state.fontSize !== fontSize) {
                this.setState({
                    fontSize: fontSize
                });
            }
        }
    };

    render() {
        return (
            <div className="xlog-bar" ref="xlogBar">
                {this.props.box.values.count &&
                <div className="request-count">
                    <div>
                    {(Number(this.props.box.values.history) === 1) && this.getValue(this.props.data.firstStepXlogs.length)}
                    {this.props.box.values.history > 1 &&
                        <div className="request-history-count-list" ref="historyCount" style={{fontSize: this.state.fontSize + "px"}}>
                        {this.state.history.map((d, i) => {
                            return <div className={"request-history-count step-" + (this.state.history.length - i)} key={i}>{d}</div>
                        })}
                        </div>}
                    </div>
                </div>}
            </div>
        );
    }
}

export default XLogBar;
