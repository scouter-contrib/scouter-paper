import React, {Component} from 'react';
import './TargetHost.css';

class TargetHost extends Component {

    render() {
        return (
            <li key={this.props.host.id} onClick={this.props.onHostClick.bind(this, this.props.host.id)}
                className={"target-host " + (this.props.active ? 'active' : '')}>
                <div className={"status " + String(this.props.host.connected)}>
                    <span className="icon true"><i className="fa fa-handshake-o" aria-hidden="true"></i></span>
                    <span className="text true">OPEN</span>
                    <span className="icon false"><i className="fa fa-ban" aria-hidden="true"></i></span>
                    <span className="text false">CLOSE</span>
                </div>
                <div className="host-info">
                    <div className="name">{this.props.host.name}</div>
                    <div className="additional">
                        <span className="hash">HASH</span><span className="host-id">{this.props.host.id}</span>
                    </div>
                    <div className="selected-count">
                        <span>{this.props.host.selectedInstanceCount !== 0 && this.props.host.selectedInstanceCount}</span>
                    </div>
                </div>
                <div className="control">
                    <span><i className="fa fa-check-square" aria-hidden="true"></i></span>
                </div>
            </li>
        )
    }
}

export default TargetHost;