import React, {Component} from "react";
import "./TopologyControl.css";
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import {
    addRequest,
    pushMessage,
    setControlVisibility,
    setTopologyOption
} from "../../actions";

class TopologyControl extends Component {


    constructor(props) {
        super(props);
        this.state = {
            opened: true
        };
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
        if (this.props.topologyOption.pin) {
            return;
        }

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
            <div className="topology-option-control">
                <div className="controller noselect">
                    <div className="summary-wrapper" onClick={this.toggleOpened}>
                        <div className="summary">{this.props.topologyOption.nodeCount} NODES</div>
                        <div className="summary">{this.props.topologyOption.linkCount} LINKS</div>
                        <span className="toggle-filter-icon"><i className="fa fa-angle-down" aria-hidden="true"></i></span>
                    </div>
                    {this.state.opened && <div className="control-groups">
                        <div className="group">
                            <div className={"check-btn " + (this.props.topologyOption.grouping ? "on" : "off")}
                                 onClick={this.checkBtnClick.bind(this, "grouping")}>
                                <span className="icon"><i className="fa fa-object-group" aria-hidden="true"></i></span>
                                <span className="text">GROUPING</span>
                            </div>
                        </div>
                        <div className="group">
                            <div className={"check-btn " + (this.props.topologyOption.arcLine ? "on" : "off")}
                                 onClick={()=>this.checkBtnClick("arcLine")}>
                                <span className="icon"><i className="fa fa-arrow-circle-right" aria-hidden="true"></i></span>
                                <span className="text">ARC LINE</span>
                            </div>
                        </div>
                        <div className="group">
                            <div
                                className={"check-btn tps " + (this.props.topologyOption.tpsToLineSpeed ? "on" : "off")}
                                onClick={this.checkBtnClick.bind(this, "tpsToLineSpeed")}>
                                <span className="icon"><i className="fa fa-motorcycle" aria-hidden="true"></i></span>
                                <span className="text">TPS TO LINE SPEED</span>
                            </div>
                            <div className="radio-group">
                                <div
                                    className={"radio-btn " + (!this.props.topologyOption.tpsToLineSpeed ? "disable " : " ") + (this.props.topologyOption.speedLevel === "slow" ? "on" : "off")}
                                    onClick={this.changeSpeedLevel.bind(this, "slow")}>
                                    <span className="text">SLOW</span>
                                </div>
                                <div
                                    className={"radio-btn " + (!this.props.topologyOption.tpsToLineSpeed ? "disable " : " ") + (this.props.topologyOption.speedLevel === "medium" ? "on" : "off")}
                                    onClick={this.changeSpeedLevel.bind(this, "medium")}>
                                    <span className="text">MEDIUM</span>
                                </div>
                                <div
                                    className={"radio-btn " + (!this.props.topologyOption.tpsToLineSpeed ? "disable " : " ") + (this.props.topologyOption.speedLevel === "fast" ? "on" : "off")}
                                    onClick={this.changeSpeedLevel.bind(this, "fast")}>
                                    <span className="text">FAST</span>
                                </div>
                            </div>
                        </div>
                        <div className="group">
                            <div className={"check-btn " + (this.props.topologyOption.highlight ? "on" : "off")}
                                 onClick={this.checkBtnClick.bind(this, "highlight")}>
                                <span className="icon"><i className="fa fa-lightbulb-o" aria-hidden="true"></i></span>
                                <span className="text">HIGHLIGHT</span>
                            </div>
                        </div>
                        <div className="group">
                            <div className={"check-btn " + (this.props.topologyOption.zoom ? "on" : "off")}
                                 onClick={this.checkBtnClick.bind(this, "zoom")}>
                                <span className="icon"><i className="fa fa-search" aria-hidden="true"></i></span>
                                <span className="text">ZOOM</span>
                            </div>
                        </div>
                        <div className="group">
                            <div className={"check-btn " + (this.props.topologyOption.pin ? "on" : "pin")}
                                 onClick={this.checkBtnClick.bind(this, "pin")}>
                                <span className="icon"><i className="fa fa-map-pin" aria-hidden="true"></i></span>
                                <span className="text">PIN</span>
                            </div>
                        </div>
                        <div className="group">
                            <div className={"check-btn " + (this.props.topologyOption.redLine ? "on" : "redLine")}
                                 onClick={this.checkBtnClick.bind(this, "redLine")}>
                                <span className="icon"><i className="fa fa-exclamation-triangle" aria-hidden="true"></i></span>
                                <span className="text">RED LINE</span>
                            </div>
                        </div>

                        <div className="group">
                            <div className={"action-btn " + (this.props.topologyOption.pin ? "disabled" : "")} onClick={this.changeDistance.bind(this, "minus")}>
                                <span className="icon"><i className="fa fa-compress" aria-hidden="true"></i></span>
                                <span className="text">DISTANCE-</span>
                            </div>
                            <div className={"action-btn " + (this.props.topologyOption.pin ? "disabled" : "")} onClick={this.changeDistance.bind(this, "plus")}>
                                <span className="icon"><i className="fa fa-expand" aria-hidden="true"></i></span>
                                <span className="text">DISTANCE+</span>
                            </div>
                        </div>
                    </div>
                    }
                </div>
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
        addRequest: () => dispatch(addRequest()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        setTopologyOption: (topologyOption) => dispatch(setTopologyOption(topologyOption))
    };
};

TopologyControl = connect(mapStateToProps, mapDispatchToProps)(TopologyControl);
export default withRouter(TopologyControl);
