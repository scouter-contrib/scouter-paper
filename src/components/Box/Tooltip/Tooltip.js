import React, {Component} from 'react';
import './Tooltip.css';

class Tooltip extends Component {

    lastX = null;
    lastY = null;

    render() {
        let x = this.props.tooltip.x + this.props.tooltip.marginLeft + 20;
        let y = this.props.tooltip.y + this.props.tooltip.marginTop;

        if (this.props.tooltip.x) {
            this.lastX = x;
        } else {
            x = this.lastX;
        }

        if (this.props.tooltip.y) {
            this.lastY = y;
        } else {
            y = this.lastY;
        }

        if (this.refs.tooltipRoot) {
            let box = this.refs.tooltipRoot.parentNode.parentNode.parentNode.parentNode;
            let tooltipWidth = this.refs.tooltipRoot.clientWidth;
            if (tooltipWidth > 50) {
                if (x + tooltipWidth > box.clientWidth) {
                    x = x - this.refs.tooltipRoot.clientWidth - this.props.tooltip.marginLeft;
                }
            }
        }

        let show = false;
        if (x && y) {
            show = true;
        }



        return (
            <div ref="tooltipRoot" className="tooltip" style={{left : x, top : y}}>
                {show && this.props.tooltip.data &&
                    <div>
                        <div className="time">{this.props.tooltip.data.time}</div>
                        <ul>
                            {this.props.tooltip.data.lines.map((d, i) => {
                                return(
                                    <li key={i} style={{color :d.color}}>
                                        <div className="instance-name">{d.instanceName}</div>
                                        <div className="metric-name">{d.metricName}</div>
                                        <div className="value">{d.value}</div>
                                    </li>)
                            })}
                        </ul>
                    </div>
                }
            </div>
        );
    }
}

export default Tooltip;
