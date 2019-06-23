import React, {Component} from "react";
import "./TopologyMinControl.css";
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import {
    setTopologyOption
} from "../../actions";
import ReactTooltip from 'react-tooltip'

class TopologyMinControl extends Component {


    constructor(props) {
        super(props);
        this.state = {
            opened: true
        };
    }

    componentDidUpdate(prevProps, prevState) {
        ReactTooltip.rebuild();
    }

    toggleOpened = () => {
        this.setState({
            opened : !this.state.opened
        });
    };

    changeSpeedLevel = (level) => {
        let option = {};
        option["speedLevel"] = level;
        option["tpsToLineSpeed"] = true;
        this.props.setTopologyOption(option);
    };

    checkBtnClick = (property) => {

        let option = {};
        let val = !this.props.topologyOption[property];
        option[property] = val;

        if (property === "tpsToLineSpeed") {
            if (val) {
                option["speedLevel"] = "slow";
            } else {
                option["speedLevel"] = "none";
            }
        }

        this.props.setTopologyOption(option);
    };

    changeDistance = (dir) => {
        let distance = this.props.topologyOption.distance;
        if (dir === "plus") {
            distance += 30;
        } else {
            distance -= 30;
            if (distance < 120) {
                distance = 120;
            }
        }

        let option = {
            distance : distance
        };

        this.props.setTopologyOption(option);

    };

    render() {

        return (
            <div className="topology-min-control">
                <div className="row first">
                    <span className="label">OPT</span>
                </div>
                <div className="row" data-tip="GROUPING">
                    <div onClick={this.checkBtnClick.bind(this, "grouping")} className={"control-btn check-btn " + (this.props.topologyOption.grouping ? "selected" : "")}>
                        <div className="text"><span>G</span></div>
                    </div>
                </div>
                <div className="row" data-tip="Arc Line">
                    <div onClick={()=>this.checkBtnClick("arcLine")} className={"control-btn check-btn " + (this.props.topologyOption.arcLine ? "selected" : "")}>
                        <div className="text"><span>A</span></div>
                    </div>
                </div>

                <div className="row">
                    <div data-tip="TPS TO LINE SPEED" onClick={this.checkBtnClick.bind(this, "tpsToLineSpeed")} className={"control-btn radio-btn first " + (this.props.topologyOption.tpsToLineSpeed ? "selected" : "")}>
                        <div className="text"><span>T</span></div>
                    </div>
                    <div data-tip="SLOW" onClick={this.changeSpeedLevel.bind(this, "slow")} className={"control-btn radio-btn " + (this.props.topologyOption.speedLevel === "slow" ? "selected" : "")}>
                        <div className="text"><span>S</span></div>
                    </div>
                    <div data-tip="MEDIUM" onClick={this.changeSpeedLevel.bind(this, "medium")} className={"control-btn radio-btn " + (this.props.topologyOption.speedLevel === "medium" ? "selected" : "")}>
                        <div className="text"><span>M</span></div>
                    </div>
                    <div data-tip="FAST" onClick={this.changeSpeedLevel.bind(this, "fast")} className={"control-btn radio-btn last " + (this.props.topologyOption.speedLevel === "fast" ? "selected" : "")}>
                        <div className="text"><span>F</span></div>
                    </div>
                </div>
                <div className="row" data-tip="HIGHLIGHT">
                    <div onClick={this.checkBtnClick.bind(this, "highlight")} className={"control-btn check-btn " + (this.props.topologyOption.highlight ? "selected" : "")}>
                        <div className="text"><span>H</span></div>
                    </div>
                </div>
                <div className="row" data-tip="ZOOM">
                    <div onClick={this.checkBtnClick.bind(this, "zoom")} className={"control-btn check-btn " + (this.props.topologyOption.zoom ? "selected" : "")}>
                        <div className="text"><span>Z</span></div>
                    </div>
                </div>
                <div className="row" data-tip="PIN">
                    <div onClick={this.checkBtnClick.bind(this, "pin")} className={"control-btn check-btn " + (this.props.topologyOption.pin ? "selected" : "")}>
                        <div className="text"><span>P</span></div>
                    </div>
                </div>
                <div className="row" data-tip="REDLINE">
                    <div onClick={this.checkBtnClick.bind(this, "redLine")} className={"control-btn check-btn " + (this.props.topologyOption.redLine ? "selected" : "")}>
                        <div className="text"><span>E</span></div>
                    </div>
                </div>
                <div className="row" data-tip="DISTANCE +">
                    <div onClick={this.changeDistance.bind(this, "plus")} className={"control-btn action-btn " + (this.props.topologyOption.pin ? "disabled" : "")}>
                        <div className="text"><span>+</span></div>
                    </div>
                </div>
                <div className="row" data-tip="DISTANCE -">
                    <div onClick={this.changeDistance.bind(this, "minus")} className={"control-btn action-btn " + (this.props.topologyOption.pin ? "disabled" : "")}>
                        <div className="text"><span>-</span></div>
                    </div>
                </div>
                <ReactTooltip/>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        topologyOption: state.topologyOption
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setTopologyOption: (topologyOption) => dispatch(setTopologyOption(topologyOption))
    };
};

TopologyMinControl = connect(mapStateToProps, mapDispatchToProps)(TopologyMinControl);
export default withRouter(TopologyMinControl);
