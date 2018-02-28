import React, {Component} from 'react';
import './App.css';
import {
    Settings,
    Paper,
    Loading,
    RequestBar,
    Menu,
    Login,
    Overlay,
    Message,
    ContentWrapper
} from './components';
import {Route, Switch} from 'react-router-dom';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {setConfig, addRequest, clearAllMessage, setControlVisibility, setUserId, pushMessage} from './actions';
import {detect} from 'detect-browser';
import Unsupport from "./components/Unsupport/Unsupport";
import jQuery from "jquery";

const browser = detect();
//const support = (browser.name === "chrome" || browser.name === "firefox" || browser.name === "opera" || browser.name === "safari");
const support = (browser.name !== "ie" && browser.name !== "edge");

class App extends Component {

    init = false;

    constructor(props) {
        super(props);
    }

    info = (user, config) => {
        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();

        jQuery.ajax({
            method: "GET",
            async: true,
            url: config.protocol + "://" + config.address + ":" + config.port + "/scouter/v1/kv/a",
            xhrFields: {
                withCredentials: (config.authentification && config.authentification.type === "token")
            },
            beforeSend: function (xhr) {
                if (config.authentification && config.authentification.type === "bearer") {
                    if (user && user.token) {
                        xhr.setRequestHeader('Authorization', 'bearer ' + user.token);
                    }
                }
            }
        }).done((msg) => {
            if (msg && Number(msg.status) === 200) {
                if (config.authentification && config.authentification.type === "bearer") {
                    this.props.setUserId(user.id, user.token, user.time);
                }

                if (config.authentification && config.authentification.type === "cookie") {
                    this.props.setUserId(user.id, null, user.time);
                }

            } else {
                sessionStorage.removeItem("user");
            }
        }).fail(() => {
            if (config.authentification && config.authentification.type === "none") {
                this.props.pushMessage("error", "CHECK SETTINGS", "current setting does not require authentication, but it actually requires authentication.");
                this.props.setControlVisibility("Message", true);
            }
            sessionStorage.removeItem("user");
        }).always(() => {
            this.props.setControlVisibility("Loading", false);
        });
    };

    componentDidMount() {
        let config = null;
        let str = localStorage.getItem("config");
        if (str) {
            config = JSON.parse(str);
            this.props.setConfig(config);
        } else {
            config = this.props.config;
        }

        let user = sessionStorage.getItem("user");
        if (user) {
            user = JSON.parse(user);
            let now = (new Date()).getTime();
            if (config && config.authentification.timeout < (now - user.time)) {
                sessionStorage.removeItem("user");
            } else {
                this.info(user, config);
            }
        }

        if (!user && config && config.authentification.type === "none") {
            this.info(user, config);
        }

    }

    componentDidUpdate(prevProps, prevState) {
        //document.querySelector("body").style.backgroundColor = this.props.bgColor;
    }

    render() {
        return (
            <div>
                {support &&
                <ContentWrapper>
                    <RequestBar/>
                    <Menu/>
                    <Switch>
                        <Route exact path='/login' component={Login}/>
                        <Route exact path='/paper' component={Paper}/>
                        <Route exact path='/settings' component={Settings}/>
                    </Switch>
                    {this.props.control.Message &&
                    <Overlay>
                        <Message messages={this.props.messages}/>
                    </Overlay>
                    }
                    <Loading visible={this.props.control.Loading}></Loading>
                </ContentWrapper>
                }
                {!support && <Unsupport name={browser.name} version={browser.version}/>}
            </div>
        );
    }
}


let mapStateToProps = (state) => {
    return {
        control: state.control,
        instances: state.target.instances,
        messages: state.message.messages,
        bgColor: state.style.bgColor,
        config: state.config,
        user: state.user
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage()),
        addRequest: () => dispatch(addRequest()),
        setConfig: (config) => dispatch(setConfig(config)),
        setUserId: (id, token, time) => dispatch(setUserId(id, token, time)),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content))
    };
};

App = connect(mapStateToProps, mapDispatchToProps)(App);

export default withRouter(App);