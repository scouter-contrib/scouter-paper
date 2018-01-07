import React, {Component} from 'react';
import './Settings.css';
import {connect} from 'react-redux';
import {setConfig} from '../../actions';

class Settings extends Component {

    constructor(props) {
        super(props);

        this.state = {
            config: {
                protocol: "http",
                address: "127.0.0.1",
                port: 6188,
                interval: 1000,
                numberFormat : "999,999.00",
                dateFormat : "YYYY-MM-DD",
                timeFormat : "HH:MM:SS",
                minuteFormat : "HH:MM"
            },
            edit : false
        };
    }

    onChange = (attr, event) => {
        let config = this.state.config;
        config[attr] = event.target.value;
        this.setState({
            config: config
        });
    };

    applyConfig = () => {
        if (localStorage) {
            this.props.setConfig(this.state.config)
            localStorage.setItem("config", JSON.stringify(this.state.config));
            this.setState({
                edit : false
            });
        }
    };

    resetConfig = () => {
        if (this.props.config) {
            this.setState({
                config: JSON.parse(JSON.stringify(this.props.config)),
                edit : false
            });
        }
    };

    editClick = () => {
        this.setState({
            edit : true
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

    render() {
        return (
            <div className="settings">
                <div className="forms">
                    <div className="category"><div>SCOUTER SERVER INFO</div></div>
                    <div className="row">
                        <div className="label">
                            <div>PROTOCOL</div>
                        </div>
                        <div className="input">
                            <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "protocol")} value={this.state.config.protocol}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="label">
                            <div>ADDRESS</div>
                        </div>
                        <div className="input">
                            <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "address")} value={this.state.config.address}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="label">
                            <div>POST</div>
                        </div>
                        <div className="input">
                            <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "port")} value={this.state.config.port}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="label">
                            <div>INTERVAL</div>
                        </div>
                        <div className="input">
                            <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "interval")} value={this.state.config.interval}/>
                        </div>
                    </div>
                    <div className="category"><div>DATA FORMAT CONFIGURATION</div></div>
                    <div className="row">
                        <div className="label">
                            <div>NUMBER FORMAT</div>
                        </div>
                        <div className="input">
                            <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "numberFormat")} value={this.state.config.numberFormat}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="label">
                            <div>DATE FORMAT</div>
                        </div>
                        <div className="input">
                            <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "dateFormat")} value={this.state.config.dateFormat}/>
                        </div>
                    </div>
                    <div className="row ">
                        <div className="label">
                            <div>TIME FORMAT</div>
                        </div>
                        <div className="input">
                            <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "timeFormat")} value={this.state.config.timeFormat}/>
                        </div>
                    </div>
                    <div className="row last">
                        <div className="label">
                            <div>MINUTES FORMAT</div>
                        </div>
                        <div className="input">
                            <input type="text" readOnly={!this.state.edit} onChange={this.onChange.bind(this, "minuteFormat")} value={this.state.config.minuteFormat} />
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
            </div>
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