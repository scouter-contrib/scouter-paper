import React, {Component} from 'react';
import './XLogFilter.css';
import ScouterPatternMatcher from "../../../common/ScouterPatternMatcher";

class XLogFilter extends Component {

    constructor(props){
        super(props);

        this.state = {
            txid : "",
            gxid : "",
            type : "ALL",
            minElapsedTime : "",
            maxElapsedTime : "",
            service : "",
            referrer : "",
            userAgent : "",
            login : "",
            desc : "",
            address : "",
            serviceMatcher : null,
            referrerMatcher : null,
            userAgentMatcher : null,
            loginMatcher : null,
            descMatcher : null,
            addressMatcher : null,
            small : false,
            hasDump : "ALL",
            startHmsFrom : "",
            startHmsTo : "",
            profileCountFrom : "",
            profileCountTo : "",
            text1 : "",
            text2 : "",
            text3 : "",
            text4 : "",
            text5 : ""
        };
    }

    resize = () => {
        if (this.refs.XLogFilter) {
            let width = this.refs.XLogFilter.offsetWidth;
            if (width < 500) {
                if (!this.state.small) {
                    this.setState({
                        small : true
                    });
                }
            } else {
                if (this.state.small) {
                    this.setState({
                        small : false
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
            desc : this.props.filterInfo.desc ? this.props.filterInfo.desc : "",
            userAgent : this.props.filterInfo.userAgent ? this.props.filterInfo.userAgent : "",
            hasDump : this.props.filterInfo.hasDump ? this.props.filterInfo.hasDump : "ALL",
            startHmsFrom : this.props.filterInfo.startHmsFrom ? this.props.filterInfo.startHmsFrom : "",
            startHmsTo : this.props.filterInfo.startHmsTo ? this.props.filterInfo.startHmsTo : "",
            profileCountFrom : this.props.filterInfo.profileCountFrom ? this.props.filterInfo.profileCountFrom : "",
            profileCountTo : this.props.filterInfo.profileCountTo ? this.props.filterInfo.profileCountTo : "",
            text1 : this.props.filterInfo.text1 ? this.props.filterInfo.text1 : "",
            text2 : this.props.filterInfo.text2 ? this.props.filterInfo.text2 : "",
            text3 : this.props.filterInfo.text3 ? this.props.filterInfo.text3 : "",
            text4 : this.props.filterInfo.text4 ? this.props.filterInfo.text4 : "",
            text5 : this.props.filterInfo.text5 ? this.props.filterInfo.text5 : ""
        });
    }

    onChangeType = (type) => {
        this.setState({
            type : type
        });
    };

    onChangeHasDump = (hasDump) => {
        this.setState({
            hasDump : hasDump
        });
    };

    onChangeService = (event) => {
        this.setState({
            service : event.target.value
        });
    };

    onChangeCondition = (key, event) => {
        let state = Object.assign({}, this.state);
        state[key] = event.target.value;
        this.setState(state);
    };
    
    onApply = () => {
        const filterState = Object.assign({}, this.state);
        filterState.serviceMatcher = new ScouterPatternMatcher(filterState.service);
        filterState.referrerMatcher = new ScouterPatternMatcher(filterState.referrer);
        filterState.userAgentMatcher = new ScouterPatternMatcher(filterState.userAgent);
        filterState.loginMatcher = new ScouterPatternMatcher(filterState.login);
        filterState.descMatcher = new ScouterPatternMatcher(filterState.desc);

        this.props.setXlogFilter(this.props.box.key, true, filterState);
    };

    onClear = () => {
        this.props.setXlogFilter(this.props.box.key, false, null);        
    };

    onClose = () => {
        this.props.closeFilter(this.props.box.key);        
    };

    openHelp = () => {
        window.open("https://github.com/scouter-project/scouter/blob/master/scouter.document/views/XLog-Filter.md", "_blank");
    };

    render() {
        return (
            <div className={"xlog-filter-wrapper " + (this.state.small ? "small" : "")} onMouseDown={(e) => {e.stopPropagation();}} onMouseUp={(e) => {e.stopPropagation();}} ref="XLogFilter">
                <div className="xlog-filter-wrapper-cell">
                    <div className="xlog-filter scrollbar">
                        <div className="xlog-filter-title">XLOG FILTER</div>
                        <button className="xlog-filter-help-btn" onClick={this.openHelp}><i className="fa fa-question-circle-o" aria-hidden="true"></i></button>
                        <button className="xlog-filter-close-btn" onClick={this.onClose}><i className="fa fa-times-circle-o" aria-hidden="true"></i></button>
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
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeService.bind(this)} value={this.state.service} placeholder="URL" /></div>
                            </div>
                            <div className="xlog-filter-content-row xlog-filter-elapsed">
                                <div className="xlog-filter-content-row-label">ELAPSED</div>
                                <div className="xlog-filter-content-row-control"><input type="number" onChange={this.onChangeCondition.bind(this, "minElapsedTime")} value={this.state.minElapsedTime} placeholder="ms" min="1" /></div>
                                <div className="xlog-filter-content-row-text">~</div>
                                <div className="xlog-filter-content-row-control"><input type="number" onChange={this.onChangeCondition.bind(this, "maxElapsedTime")} value={this.state.maxElapsedTime} placeholder="ms" min="1" /></div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">LOGIN</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "login")} value={this.state.login} /></div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">DESC</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "desc")} value={this.state.desc} /></div>
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
                            <div className="xlog-filter-content-row">
                                <div className="xlog-filter-content-row-label">HAS DUMP</div>
                                <div className="xlog-filter-content-row-control type-control">
                                    <button className={this.state.hasDump === "ALL" ? "active" : ""} onClick={this.onChangeHasDump.bind(this, "ALL")}>ALL</button>
                                    <button className={this.state.hasDump === "Y" ? "active" : ""} onClick={this.onChangeHasDump.bind(this, "Y")}>Y</button>
                                    <button className={this.state.hasDump === "N" ? "active" : ""} onClick={this.onChangeHasDump.bind(this, "N")}>N</button>
                                </div>
                            </div>
                            <div className="xlog-filter-content-row xlog-filter-elapsed">
                                <div className="xlog-filter-content-row-label">PROFILE COUNTER</div>
                                <div className="xlog-filter-content-row-control">
                                    <input type="number" onChange={this.onChangeCondition.bind(this, "profileCountFrom")} value={this.state.profileCountFrom} min="0"/>
                                </div>
                                <div className="xlog-filter-content-row-text">~</div>
                                <div className="xlog-filter-content-row-control">
                                    <input type="number" onChange={this.onChangeCondition.bind(this, "profileCountTo")} value={this.state.profileCountTo} min="1"/>
                                </div>
                            </div>
                            <div className="xlog-filter-content-row xlog-filter-elapsed">
                                <div className="xlog-filter-content-row-label">START TIME</div>
                                <div className="xlog-filter-content-row-control">
                                    <input type="text" onChange={this.onChangeCondition.bind(this, "startHmsFrom")} value={this.state.startHmsFrom} placeholder="HH:MM:SS"/>
                                </div>
                            <div className="xlog-filter-content-row-text">~</div>
                                <div className="xlog-filter-content-row-control">
                                    <input type="text" onChange={this.onChangeCondition.bind(this, "startHmsTo")} value={this.state.startHmsTo} placeholder="HH:MM:SS"/>
                                </div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">TEXT1</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "text1")} value={this.state.text1} /></div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">TEXT2</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "text2")} value={this.state.text2} /></div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">TEXT3</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "text3")} value={this.state.text3} /></div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">TEXT4</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "text4")} value={this.state.text4} /></div>
                            </div>
                            <div className="xlog-filter-content-row half">
                                <div className="xlog-filter-content-row-label">TEXT5</div>
                                <div className="xlog-filter-content-row-control"><input type="text" onChange={this.onChangeCondition.bind(this, "text5")} value={this.state.text5} /></div>
                            </div>

                        </div>
                        <div className="xlog-filter-btns">
                            <button onClick={this.onClear}>CLEAR FILTER</button>
                            <button onClick={this.onApply} >SET FILTER</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default XLogFilter;

