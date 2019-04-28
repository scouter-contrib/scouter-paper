import React, {Component} from 'react';
import './TimeRatio.css';

const calcPercent = (part, total) => {
    return (part / total * 100).toFixed(1);
};

export default class TimeRatio extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cpuPercent: 0,
            sqlPercent: 0,
            apiPercent: 0,
            otherPercent: 100,
            cpu: 0,
            sql: 0,
            api: 0,
            elapsed: 0
        };
    }

    init = (props) => {
        const {cpu, sql, api, elapsed} = props;

        const other = (elapsed - cpu - sql - api) > 0 ? (elapsed - cpu - sql - api) : 0;

        this.setState({cpu, sql, api, elapsed, other});
        this.setState({'cpuPercent': calcPercent(cpu, elapsed), 
            'sqlPercent': calcPercent(sql, elapsed), 
            'apiPercent': calcPercent(api, elapsed), 
            'otherPercent': calcPercent(other, elapsed)});
    };

    ratioStyle = (percent) => {
        if (percent < 0.3) {
            return {display: 'none'};
        }
        
        return {width: `${percent}%`};
    };

    componentWillReceiveProps(nextProps) {
        this.init(nextProps);
    }

    componentDidMount() {
        this.init(this.props);
    }

    render() {
        return (
            <div className="time-ratio">
                <div className="sub-title">TIME RATIO</div>
                <div className="ratio-bar">
                    <div className="legend-row">
                        
                        <div className="ratio-legend">
                            <span className="legend cpu">CPU <span className="time">({this.state.cpu} ms)</span></span>
                            <span className="legend sql">SQL <span className="time">({this.state.sql} ms)</span></span>
                            <span className="legend api">API <span className="time">({this.state.api} ms)</span></span>
                            <span className="legend other">OTHER <span className="time">({this.state.other} ms)</span></span>
                        </div>
                    </div>
                    {
                    this.state.elapsed > 0 && <div className="ratio-row">
                        <div className="ratio-body">
                            <div>
                                <div className="ratio cpu" style={this.ratioStyle(this.state.cpuPercent)}>{this.state.cpuPercent} %</div>
                                <div className="ratio sql" style={this.ratioStyle(this.state.sqlPercent)}>{this.state.sqlPercent} %</div>
                                <div className="ratio api" style={this.ratioStyle(this.state.apiPercent)}>{this.state.apiPercent} %</div>
                                <div className="ratio other" style={this.ratioStyle(this.state.otherPercent)}>{this.state.otherPercent} %</div>
                            </div>
                        </div>
                    </div>
                    }
                </div>
            </div>);
    }
}


