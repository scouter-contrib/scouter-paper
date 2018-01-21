import React, {Component} from 'react';
import './Overlay.css';

class Overlay extends Component {

    render() {
        return (
            <div className={"overlay " + this.props.visible}>
                <div>{this.props.children}</div>
            </div>
        );
    }
}

export default Overlay;