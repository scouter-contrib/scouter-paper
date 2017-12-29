import React, {Component} from 'react';
import Time from 'react-time-format'
import './TargetInstance.css';

class TargetInstance extends Component {

    render() {
        return (

            <li key={this.props.instance.id} onClick={this.props.onInstanceClick.bind(this, this.props.instance)}
                className={"target-instance " + (this.props.selected ? 'selected' : '')}>
                <div className={"status " + String(this.props.instance.alive)}>
                    <span className="icon true"><i className="fa fa-handshake-o" aria-hidden="true"></i></span>
                    <span className="text true">OPEN</span>
                    <span className="icon false"><i className="fa fa-ban" aria-hidden="true"></i></span>
                    <span className="text false">CLOSE</span>
                </div>
                <div className="instance-info">
                    <div className="objName">{this.props.instance.objName}</div>
                    <div className="additional">
                        <div className="tag-name">IP</div>
                        <div className="tag-val address">{this.props.instance.address}</div>
                        <div className="tag-name">HASH</div>
                        <div className="tag-val objHash">{this.props.instance.objHash}</div>
                        <div className="tag-name">TYPE</div>
                        <div className="tag-val objFamily">{this.props.instance.objFamily}</div>
                        <div className="tag-name">LAST</div>
                        <div className="tag-val lastWakeUpTime">
                            <Time value={new Date(Number(this.props.instance.lastWakeUpTime))} format="YYYY/MM/DD hh:mm:ss"/>
                        </div>
                    </div>
                    <div className="version">{this.props.instance && this.props.instance.version.split(' ')[0]}</div>
                    <div className="checker"><i className="fa fa-check-circle-o" aria-hidden="true"></i></div>
                </div>
            </li>
        )
    }

}

export default TargetInstance;