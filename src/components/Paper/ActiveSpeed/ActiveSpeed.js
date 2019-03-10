import React, {Component} from 'react';
import './ActiveSpeed.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {setActiveServiceList} from "../../../actions";

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
    onClickActiveSpeed = (obj) => {
        this.props.setActiveServiceList({
            objHash : obj.objHash,
            objName : obj.objName
        })
    }
    render() {
        let maxValue = this.props.box.values["maxValue"];
        let singleLine = this.props.box.values["singleLine"];
        return (
            <div className="active-speed-wrapper">
                <div className="active-speed-content">
                {(!this.props.realtime) && <div className="no-search-support"><div><div>REALTIME ONLY</div></div></div>}
                {this.props.realtime && this.props.objects.filter((d) => {
                    return d.objFamily === "javaee" && this.props.filterMap[d.objHash];
                }).map((d, i) => {
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

                    let width = this.props.box.values["instanceNameWidth"];
                    if (singleLine) {
                        width = "100%";
                    }

                    let showCnt = this.props.box.values["showCnt"];

                    return <div className={"row " + (singleLine ? "single-line" : "")} key={i} style={{cursor : 'pointer'}} onClick={()=> this.onClickActiveSpeed(d) } >
                        <div className="instance-info-div" style={{width : width}} title={d.objName}>
                            <div className="instance-name">{showCnt && <div className="bar-info"><span className="separator">[</span> <span className="long" title="LONG">{long}</span> <span className="medium" title="MEDIUM">{medium}</span> <span className="short" title="SHORT">{short}</span><span className="separtor"> ]</span></div>}{d.objName}</div>
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
        objects: state.target.objects,
        config: state.config,
        filterMap: state.target.filterMap
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setActiveServiceList: (objectSel) => dispatch(setActiveServiceList(objectSel))
    };
};
ActiveSpeed = connect(mapStateToProps, mapDispatchToProps)(ActiveSpeed);
export default withRouter(ActiveSpeed);
