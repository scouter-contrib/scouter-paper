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
        };
    }

    componentDidMount() {
        const {cpu, sql, api, elapsed} = this.props;
        this.setState({'cpuPercent': calcPercent(cpu, elapsed)});
        this.setState({'sqlPercent': calcPercent(sql, elapsed)});
        this.setState({'apiPercent': calcPercent(api, elapsed)});
        this.setState({'otherPercent': calcPercent(elapsed-cpu-sql-api, elapsed)});
    }

    render() {
        return (
            <div className="ratio-bar">
                <div className="ratio-header">
                    <div> PROFILE STEP</div>
                </div>
                <div className="ratio-body">
                    <div>
                        <div className="ratio cpu" style={{width: `${this.state.cpuPercent}%`}}></div>
                        <div className="ratio sql" style={{width: `${this.state.sqlPercent}%`}}></div>
                        <div className="ratio api" style={{width: `${this.state.apiPercent}%`}}></div>
                        <div className="ratio other"></div>
                    </div>
                </div>
            </div>);
    }
}


