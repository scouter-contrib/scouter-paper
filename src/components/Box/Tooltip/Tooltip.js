import React, {Component} from 'react';
import './Tooltip.css';

class Tooltip extends Component {

    lastX = null;
    lastY = null;

    getComputedTranslateX = (obj) => {
        try {
            if (!window.getComputedStyle) return;
            let style = getComputedStyle(obj);
            let transform = style.transform || style.webkitTransform || style.mozTransform;
            let mat = transform.match(/^matrix3d\((.+)\)$/);
            if (mat) return parseFloat(mat[1].split(', ')[12]);
            mat = transform.match(/^matrix\((.+)\)$/);
            return mat ? parseFloat(mat[1].split(', ')[4]) : 0;
        } catch (e) {
            return 0;
        }
    };

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

        let tooltipWidth = 0;

        if (this.refs.tooltipRoot) {
            let tempX = x;
            let box = this.refs.tooltipRoot.parentNode.parentNode.parentNode.parentNode;
            tooltipWidth = this.refs.tooltipRoot.clientWidth;
            if (tooltipWidth > 50) {
                if (x + tooltipWidth > box.clientWidth) {
                    tempX = x - this.refs.tooltipRoot.clientWidth - this.props.tooltip.marginLeft;
                }
            }

            let translateX = this.getComputedTranslateX(box.parentNode);
            if (tempX + translateX < 0) {

            } else {
                x = tempX;
            }

        }

        let show = false;
        if (x && y) {
            show = true;
        }

        if (isNaN(x)) {
            x = this.lastX;
        }

        let hasData = this.props.tooltip.data && this.props.tooltip.data.lines && this.props.tooltip.data.lines.length > 0 && tooltipWidth > 50;
        return (
            <div ref="tooltipRoot" className={"tooltip " + (hasData ? '' : 'no-data')} style={{left: x, top: y}}>
                {show && this.props.tooltip.data &&
                <div>
                    <div className="time">{this.props.tooltip.data.time} {`${this.props.tooltip.data.chartType === "STACK AREA" ? "Sum :"+this.props.tooltip.data.counterSum : "" }`}</div>
                    <ul>
                        {this.props.tooltip.data.lines.map((d, i) => {
                            return (
                                <li key={i} style={{color: d.color}}>
                                    <div className="instance-name">{d.instanceName}</div>
                                    <div className="metric-name">{d.metricName}</div>
                                    <div className="value">{d.displayValue}</div>
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
