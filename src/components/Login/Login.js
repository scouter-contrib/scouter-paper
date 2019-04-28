import React, {Component} from 'react';
import './Login.css';
import {connect} from 'react-redux';
import {addRequest, clearAllMessage, setControlVisibility, pushMessage, setUserId, } from '../../actions';
import jQuery from "jquery";
import {withRouter} from 'react-router-dom';
import TimeAgo from 'react-timeago'
import {errorHandler, getWithCredentials, getDefaultServerConfig} from '../../common/common';
import logo from '../../img/scouter.png';
import logoBlack from '../../img/scouter_black.png';

class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            control: {
                id: "",
                password: "",
                message: null
            }
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(target, event) {

        if (target === "id") {
            this.setState({
                control: {
                    id: event.target.value,
                    password: this.state.control.password
                }
            });
        }

        if (target === "password") {
            this.setState({
                control: {
                    id: this.state.control.id,
                    password: event.target.value
                }
            });
        }
    }


    logout = () => {

        let defaultServerconfig = getDefaultServerConfig(this.props.config);
        let origin = defaultServerconfig.protocol + "://" + defaultServerconfig.address + ":" + defaultServerconfig.port;

        document["cookie"] = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        this.props.setUserId(origin, null, null, null);

        let user = Object.assign({}, this.props.user);
        user[origin] = {
            id: null,
            token : null,
            time : null
        };
        localStorage.setItem("user", JSON.stringify(user));
    };

    login = () => {

        let condition = {
            user: {
                id: this.state.control.id,
                password: this.state.control.password
            }
        };

        let defaultServerconfig = getDefaultServerConfig(this.props.config);
        let action = "";
        if (defaultServerconfig.authentification === "cookie") {
            action = "/scouter/v1/user/login";
        } else {
            action = "/scouter/v1/user/loginGetToken";
        }

        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();

        let origin = defaultServerconfig.protocol + "://" + defaultServerconfig.address + ":" + defaultServerconfig.port;
        jQuery.ajax({
            method: "POST",
            url: origin + action,
            xhrFields: getWithCredentials(this.props.config),
            data: JSON.stringify(condition),
            contentType: "application/json; charset=UTF-8",
            processData: false
        }).done((msg) => {
            if (getDefaultServerConfig(this.props.config).authentification === "cookie") {
                if (msg.status === "200") {
                    let now = (new Date()).getTime();
                    this.props.setUserId(origin, this.state.control.id, null, now);
                    let user = Object.assign({}, this.props.user);
                    user[origin] = {
                        id: this.state.control.id,
                        token : null,
                        time : now
                    };
                    localStorage.setItem("user", JSON.stringify(user));
                } else {
                    this.setState({
                        message: "LOGIN FAILED"
                    });
                }
            } else {
                if (msg.result.success) {
                    let now = (new Date()).getTime();
                    this.props.setUserId(origin, this.state.control.id, msg.result.bearerToken, now);
                    let user = Object.assign({}, this.props.user);
                    user[origin] = {
                        id: this.state.control.id,
                        token : msg.result.bearerToken,
                        time : now
                    };
                    localStorage.setItem("user", JSON.stringify(user));
                } else {
                    this.setState({
                        message: "LOGIN FAILED"
                    });
                }
            }

        }).fail((xhr, textStatus, errorThrown) => {
            errorHandler(xhr, textStatus, errorThrown, this.props, "login", false);
        }).always(() => {
            this.props.setControlVisibility("Loading", false);
        });
    };

    handleKeyPress = (event) => {
        if(event.key === 'Enter'){
            this.login();
        }
    };

    handleIdKeyPress = (event) => {
        if(event.key === 'Enter'){
            this.refs.password.focus();
        }
    };

    render() {

        let defaultServerconfig = getDefaultServerConfig(this.props.config);
        let origin = defaultServerconfig.protocol + "://" + defaultServerconfig.address + ":" + defaultServerconfig.port;        
        
        return (
            <div className="login-wrapper">
                <div>
                    <div className="login-content">
                        {(!this.props.user[origin] || !this.props.user[origin].id) &&
                        <div className="login-box">
                            <div className="logo-div"><img alt="scouter-logo" className="logo" src={this.props.config.theme === "theme-gray" ? logoBlack : logo}/></div>
                            <div className="product">SCOUTER PAPER</div>
                            <div className="current-server">{origin}</div>
                            <div>
                                <input type="text" placeholder="ID" value={this.state.control.id} onChange={this.handleChange.bind(this, "id")} onKeyPress={this.handleIdKeyPress} />
                            </div>
                            <div>
                                <input ref="password" type="password" placeholder="PASSWORD" value={this.state.control.password} onChange={this.handleChange.bind(this, "password")} onKeyPress={this.handleKeyPress} />
                            </div>
                            <div className="login-btn">
                                <button onClick={this.login}>LOGIN</button>
                            </div>
                            <div className="login-message">{this.state.message}</div>
                        </div>
                        }
                        {(this.props.user[origin] && this.props.user[origin].id) &&
                        <div className="login-box">
                            <div className="logo-div"><img alt="scouter-logo" className="logo" src={this.props.config.theme === "theme-gray" ? logoBlack : logo}/></div>
                            <div className="product">SCOUTER PAPER</div>
                            <div className="current-server">{origin}</div>
                            <div className="user-id">{this.props.user[origin].id}</div>
                            <div className="when">LOGIN <TimeAgo date={this.props.user[origin].time}/></div>
                            <div className="logout-btn">
                                <button onClick={this.logout}>LOGOUT</button>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config,
        user: state.user
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage()),
        setUserId: (origin, id, token, time) => dispatch(setUserId(origin, id, token, time)),
        addRequest: () => dispatch(addRequest()),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content))
    };
};

Login = connect(mapStateToProps, mapDispatchToProps)(Login);

export default withRouter(Login);