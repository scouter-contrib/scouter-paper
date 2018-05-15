import React, {Component} from 'react';
import './XLogFilter.css';

class XLogFilter extends Component {

    constructor(props){
        super(props);

        this.state = {
            txid : "",
            gxid : "",
            type : "ALL",
            service : "",
            minElapsedTime : "",
            maxElapsedTime : "",
            address : "",
            referrer : "",
            login : "",
            userAgent : ""
        };
    }

    resize = () => {
        if (this.refs.XLogFilter) {
            let width = this.refs.XLogFilter.offsetWidth;
            if (width < 600) {
                if (!this.state.singleRow) {
                    this.setState({
                        singleRow : true
                    });
                }
            } else {
                if (this.state.singleRow) {
                    this.setState({
                        singleRow : false
                    });
                }

            }
        }
    };

    componentDidUpdate() {
        this.resize();
    }

    componentDidMount() {
        this.resize();

        this.setState({
            txid : this.props.filterInfo.txid ? this.props.filterInfo.txid : "",
            gxid : this.props.filterInfo.gxid ? this.props.filterInfo.gxid : "",
            type : this.props.filterInfo.type ? this.props.filterInfo.type : "ALL",
            service : this.props.filterInfo.service ? this.props.filterInfo.service : "",
            minElapsedTime : this.props.filterInfo.minElapsedTime ? this.props.filterInfo.minElapsedTime : "",
            maxElapsedTime : this.props.filterInfo.maxElapsedTime ? this.props.filterInfo.maxElapsedTime : "",
            address : this.props.filterInfo.address ? this.props.filterInfo.address : "",
            referrer : this.props.filterInfo.referrer ? this.props.filterInfo.referrer : "",
            login : this.props.filterInfo.login ? this.props.filterInfo.login : "",
            userAgent : this.props.filterInfo.userAgent ? this.props.filterInfo.userAgent : ""
        });
    }

    onChangeType = (type) => {
        this.setState({
            type : type
        });
    };

    onChangeService = (event) => {
        this.setState({
            service : event.target.value
        });
    };

    onChangeCondition = (key, event) => {
        let state = Object.assign(this.state);
        state[key] = event.target.value;
        this.setState(state);
    };
    
    onApply = () => {
        this.props.setXlogFilter(this.props.box.key, true, this.state);
    };

    onClear = () => {
        this.props.setXlogFilter(this.props.box.key, false, null);        
    };

    render() {
        return (
            <div className={"xlog-filter-wrapper " + (this.state.singleRow ? "single-row" : "")} onMouseDown={(e) => {e.stopPropagation();}} onMouseUp={(e) => {e.stopPropagation();}} ref="XLogFilter">
                <div className="xlog-filter-wrapper-cell">
                    <div className="xlog-filter">
                        <div className="xlog-filter-title">XLOG FILTER</div>
                        <div className="xlog-filter-content">
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">TXID</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "txid")} value={this.state.txid} /></div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">GXID</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "gxid")} value={this.state.gxid} /></div>
                            </div>                    
                            <div className="xlog-filter-content-row">
                                <div className="xlog-filter-content-row-label">ERROR</div>
                                <div className="xlog-filter-content-row-control type-control">
                                    <button className={this.state.type === "ALL" ? "active" : ""} onClick={this.onChangeType.bind(this, "ALL")}>ALL</button>
                                    <button className={this.state.type === "ERROR" ? "active" : ""} onClick={this.onChangeType.bind(this, "ERROR")}>ERROR</button>
                                    <button className={this.state.type === "ASYNC" ? "active" : ""} onClick={this.onChangeType.bind(this, "ASYNC")}>ASYNC</button>
                                    <button className={this.state.type === "SYNC" ? "active" : ""} onClick={this.onChangeType.bind(this, "SYNC")}>SYNC</button>
                                </div>
                            </div>
                            <div className="xlog-filter-content-line"></div>
                            <div className="xlog-filter-content-row">
                                <div className="xlog-filter-content-row-label">SERVICE</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeService.bind(this)} value={this.state.service} /></div>
                            </div>
                            <div className="xlog-filter-content-row xlog-filter-elapsed">
                                <div className="xlog-filter-content-row-label">ELAPSED</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "minElapsedTime")} value={this.state.minElapsedTime} /></div>
                                <div className="xlog-filter-content-row-text">~</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "maxElapsedTime")} value={this.state.maxElapsedTime} /></div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">LOGIN</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "login")} value={this.state.login} /></div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">U-AGENT</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "userAgent")} value={this.state.userAgent} /></div>
                            </div>
                            
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">ADDRESS</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "address")} value={this.state.address} /></div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">REFERRER</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "referrer")} value={this.state.referrer} /></div>
                            </div>
                        </div>
                        <div className="xlog-filter-btns">
                            <button onClick={this.onClear}>CELAR FILTER</button>
                            <button onClick={this.onApply} >SET FILTER</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default XLogFilter;

