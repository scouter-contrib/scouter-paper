import React, {Component} from 'react';
import './Login.css';
import {connect} from 'react-redux';
import {addRequest, clearAllMessage, setControlVisibility, setBgColor, setUserId} from '../../actions';
import jQuery from "jquery";
import {withRouter} from 'react-router-dom';
import building from './building.png';
import light from './6.svg';
import Time from 'react-time-format'
import TimeAgo from 'react-timeago'

class Login extends Component {


    constructor(props) {
        super(props);

        this.state = {
            control: {
                id: "admin",
                password: "admin",
                message : null
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

    info = () => {

        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();

        jQuery.ajax({
            method: "GET",
            async: true,
            url: this.props.config.protocol + "://" + this.props.config.address + ":" + this.props.config.port + "/scouter/v1/user/info",
            xhrFields: {
                withCredentials: true
            },
        }).done((msg) => {
            if (msg) {
                if (msg.status === "200" && msg.resultCode === "0" && msg.result) {
                    this.props.setUserId(msg.result.id);
                    this.setState({
                        message : null
                    });
                }
            }
        }).fail((jqXHR, textStatus) => {
            console.log(jqXHR, textStatus);
        }).always(() => {
            this.props.setControlVisibility("Loading", false);
        });
    };

    logout = () => {
        document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        this.props.setUserId(null);
    };

    login = () => {

        let condition = {
            user: {
                id: this.state.control.id,
                password: this.state.control.password
            }
        };

        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();

        jQuery.ajax({
            method: "POST",
            url: this.props.config.protocol + "://" + this.props.config.address + ":" + this.props.config.port + "/scouter/v1/user/login",
            data: JSON.stringify(condition),
            contentType: "application/json; charset=UTF-8",
            processData: false,
            xhrFields: {
                withCredentials: true
            },
        }).done((msg) => {
            this.info();
        }).fail((jqXHR, textStatus) => {
            this.setState({
                message : "LOGIN FAILED"
            });
            console.log(jqXHR, textStatus);
        }).always(() => {
            this.props.setControlVisibility("Loading", false);
        });

    };

    componentDidMount() {
        //this.props.setBgColor("red");
        if (!this.props.user || !this.props.user.id) {
            this.info();
        }
    }

    componentWillUnmount() {

    }

    render() {

        return (
            <div className="login-wrapper">
                <div>
                    {this.props.user.id &&
                    <div className="user-content">
                        <div className="user-id">{this.props.user.id}</div>
                        <div className="when">LOGIN <TimeAgo date={this.props.user.when}/></div>
                        <div className="logout-btn">
                            <button onClick={this.logout}>LOGOUT</button>
                        </div>
                    </div>}
                    {!this.props.user.id &&
                    <div className="login-content">
                        <div className="login-image">
                            <img src={building}/>
                        </div>
                        <div>
                            <input type="text" placeholder="ID" value={this.state.control.id}
                                   onChange={this.handleChange.bind(this, "id")}/>
                        </div>
                        <div>
                            <input type="password" placeholder="PASSWORD" value={this.state.control.password}
                                   onChange={this.handleChange.bind(this, "password")}/>
                        </div>
                        <div className="login-btn">
                            <button onClick={this.login}>LOGIN</button>
                        </div>
                        <div className="login-message">{this.state.message}</div>
                    </div>
                    }
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
        setBgColor: (color) => dispatch(setBgColor(color)),
        setUserId: (id) => dispatch(setUserId(id)),
        addRequest: () => dispatch(addRequest()),
    };
};

Login = connect(mapStateToProps, mapDispatchToProps)(Login);

export default withRouter(Login);