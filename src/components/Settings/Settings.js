import React, {Component} from 'react';
import './Settings.css';
import {connect} from 'react-redux';
import {setConfig} from '../../actions';
import {CompactPicker} from 'react-color';

const colors = ['transparent', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF', '#333333', '#808080', '#cccccc', '#D33115', '#E27300', '#FCC400', '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF', '#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00', '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E'];
class Settings extends Component {

    constructor(props) {
        super(props);

        this.state = {
            config: null,
            selected : {
                normal : {
                    cellId : null,
                    color : "white"
                },
                async : {
                    cellId : null,
                    color : "white"
                },
                error : {
                    cellId : null,
                    color : "white"
                }
            },
            edit: false
        };
    }

    componentDidUpdate(prevProps, prevState) {


    }


    onChange = (attr, event) => {
        let config = this.state.config;
        config[attr] = event.target.value;
        this.setState({
            config: config
        });
    };

    onChangeSession = (attr, event) => {

        let config = this.state.config;
        config.authentification[attr] = event.target.value;

        this.setState({
            config: config
        });
    };

    onChangeFont = (attr, event) => {

        let config = this.state.config;
        config.fontSetting[attr] = event.target.value;

        this.setState({
            config: config
        });
    };

    onXLogOptionChange = (type, dir, event) => {

        let config = this.state.config;

        config.xlog[type][dir] = event.target.value;
        this.setState({
            config: config
        });

    };

    applyConfig = () => {
        if (localStorage) {
            this.props.setConfig(this.state.config);
            localStorage.setItem("config", JSON.stringify(this.state.config));
            this.setState({
                edit: false,
                selected : {
                    normal : {
                        cellId : null,
                        color : "white"
                    },
                    async : {
                        cellId : null,
                        color : "white"
                    },
                    error : {
                        cellId : null,
                        color : "white"
                    }
                },
            });
        }
    };

    resetConfig = () => {
        if (this.props.config) {
            this.setState({
                config: JSON.parse(JSON.stringify(this.props.config)),
                edit: false,
                selected : {
                    normal : {
                        cellId : null,
                        color : "white"
                    },
                    async : {
                        cellId : null,
                        color : "white"
                    },
                    error : {
                        cellId : null,
                        color : "white"
                    }
                },
            });
        }
    };

    editClick = () => {
        this.setState({
            edit: true,
            selected : {
                normal : {
                    cellId : null,
                    color : "white"
                },
                async : {
                    cellId : null,
                    color : "white"
                },
                error : {
                    cellId : null,
                    color : "white"
                }
            },
        });
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.config) {
            this.setState({
                config: JSON.parse(JSON.stringify(nextProps.config))
            });
        }
    };

    componentDidMount() {
        if (this.props.config) {
            this.setState({
                config: JSON.parse(JSON.stringify(this.props.config))
            });
        }
    }

    getXLogDraw = (type) => {
        let xlogDotSetting = [];
        for (let i = 0; i < this.state.config.xlog[type].rows; i++) {
            xlogDotSetting.push({
                row: i,
                columns: []
            });

            for (let j = 0; j < this.state.config.xlog[type].columns; j++) {
                xlogDotSetting[i].columns.push({
                    column: j
                })
            }
        }

        return xlogDotSetting;
    };

    selectXLogCell = (type, cellId) => {

        if (!this.state.edit) {
            return;
        }
        let selected = this.state.selected;
        if (selected[type].cellId  === cellId) {
            selected[type].cellId = null;
        } else {
            selected[type].cellId = cellId;
            if (this.state.config.xlog[type].fills[cellId]) {
                selected[type].color = this.state.config.xlog[type].fills[cellId].color;
            } else {
                selected[type].color = "transparent";
            }

        }

        this.setState({
            selected : selected
        });

    };

    normalColorChange = (color, event) => {

        if (!this.state.edit) {
            return;
        }

        let cellId = this.state.selected.normal.cellId;
        let selected = this.state.selected;
        if (cellId) {
            let config = this.state.config;
            if (config.xlog.normal.fills[cellId]) {
                if (color.hex === "transparent") {
                    delete config.xlog.normal.fills[cellId];
                } else {
                    config.xlog.normal.fills[cellId].color = color.hex;
                }
            } else {
                config.xlog.normal.fills[cellId] = {};
                config.xlog.normal.fills[cellId].color = color.hex;
            }

            selected.normal.color = color.hex;

            this.setState({
                config : config,
                selected : selected
            });
        }
    };

    asyncColorChange = (color, event) => {

        if (!this.state.edit) {
            return;
        }

        let cellId = this.state.selected.async.cellId;
        let selected = this.state.selected;
        if (cellId) {
            let config = this.state.config;
            if (config.xlog.async.fills[cellId]) {
                if (color.hex === "transparent") {
                    delete config.xlog.async.fills[cellId];
                } else {
                    config.xlog.async.fills[cellId].color = color.hex;
                }
            } else {
                config.xlog.async.fills[cellId] = {};
                config.xlog.async.fills[cellId].color = color.hex;
            }

            selected.async.color = color.hex;

            this.setState({
                config : config,
                selected : selected
            });
        }
    };

    errorColorChange = (color, event) => {

        if (!this.state.edit) {
            return;
        }

        let cellId = this.state.selected.error.cellId;
        let selected = this.state.selected;
        if (cellId) {
            let config = this.state.config;
            if (config.xlog.error.fills[cellId]) {
                if (color.hex === "transparent") {
                    delete config.xlog.error.fills[cellId];
                } else {
                    config.xlog.error.fills[cellId].color = color.hex;
                }
            } else {
                config.xlog.error.fills[cellId] = {};
                config.xlog.error.fills[cellId].color = color.hex;
            }

            selected.error.color = color.hex;

            this.setState({
                config : config,
                selected : selected
            });
        }
    };

    render() {
        let normalDotSetting = [];
        let asyncDotSetting = [];
        let errorDotSetting = [];
        if (this.state.config) {
            normalDotSetting = this.getXLogDraw("normal");
            asyncDotSetting = this.getXLogDraw("async");
            errorDotSetting = this.getXLogDraw("error");
        }

        return (
            <div>
                {this.state.config &&
                <div className={"settings " + (this.state.edit ? 'editable' : '')}>
                    <div className="forms">
                        <div className="category first">
                            <div>SCOUTER WEB API SERVER INFO</div>
                        </div>
                        <div className="setting-box">
                            <div className="row">
                                <div className="label">
                                    <div>PROTOCOL</div>
                                </div>
                                <div className="input">
                                    <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "protocol")} value={this.state.config.protocol} placeholder="HTTP or HTTPS"/>
                                </div>
                            </div>
                            <div className="row">
                                <div className="label">
                                    <div>ADDRESS</div>
                                </div>
                                <div className="input">
                                    <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "address")} value={this.state.config.address} placeholder="SCOUTER WEBAPP SERVER ADDRESS" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="label">
                                    <div>PORT</div>
                                </div>
                                <div className="input">
                                    <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "port")} value={this.state.config.port} placeholder="SCOUTER WEBAPP SERVER PORT (DEFAULT 6188)" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="label">
                                    <div>AUTHENTIFICATION TYPE</div>
                                </div>
                                <div className="input">
                                    <select value={this.state.config.authentification.type} onChange={this.onChangeSession.bind(this, "type")} disabled={!this.state.edit}>
                                        <option value="bearer">token (bearer)</option>
                                        <option value="cookie">cookie</option>
                                        <option value="none">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="category first">
                            <div>POLLING INTERVAL</div>
                        </div>
                        <div className="setting-box">
                            <div className="row">
                                <div className="label">
                                    <div>INTERVAL (ms)</div>
                                </div>
                                <div className="input">
                                    <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "interval")} value={this.state.config.interval} placeholder="POLLING INTERVAL (MS)" />
                                </div>
                            </div>
                        </div>
                        <div className="category">
                            <div>FONTS CONFIGURATION</div>
                        </div>
                        <div className="setting-box auth-info">
                            <div className="row">
                                <div className="label">
                                    <div>BASIC FONT</div>
                                </div>
                                <div className="input">
                                    <select value={this.state.config.fontSetting.basic} onChange={this.onChangeFont.bind(this, "basic")} disabled={!this.state.edit}>
                                        {this.state.config.fonts.filter((d) => {return d.val !== "Bungee"}).map((d, i) => {
                                            return <option key={i} style={{fontFamily : d.val, fontSize : "14px"}} value={d.val}>{d.name}, {d.generic}</option>
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="label">
                                    <div>MENU FONT</div>
                                </div>
                                <div className="input">
                                    <select value={this.state.config.fontSetting.menu} onChange={this.onChangeFont.bind(this, "menu")} disabled={!this.state.edit}>
                                        {this.state.config.fonts.filter((d) => {return d.type === "display"}).map((d, i) => {
                                            return <option key={i} style={{fontFamily : d.val, fontSize : "14px"}} value={d.val}>{d.name}, {d.generic}</option>
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="label">
                                    <div>CHART AXIS FONT</div>
                                </div>
                                <div className="input">
                                    <select value={this.state.config.fontSetting.axis} onChange={this.onChangeFont.bind(this, "axis")} disabled={!this.state.edit}>
                                        {this.state.config.fonts.map((d, i) => {
                                            return <option key={i} style={{fontFamily : d.val, fontSize : "14px"}} value={d.val}>{d.name}, {d.generic}</option>
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="label">
                                    <div>CHART TOOLTIP FONT</div>
                                </div>
                                <div className="input">
                                    <select value={this.state.config.fontSetting.tooltip} onChange={this.onChangeFont.bind(this, "tooltip")} disabled={!this.state.edit}>
                                        {this.state.config.fonts.map((d, i) => {
                                            return <option key={i} style={{fontFamily : d.val, fontSize : "14px"}} value={d.val}>{d.name}, {d.generic}</option>
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="label">
                                    <div>XLOG PROFILER FONT</div>
                                </div>
                                <div className="input">
                                    <select value={this.state.config.fontSetting.profiler} onChange={this.onChangeFont.bind(this, "profiler")} disabled={!this.state.edit}>
                                        {this.state.config.fonts.map((d, i) => {
                                            return <option key={i} style={{fontFamily : d.val, fontSize : "14px"}} value={d.val}>{d.name}, {d.generic}</option>
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="category">
                            <div>DATA FORMAT CONFIGURATION</div>
                        </div>
                        <div className="setting-box">
                            <div className="row">
                                <div className="label">
                                    <div>NUMBER FORMAT</div>
                                </div>
                                <div className="input">
                                    <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "numberFormat")} value={this.state.config.numberFormat} placeholder="0,0" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="label">
                                    <div>DATE FORMAT</div>
                                </div>
                                <div className="input">
                                    <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "dateFormat")} value={this.state.config.dateFormat} placeholder="%Y-%m-%d" />
                                </div>
                            </div>
                            <div className="row ">
                                <div className="label">
                                    <div>TIME FORMAT</div>
                                </div>
                                <div className="input">
                                    <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "timeFormat")} value={this.state.config.timeFormat} placeholder="%H:%M:%S" />
                                </div>
                            </div>
                            <div className="row last">
                                <div className="label">
                                    <div>MINUTES FORMAT</div>
                                </div>
                                <div className="input">
                                    <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "minuteFormat")} value={this.state.config.minuteFormat}  placeholder="%H:%M" />
                                </div>
                            </div>
                        </div>
                        <div className="category">
                            <div>XLOG CONFIGURATION</div>
                        </div>
                        <div className="setting-box dot-box">
                            <div className="dot-group">
                                <div className="row dot-row">
                                    <div className="label">
                                        <div>XLOG (NORMAL)</div>
                                    </div>
                                    <div className="input xlog-option">
                                        <div className="xlog-label">ROWS</div>
                                        <select value={this.state.config.xlog.normal.rows} onChange={this.onXLogOptionChange.bind(this, "normal", "rows")} disabled={!this.state.edit}>
                                            <option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option>
                                        </select>
                                        <div className="xlog-label second">COLUMNS</div>
                                        <select value={this.state.config.xlog.normal.columns} onChange={this.onXLogOptionChange.bind(this, "normal", "columns")} disabled={!this.state.edit}>
                                            <option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option>
                                        </select>
                                    </div>
                                    <div className="input xlog-option last">
                                        <div className="xlog-label">OPACITY</div>
                                        <select value={this.state.config.xlog.normal.opacity} onChange={this.onXLogOptionChange.bind(this, "normal", "opacity")} disabled={!this.state.edit}>
                                            <option>0.1</option><option>0.2</option><option>0.3</option><option>0.4</option><option>0.5</option><option>0.6</option><option>0.7</option><option>0.8</option><option>0.9</option><option>1</option>
                                        </select>
                                        <div className="xlog-label second">SAMPLING</div>
                                        <select value={this.state.config.xlog.normal.sampling} onChange={this.onXLogOptionChange.bind(this, "normal", "sampling")} disabled={!this.state.edit}>
                                            <option value="10">10%</option><option value="20">20%</option><option value="30">30%</option><option value="40">40%</option><option value="50">50%</option><option value="60">60%</option><option value="70">70%</option><option value="80">80%</option><option value="90">90%</option><option value="100">100%</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row dot-row">
                                    <div className="label">
                                        <div>XLOG (NORMAL)</div>
                                    </div>
                                    <div className="input">
                                        <div className="xlog-dot-config">
                                            <div className="xlog-dot-config-left" style={{width : ((this.state.config.xlog.normal.columns * 20) + 20) + "px"}}>
                                                <div className="xlog-dot-item">
                                                    {normalDotSetting.map((d, i) => {
                                                        return <div key={i} className={"xlog-dot-rows " + ((normalDotSetting.length - 1) === i ? 'last' : '')}>
                                                            {d.columns.map((c, j) => {
                                                                let cellId = "D_" + i + "_" + j;
                                                                let fill = this.state.config.xlog.normal.fills[cellId];
                                                                let color = "transparent";
                                                                if (fill) {
                                                                    color = fill.color;
                                                                }
                                                                let selected = (this.state.selected["normal"].cellId === cellId);
                                                                return <div key={j} onClick={this.selectXLogCell.bind(null, "normal", cellId)} className={"xlog-dot-columns " + (selected ? 'selected ' : ' ') + (((d.columns.length - 1) === j) ? 'last ' : ' ')} style={{backgroundColor: color}}></div>
                                                            })}
                                                        </div>
                                                    })}
                                                </div>
                                            </div>
                                            <div className="xlog-config-controller">
                                                <CompactPicker colors={colors} color={ this.state.selected.normal.color } onChange={this.normalColorChange}/>
                                                <div className="disabled-wrapper"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="dot-group">
                                <div className="row dot-row">
                                    <div className="label">
                                        <div>XLOG (ASYNC)</div>
                                    </div>
                                    <div className="input xlog-option">
                                        <div className="xlog-label">ROWS</div>
                                        <select value={this.state.config.xlog.async.rows} onChange={this.onXLogOptionChange.bind(this, "async", "rows")} disabled={!this.state.edit}>
                                            <option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option>
                                        </select>
                                        <div className="xlog-label second">COLUMNS</div>
                                        <select value={this.state.config.xlog.async.columns} onChange={this.onXLogOptionChange.bind(this, "async", "columns")} disabled={!this.state.edit}>
                                            <option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option>
                                        </select>
                                    </div>
                                    <div className="input xlog-option last">
                                        <div className="xlog-label">OPACITY</div>
                                        <select value={this.state.config.xlog.async.opacity} onChange={this.onXLogOptionChange.bind(this, "async", "opacity")} disabled={!this.state.edit}>
                                            <option>0.1</option><option>0.2</option><option>0.3</option><option>0.4</option><option>0.5</option><option>0.6</option><option>0.7</option><option>0.8</option><option>0.9</option><option>1</option>
                                        </select>
                                        <div className="xlog-label second">SAMPLING</div>
                                        <select value={this.state.config.xlog.async.sampling} onChange={this.onXLogOptionChange.bind(this, "async", "sampling")} disabled={!this.state.edit}>
                                            <option value="10">10%</option><option value="20">20%</option><option value="30">30%</option><option value="40">40%</option><option value="50">50%</option><option value="60">60%</option><option value="70">70%</option><option value="80">80%</option><option value="90">90%</option><option value="100">100%</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row dot-row">
                                    <div className="label">
                                        <div>XLOG (ASYNC)</div>
                                    </div>
                                    <div className="input">
                                        <div className="xlog-dot-config">
                                            <div className="xlog-dot-config-left" style={{width : ((this.state.config.xlog.async.columns * 20) + 20) + "px"}}>
                                                <div className="xlog-dot-item">
                                                    {asyncDotSetting.map((d, i) => {
                                                        return <div key={i} className={"xlog-dot-rows " + ((asyncDotSetting.length - 1) === i ? 'last' : '')}>
                                                            {d.columns.map((c, j) => {
                                                                let cellId = "D_" + i + "_" + j;
                                                                let fill = this.state.config.xlog.async.fills[cellId];
                                                                let color = "transparent";
                                                                if (fill) {
                                                                    color = fill.color;
                                                                }
                                                                let selected = (this.state.selected["async"].cellId === cellId);
                                                                return <div key={j} onClick={this.selectXLogCell.bind(null, "async", cellId)} className={"xlog-dot-columns " + (selected ? 'selected ' : ' ') + (((d.columns.length - 1) === j) ? 'last ' : ' ')} style={{backgroundColor: color}}></div>
                                                            })}
                                                        </div>
                                                    })}
                                                </div>
                                            </div>
                                            <div className="xlog-config-controller">
                                                <CompactPicker colors={colors} color={ this.state.selected.async.color } onChange={this.asyncColorChange}/>
                                                <div className="disabled-wrapper"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="dot-group">
                                <div className="row dot-row">
                                    <div className="label">
                                        <div>XLOG (ERROR)</div>
                                    </div>
                                    <div className="input xlog-option">
                                        <div className="xlog-label">ROWS</div>
                                        <select value={this.state.config.xlog.error.rows} onChange={this.onXLogOptionChange.bind(this, "error", "rows")} disabled={!this.state.edit}>
                                            <option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option>
                                        </select>
                                        <div className="xlog-label second">COLUMNS</div>
                                        <select value={this.state.config.xlog.error.columns} onChange={this.onXLogOptionChange.bind(this, "error", "columns")} disabled={!this.state.edit}>
                                            <option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option>
                                        </select>
                                    </div>
                                    <div className="input xlog-option last">
                                        <div className="xlog-label">OPACITY</div>
                                        <select value={this.state.config.xlog.error.opacity} onChange={this.onXLogOptionChange.bind(this, "error", "opacity")} disabled={!this.state.edit}>
                                            <option>0.1</option><option>0.2</option><option>0.3</option><option>0.4</option><option>0.5</option><option>0.6</option><option>0.7</option><option>0.8</option><option>0.9</option><option>1</option>
                                        </select>
                                        <div className="xlog-label second">SAMPLING</div>
                                        <select value={this.state.config.xlog.error.sampling} onChange={this.onXLogOptionChange.bind(this, "error", "sampling")} disabled={!this.state.edit}>
                                            <option value="10">10%</option><option value="20">20%</option><option value="30">30%</option><option value="40">40%</option><option value="50">50%</option><option value="60">60%</option><option value="70">70%</option><option value="80">80%</option><option value="90">90%</option><option value="100">100%</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row dot-row">
                                    <div className="label">
                                        <div>XLOG (ERROR)</div>
                                    </div>
                                    <div className="input">
                                        <div className="xlog-dot-config">
                                            <div className="xlog-dot-config-left" style={{width : ((this.state.config.xlog.error.columns * 20) + 20) + "px"}}>
                                                <div className="xlog-dot-item">
                                                    {errorDotSetting.map((d, i) => {
                                                        return <div key={i} className={"xlog-dot-rows " + ((errorDotSetting.length - 1) === i ? 'last' : '')}>
                                                            {d.columns.map((c, j) => {
                                                                let cellId = "D_" + i + "_" + j;
                                                                let fill = this.state.config.xlog.error.fills[cellId];
                                                                let color = "transparent";
                                                                if (fill) {
                                                                    color = fill.color;
                                                                }
                                                                let selected = (this.state.selected["error"].cellId === cellId);
                                                                return <div key={j} onClick={this.selectXLogCell.bind(null, "error", cellId)} className={"xlog-dot-columns " + (selected ? 'selected ' : ' ') + (((d.columns.length - 1) === j) ? 'last ' : ' ')} style={{backgroundColor: color}}></div>
                                                            })}
                                                        </div>
                                                    })}
                                                </div>
                                            </div>
                                            <div className="xlog-config-controller">
                                                <CompactPicker colors={colors} color={ this.state.selected.error.color } onChange={this.errorColorChange}/>
                                                <div className="disabled-wrapper"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.state.edit &&
                    <div className="buttons">
                        <button onClick={this.resetConfig}>CANCEL</button>
                        <button onClick={this.applyConfig}>APPLY</button>
                    </div>
                    }
                    {!this.state.edit &&
                    <div className="buttons">
                        <button onClick={this.editClick}>EDIT</button>
                    </div>
                    }
                </div>}</div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        instances: state.target.instances,
        config: state.config
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setConfig: (config) => dispatch(setConfig(config))
    };
};

Settings = connect(mapStateToProps, mapDispatchToProps)(Settings);

export default Settings;