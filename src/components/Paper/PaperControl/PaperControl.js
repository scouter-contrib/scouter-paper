import React, {Component} from 'react';
import './PaperControl.css';
import * as Options from './Options';
import {Draggable} from 'react-drag-and-drop'

class PaperControl extends Component {

    options = null;

    constructor(props) {
        super(props);
        this.options = Options.options();
    }

    render() {
        return (
            <div className="papers-controls noselect">
                <div className="paper-control" onClick={this.props.addPaper}>
                    <i className="fa fa-plus-circle" aria-hidden="true"></i>
                </div>
                <div className="paper-control-separator"></div>
                <div className="label">METRICS</div>
                {Object.keys(this.options).map((name, i) => (
                    <div key={i} className="paper-control">
                        <Draggable type="metric" className="draggable" data={JSON.stringify(this.options[name])}>
                            {this.options[name].icon && <i className={"fa " + this.options[name].icon} aria-hidden="true"></i>}
                            {this.options[name].text && <span className="text-icon">{this.options[name].text}</span>}
                        </Draggable>
                    </div>
                ))}
                <div className="paper-control paper-right" onClick={this.props.clearLayout}>
                    <i className="fa fa-trash-o" aria-hidden="true"></i>
                </div>
            </div>
        );
    }
}

export default PaperControl;

