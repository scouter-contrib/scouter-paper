import React, {Component} from 'react';
import './PaperControl.css';
import * as Options from './Options';
import {Draggable} from 'react-drag-and-drop'
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

        this.state = {
            currentGroup: null,
            clearConfirmShow : false
        }
    }

    openGroup = (groupName) => {
        if (groupName === this.state.currentGroup) {
            this.setState({
                currentGroup : null
            });
        } else {
            this.setState({
                currentGroup : groupName
            });
        }
    };

    setClearConfirmState= (val)=>{
        this.setState({
            clearConfirmShow : val
        });
    };

    clearLayout = () => {
        this.setState({
            clearConfirmShow : false
        });
        this.props.clearLayout();
    };

    render() {

        return (
            <div className={"papers-controls noselect " + (this.touch ? 'touch' : '')}>
                <div className="control-item first">
                    <div className="row desc">
                        <div className="step"><span>1</span></div>
                        <div className="row-message">ADD EMPTY PAPER</div>
                    </div>
                    <div className="row control">
                        <div>
                            <div className="paper-control paper-control-btn" onClick={this.props.addPaper}>
                                <i className="fa fa-plus-circle" aria-hidden="true"></i><span className="paper-control-text">ADD PAPER</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="control-item">
                    <div className="row desc">
                        <div className="step"><span>2</span></div>
                        <div className="row-message">DRAG METRIC TO THE PAPER</div>
                    </div>
                    <div className="row control metric-row">
                        <div>
                            <div className="paper-control-metrics">
                                <div key={"GENERAL"} className={"paper-control multi-control " + (this.state.currentGroup === "GENERAL" ? "opened" : "")} >
                                <div className="group-name" onClick={this.openGroup.bind(this, "GENERAL")}>
                                    <span className="name">GENERAL</span>
                                    <span className="toggle-filter-icon"><i className="fa fa-angle-down" aria-hidden="true"></i></span>
                                </div>
                                <ul>
                                    {Object.keys(this.options).filter(name => name !== "lineChart").map((name, i) => {
                                        return <li key={i}>
                                            <div key={i} className="paper-control" data-tip={this.options[name].title} >
                                                {(!this.touch) &&
                                                <Draggable type="metric" className="draggable paper-control-item" data={JSON.stringify(this.options[name])} >
                                                    <div className="draggable-icon">draggable</div>
                                                    {this.options[name].icon && <i className={"fa " + this.options[name].icon} aria-hidden="true"></i>}
                                                    {this.options[name].title && <span className="text-icon">{this.options[name].title}</span>}
                                                </Draggable>
                                                }
                                                {(this.touch) &&
                                                <div onClick={this.props.addPaperAndAddMetric.bind(this, JSON.stringify(this.options[name]))}>
                                                    {this.options[name].icon && <i className={"fa " + this.options[name].icon} aria-hidden="true"></i>}
                                                    {this.options[name].title && <span className="text-icon">{this.options[name].title}</span>}
                                                </div>
                                                }
                                            </div>
                                        </li>
                                    })}
                                </ul>
                            </div>
                            {this.props.counterInfo.families.map((family, i) => {
                                return <div key={i} className={"paper-control multi-control " + (this.state.currentGroup === family.name ? "opened" : "")} >
                                    {(!this.touch) && <div className="multi-metrics">
                                        <div className="group-name" onClick={this.openGroup.bind(this, family.name)}>
                                            <span className="name">{family.name}</span>
                                            <span className="toggle-filter-icon"><i className="fa fa-angle-down" aria-hidden="true"></i></span>
                                        </div>
                                        <ul>
                                            {family.counters.length > 0 && family.counters.sort((a,b) => {
                                                return a.displayName.localeCompare(b.displayName);
                                            }).map((counter, j) => {
                                                counter.familyName = family.name;
                                                counter.advancedOption = this.options["lineChart"].config;
                                                return <li key={j}>
                                                    <Draggable type="metric" className="draggable paper-control-item" data={JSON.stringify(counter)}>
                                                        <div className="draggable-icon">draggable</div>
                                                        <span className="text-icon">{counter.displayName}</span>
                                                    </Draggable>
                                                </li>
                                            })}
                                            {family.counters.length < 1 && <li className="no-metric">NO METRIC</li>}
                                        </ul>
                                    </div>}
                                    {(this.touch) && <div className="multi-metrics">
                                        <div className="group-name">{family.name}</div>
                                        <ul>
                                            {family.counters.sort((a,b) => {
                                                return a.displayName.localeCompare(b.displayName);
                                            }).map((counter, j) => {
                                                counter.familyName = family.name;
                                                counter.advancedOption = this.options["lineChart"].config;
                                                return <li key={j}>
                                                    <div className="paper-control-item" onClick={this.props.addPaperAndAddMetric.bind(this, JSON.stringify(counter))}>
                                                        <span className="text-icon">{counter.displayName}</span>
                                                    </div>
                                                </li>
                                            })}
                                        </ul>
                                    </div>}
                                </div>
                            })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="control-item">
                    <div className="row desc">
                        <div className="step"><span>3</span></div>
                        <div className="row-message">CLEAR ALL PAPER</div>
                    </div>
                    <div className="row control">
                        <div>
                            {!this.state.clearConfirmShow &&
                            <div className="paper-control paper-control-btn" onClick={() => this.setClearConfirmState(true)}>
                                <i className="fa fa-trash-o" aria-hidden="true"></i><span className="paper-control-text">CLEAR ALL PAPER</span>
                            </div>
                            }
                            {this.state.clearConfirmShow &&
                            <div>
                                <div className="paper-control paper-control-btn half" onClick={() => this.setClearConfirmState(false)}>
                                    <i className="fa fa-trash-o" aria-hidden="true"></i><span className="paper-control-text">CANCEL</span>
                                </div>
                                <div className="paper-control paper-control-btn half warning" onClick={this.clearLayout}>
                                    <i className="fa fa-trash-o" aria-hidden="true"></i><span className="paper-control-text">CLEAR ALL</span>
                                </div>
                            </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );}
}

let mapStateToProps = (state) => {
    return {
        counterInfo: state.counterInfo
    };
};

PaperControl = connect(mapStateToProps, undefined)(PaperControl);

export default PaperControl;

