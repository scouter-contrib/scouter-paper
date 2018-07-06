import React, {Component} from 'react';
import './ActiveSpeed.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import InstanceColor from "../../../common/InstanceColor";

class ActiveSpeed extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeSpeed: {},
            maxY: null
        }
    }

    componentDidMount() {

    }

    shouldComponentUpdate(nextProps, nextState) {
        return !!this.props.visible;
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.counters) {
            this.setState({
                activeSpeed : nextProps.counters.ActiveSpeed
            });
        }
    }

    stopProgation = (e) => {
        e.stopPropagation();
    };

    render() {

        /*console.log(this.props.layoutChangeTime);
        console.log(this.props.time);
        console.log(this.props.box);
        console.log(this.props.counters);*/


        let maxValue = this.props.box.values["maxValue"];
        let counterKey = this.props.box.option.counterKey;
        return (
            <div className="active-speed-wrapper">
                <div className="active-speed-content">
                {this.props.instances.map((d, i) => {
                    let total = 0;
                    let short = 0;
                    let medium = 0;
                    let long = 0;
                    if (this.state.activeSpeed && this.state.activeSpeed[d.objHash]) {
                        this.state.activeSpeed[d.objHash].value.map((d) => total+=Number(d));
                        short = this.state.activeSpeed[d.objHash].value[0];
                        medium = this.state.activeSpeed[d.objHash].value[1];
                        long = this.state.activeSpeed[d.objHash].value[2];
                    }

                    /*medium = Math.ceil(Math.random() * 10);
                    long = Math.ceil(Math.random() * 10);*/

                    let color = InstanceColor.getMetricColor(counterKey, this.props.config.colorType);
                    let bars = [];
                    for (let i=0; i<maxValue; i++) {
                        bars.push({});
                    }

                    let cursor = 0;
                    for (let i=0; i<long; i++) {
                        if (cursor < maxValue) {
                            bars[cursor]["type"] = "L";
                            cursor++;
                        }
                    }

                    for (let i=0; i<medium; i++) {
                        if (cursor < maxValue) {
                            bars[cursor]["type"] = "M";
                            cursor++;
                        }
                    }

                    for (let i=0; i<short; i++) {
                        if (cursor < maxValue) {
                            bars[cursor]["type"] = "S";
                            cursor++;
                        }
                    }

                    let overflow = total > maxValue;

                    return <div className="row" key={i}>
                        <div className="instance-info-div" style={{color : color, width : this.props.box.values["instanceNameWidth"]}} title={d.objName}>
                            <div className="instance-name">{d.objName}</div>
                            {/*<div className="bar-info"><span className="long">{long}</span> <span className="medium">{medium}</span> <span className="short">{short}</span></div>*/}
                        </div>
                        <div className="active-speed-bar">
                            {bars.map((d, j) => {
                                return <div key={j} className={"bar " + (d.type ? d.type : "") + " " + (overflow ? "overflow" : "")} style={{width : 'calc((100% - ' + (maxValue * 2) + 'px) / ' + maxValue + ')'}}></div>
                            })}
                        </div>
                        <div className="overflow">{overflow && <div><i className="fa fa-plus" aria-hidden="true"></i></div>}</div>
                    </div>
                })}
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        hosts: state.target.hosts,
        instances: state.target.instances,
        config: state.config
    };
};


ActiveSpeed = connect(mapStateToProps, undefined)(ActiveSpeed);
export default withRouter(ActiveSpeed);
