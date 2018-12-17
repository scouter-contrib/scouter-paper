import React, {Component} from 'react';
import './PaperControl.css';
import * as Options from './Options';
import {Draggable} from 'react-drag-and-drop'
import ReactTooltip from 'react-tooltip'
import AlertList from "./AlertList";
import {connect} from 'react-redux';

class PaperControl extends Component {

    options = null;
    touch = false;

    constructor(props) {
        super(props);
        this.options = Options.options();


        if ("ontouchstart" in document.documentElement) {
            this.touch = true;
        }
    }

    render() {

        return (
            <div className={"papers-controls noselect " + (this.props.fixedControl ? 'fixed-control ' : ' ') + (this.touch ? 'touch' : '')}>
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
                    return <div key={i} className="paper-control" data-tip={this.options[name].title} >
                        {(!this.touch) &&
                        <Draggable type="metric" className="draggable control-item" data={JSON.stringify(this.options[name])} >
                            {this.options[name].icon && <i className={"fa " + this.options[name].icon} aria-hidden="true"></i>}
                            {this.options[name].text && <span className="text-icon">{this.options[name].text}</span>}
                        </Draggable>
                        }
                        {(this.touch) &&
                        <div onClick={this.props.addPaperAndAddMetric.bind(this, JSON.stringify(this.options[name]))}>
                            {this.options[name].icon && <i className={"fa " + this.options[name].icon} aria-hidden="true"></i>}
                            {this.options[name].text && <span className="text-icon">{this.options[name].text}</span>}
                        </div>
                        }
                    </div>
                })}
                {this.props.counterInfo.families.map((family, i) => {
                    return <div key={i} className="paper-control multi-control" >
                        {(!this.touch) && <div className="multi-metrics">
                            <div className="group-name">{family.name}</div>
                            <ul>
                                {family.counters.sort((a,b) => {
                                    return a.displayName.localeCompare(b.displayName);
                                }).map((counter, j) => {
                                    counter.familyName = family.name;
                                    return <li key={j}>
                                        <Draggable type="metric" className="draggable control-item" data={JSON.stringify(counter)}>
                                            <span className="text-icon">{counter.displayName}</span>
                                        </Draggable>
                                    </li>
                                })}
                            </ul>
                        </div>}
                        {(this.touch) && <div className="multi-metrics">
                            <div className="group-name">{family.name}</div>
                            <ul>
                                {family.counters.sort((a,b) => {
                                    return a.displayName.localeCompare(b.displayName);
                                }).map((counter, j) => {
                                    counter.familyName = family.name;
                                    return <li key={j}>
                                        <div className="control-item" onClick={this.props.addPaperAndAddMetric.bind(this, JSON.stringify(counter))}>
                                            <span className="text-icon">{counter.displayName}</span>
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
                <div className="paper-control paper-alert paper-right" data-count={this.props.alert.data.length > 99 ? "99+" : this.props.alert.data.length} onClick={this.props.toggleShowAlert} data-tip="CLICK TO SHOW ALERT">
                    <span><i className="fa fa-exclamation-circle" aria-hidden="true"></i></span>
                </div>
                <ReactTooltip />
                <AlertList alert={this.props.alert} show={this.props.showAlert} setRewind={this.props.setRewind} clearAllAlert={this.props.clearAllAlert} clearOneAlert={this.props.clearOneAlert} />
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        counterInfo: state.counterInfo
    };
};

PaperControl = connect(mapStateToProps, undefined)(PaperControl);

export default PaperControl;

