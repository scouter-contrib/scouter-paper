import React, {Component} from 'react';
import './Step.css';
const indentVal = 10;
class Step extends Component {
    render() {
        let indent = 0;
        if (this.props.applyIndent) {
            indent = this.props.indent * indentVal;
        }

        return (
            <div className={"step-div " + (this.props.gap > 0 ? ' has-gab ' : '') + (this.props.showGap ? ' show-gab ' : '')} style={{marginLeft : indent + "px"}} >
                {(this.props.showGap && this.props.gap > 0) && <div className="gap-time">
                    <div>
                        <div className="arrow"><i className="fa fa-angle-up" aria-hidden="true"></i></div>
                        <div>{this.props.gap} ms</div>
                        <div className="arrow"><i className="fa fa-angle-down" aria-hidden="true"></i></div>
                    </div>
                </div>}
                {this.props.children}
            </div>)
    }
}

export default Step;