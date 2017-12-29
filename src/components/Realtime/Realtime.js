import React, {Component} from 'react';
import './Realtime.css';
import {connect} from 'react-redux';
import {clearAllMessage, setControlVisibility} from '../../actions';
import jQuery from "jquery";
import {XLogViewer, XLogPipe, XLogMover} from "../";

window.$ = window.jQuery = jQuery;

class Realtime extends Component {

    url = "http://localhost:6188";
    dataRefreshInterval = 1000;
    dataRefreshTimer = null;

    tickInterval = 1000;
    tickTimer = null;

    constructor(props) {
        super(props);
        let range = 1000 * 60 * 10;
        let endTime = (new Date()).getTime();
        let startTime = endTime - range;

        this.state = {
            tempXlogs: [],
            firstStepXlogs: [],
            firstStepTimestamp: null,
            secondStepXlogs: [],
            secondStepTimestamp: null,
            xlogs: [],
            newXLogs: [],
            offset1: 0,
            offset2: 0,
            startTime: startTime,
            endTime: endTime,
            range: range,
            maxElapsed: 2000

        };
    }

    getXLog = () => {
        if (this.props.instances && this.props.instances.length > 0) {
            jQuery.ajax({
                method: "GET",
                async: false,
                url: this.url + '/scouter/v1/xlog/realTime/' + this.state.offset1 + '/' + this.state.offset2 + '?objHashes=' + JSON.stringify(this.props.instances.map((instance) => {
                    return Number(instance.objHash);
                }))
            }).done((msg) => {


                let datas = msg.result.xlogs.map((d) => {
                    d["_custom"] = {
                        p: false
                    };
                    return d;
                });

                let tempXlogs = this.state.tempXlogs.concat(datas);

                this.setState({
                    offset1: msg.result.offset1,
                    offset2: msg.result.offset2,
                    tempXlogs: tempXlogs

                });

            }).fail((jqXHR, textStatus) => {
                console.log(jqXHR, textStatus);
            });
        }
    };

    tick = () => {

        let endTime = (new Date()).getTime();
        let startTime = endTime - this.state.range;

        let firstStepStartTime = endTime - 1000;
        let secondStepStartTime = firstStepStartTime - 5000;

        let xlogs = this.state.xlogs;
        let newXLogs = this.state.newXLogs;
        let tempXlogs = this.state.tempXlogs;
        let firstStepXlogs = this.state.firstStepXlogs;
        let secondStepXlogs = this.state.secondStepXlogs;
        let lastStepXlogs = [];

        for (let i = 0; i < secondStepXlogs.length; i++) {
            let d = secondStepXlogs[i];
            if (d.endTime >= firstStepStartTime) {
                firstStepXlogs.push(secondStepXlogs.splice(i, 1)[0]);
            } else if (d.endTime >= secondStepStartTime && d.endTime < firstStepStartTime) {

            } else {
                lastStepXlogs.push(secondStepXlogs.splice(i, 1)[0]);
            }
        }


        for (let i = 0; i < firstStepXlogs.length; i++) {
            let d = firstStepXlogs[i];
            if (d.endTime >= firstStepStartTime) {

            } else if (d.endTime >= secondStepStartTime && d.endTime < firstStepStartTime) {
                secondStepXlogs.push(firstStepXlogs.splice(i, 1)[0]);
            } else {
                lastStepXlogs.push(firstStepXlogs.splice(i, 1)[0]);
            }
        }

        for (let i = 0; i < tempXlogs.length; i++) {
            let d = tempXlogs[i];
            if (d.endTime >= firstStepStartTime) {
                firstStepXlogs.push(d);
            } else if (d.endTime >= secondStepStartTime && d.endTime < firstStepStartTime) {
                secondStepXlogs.push(d);
            } else {
                lastStepXlogs.push(d);
            }
        }

        xlogs = xlogs.concat(newXLogs);
        newXLogs = lastStepXlogs;


        let outOfRangeIndex = -1;
        for (let i = 0; i < xlogs.length; i++) {
            let d = xlogs[i];
            if (startTime < d.endTime) {
                break;
            }
            outOfRangeIndex = i;
        }

        if (outOfRangeIndex > -1) {
            xlogs.splice(0, outOfRangeIndex + 1);
        }


        let now = (new Date()).getTime();
        this.setState({
            tempXlogs: [],
            firstStepXlogs: firstStepXlogs,
            firstStepTimestamp: now,
            secondStepXlogs: secondStepXlogs,
            secondStepTimestamp: now,
            xlogs: xlogs,
            newXLogs: newXLogs,
            startTime: startTime,
            endTime: endTime
        });
    };

    componentDidMount() {

        this.dataRefreshTimer = setInterval(() => {
            this.getXLog();
        }, this.dataRefreshInterval);

        this.tickTimer = setInterval(() => {
            this.tick();
        }, this.tickInterval);


    }

    componentWillUnmount() {
        clearInterval(this.dataRefreshTimer);
        this.dataRefreshTimer = null;

        clearInterval(this.tickTimer);
        this.tickTimer = null;
    }

    printXLogLength() {
        /*console.log("TEMP=" + this.state.tempXlogs.length);
        console.log("FIRST=" + this.state.firstStepXlogs.length);
        console.log("SECOND=" + this.state.secondStepXlogs.length);
        console.log("XLOGS=" + this.state.xlogs.length);*/

        console.log(this.state.firstStepXlogs.length + "->" + this.state.secondStepXlogs.length + "->" + this.state.xlogs.length);
    }

    render() {

        this.printXLogLength();
        return (
            <div className="realtime">
                <div className="xlog-viewer-wrapper">
                    <XLogViewer startTime={this.state.startTime} endTime={this.state.endTime} maxElapsed={this.state.maxElapsed} xlogs={this.state.newXLogs}/>
                </div>
                <div className="xlog-mover-wrapper">
                    <XLogMover secondStepTimestamp={this.state.secondStepTimestamp} xlogs={this.state.secondStepXlogs} maxElapsed={this.state.maxElapsed}/>
                </div>
                <div className="xlog-pipe-wrapper">
                    <XLogPipe firstStepTimestamp={this.state.firstStepTimestamp} xlogs={this.state.firstStepXlogs}/>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        instances: state.target.instances
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage())
    };
};

Realtime = connect(mapStateToProps, mapDispatchToProps)(Realtime);

export default Realtime;