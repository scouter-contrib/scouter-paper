import React, {Component} from 'react';
import './PaperControl.css';
import * as Options from './Options';
import {Draggable} from 'react-drag-and-drop'
import ReactTooltip from 'react-tooltip'
import AlertList from "./AlertList";

class PaperControl extends Component {

    options = null;
    touch = false;

    constructor(props) {
        super(props);
        this.options = Options.options();

        if ("ontouchstart" in document.documentElement) {
            this.touch = true;
        }

        this.state = {
            showAlert: false,
        }
    }

    toggleAlert = () => {
        this.setState({
            showAlert : !this.state.showAlert
        });
    };



    render() {

        return (
            <div className={"papers-controls noselect " + (this.props.fixedControl ? 'fixed-control ' : ' ') + (this.touch ? 'touch' : '')}>
                <div className={"paper-control live " + (this.props.realtime ? "realtime" : "")} onClick={this.props.toggleRangeControl} data-tip="CLICK TO CHANGE TIME RANGE">
                    <span className="live">R</span>
                </div>
                <div className="paper-control-separator"></div>
                {!this.touch &&
                <div className="paper-control" onClick={this.props.addPaper} data-tip="CLICK TO ADD EMPTY PAPER">
                    <i className="fa fa-plus-circle" aria-hidden="true"></i>
                </div>
                }
                {!this.touch &&
                <div className="paper-control-separator"></div>
                }
                <div className="label" data-tip="DRAG RIGHT ICON TO THE PAPER">METRICS</div>
                {Object.keys(this.options).map((name, i) => {
                    let isArray = Array.isArray(this.options[name]);

                    return <div key={i} className={"paper-control " + (isArray ? 'multi-control' : '')} data-tip={this.options[name].title} >
                        {(!isArray && !this.touch) &&
                        <Draggable type="metric" className="draggable control-item" data={JSON.stringify(this.options[name])} >
                            {this.options[name].icon && <i className={"fa " + this.options[name].icon} aria-hidden="true"></i>}
                            {this.options[name].text && <span className="text-icon">{this.options[name].text}</span>}
                        </Draggable>
                        }
                        {(isArray && !this.touch) && <div className="multi-metrics">
                            <div className="group-name">{name}</div>
                            <ul>
                                {this.options[name].map((counterName, j) => {
                                    return <li key={j}>
                                        <Draggable type="metric" className="draggable control-item" data={JSON.stringify(counterName)}>
                                            {counterName.icon && <i className={"fa " + counterName.icon} aria-hidden="true"></i>}
                                            {counterName.text && <span className="text-icon">{counterName.text}</span>}
                                        </Draggable>
                                    </li>
                            })}
                            </ul>
                        </div>}


                        {(!isArray && this.touch) &&
                        <div onClick={this.props.addPaperAndAddMetric.bind(this, JSON.stringify(this.options[name]))}>
                            {this.options[name].icon && <i className={"fa " + this.options[name].icon} aria-hidden="true"></i>}
                            {this.options[name].text && <span className="text-icon">{this.options[name].text}</span>}
                        </div>
                        }
                        {(isArray && this.touch) && <div className="multi-metrics">
                            <div className="group-name">{name}</div>
                            <ul>
                                {this.options[name].map((counterName, j) => {
                                    return <li key={j}>
                                        <div className="control-item" onClick={this.props.addPaperAndAddMetric.bind(this, JSON.stringify(counterName))}>
                                            {counterName.icon && <i className={"fa " + counterName.icon} aria-hidden="true"></i>}
                                            {counterName.text && <span className="text-icon">{counterName.text}</span>}
                                        </div>
                                    </li>
                                })}
                            </ul>
                        </div>}
                    </div>
                })}
                {!this.touch &&
                <div className="paper-control paper-right" onClick={this.props.clearLayout} data-tip="CLICK TO CLEAR ALL">
                    <i className="fa fa-trash-o" aria-hidden="true"></i>
                </div>
                }
                {this.touch &&
                <div className="paper-control paper-right" onClick={this.props.clearLayout}>
                    <i className="fa fa-trash-o" aria-hidden="true"></i>
                </div>
                }
                <div className="paper-control-separator paper-right"></div>
                <div className="paper-control paper-alert paper-right" data-count={this.props.alert.data.length > 99 ? this.props.alert.data.length : this.props.alert.data.length} onClick={this.toggleAlert} data-tip="CLICK TO SHOW ALERT">
                    <span><i className="fa fa-exclamation-circle" aria-hidden="true"></i></span>
                </div>
                <ReactTooltip />
                <AlertList alert={this.props.alert} show={this.state.showAlert} setRewind={this.props.setRewind} clearAllAlert={this.props.clearAllAlert} clearOneAlert={this.props.clearOneAlert} />
            </div>
        );
    }
}

export default PaperControl;

