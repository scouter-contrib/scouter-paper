import React, {Component} from 'react';
import './ProfileRatioBar.css';

const calcPercent = (part, total) => {
    return (part / total * 100).toFixed(1);
}

export default class ProfileRatioBar extends Component {

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

    ratioStyle = (percent) => {
        if (percent < 0.3) {
            return {display: 'none'};
        }
        
        return {width: `${percent}%`};
    }

    componentDidMount() {
        const {cpu, sql, api, elapsed} = this.props;
        const other = (elapsed - cpu - sql - api) > 0 ? (elapsed - cpu - sql - api) : 0;

        this.setState({cpu, sql, api, other});
        this.setState({'cpuPercent': calcPercent(cpu, elapsed), 
            'sqlPercent': calcPercent(sql, elapsed), 
            'apiPercent': calcPercent(api, elapsed), 
            'otherPercent': calcPercent(other, elapsed)});
    }

    render() {
        return (
            <div className="ratio-bar">
                <div className="legend-row">
                    <div className="legend-header">
                        <div></div>
                    </div>
                    <div className="ratio-legend">
                        <div>
                            <div className="legend cpu">CPU</div>
                            <div className="legend sql">SQL</div>
                            <div className="legend api">API</div>
                            <div className="legend other">OTHER</div>
                        </div>
                    </div>
                </div>
                <div className="ratio-row">
                    <div className="ratio-header">
                        <div> PROFILE STEP</div>
                    </div>
                    <div className="ratio-body">
                        <div>
                            <div className="ratio cpu" style={this.ratioStyle(this.state.cpuPercent)}>{this.state.cpu}ms</div>
                            <div className="ratio sql" style={this.ratioStyle(this.state.sqlPercent)}>{this.state.sql}ms</div>
                            <div className="ratio api" style={this.ratioStyle(this.state.apiPercent)}>{this.state.api}ms</div>
                            <div className="ratio other" style={this.ratioStyle(this.state.otherPercent)}>{this.state.other}ms</div>
                        </div>
                    </div>
                </div>
            </div>);
    }
}


