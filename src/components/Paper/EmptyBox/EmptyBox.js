import React, {Component} from 'react';
import './EmptyBox.css';

class EmptyBox extends Component {
    render() {
        return (
            <div className="empty-box">
                <div className="empty-icon">
                    <i className="fa fa-flask" aria-hidden="true"></i>
                </div>
                <div>DRAG METRIC HERE</div>
            </div>
        );
    }
}

export default EmptyBox;
