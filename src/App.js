import React, {Component} from 'react';
import './App.css';
import './Theme.css';
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
import {errorHandler, mergeDeep, getParam, setAuthHeader, getWithCredentials, getHttpProtocol, getDefaultServerConfig} from './common/common';
import Home from "./components/Home/Home";

const browser = detect();
const support = (browser.name !== "ie" && browser.name !== "edge");

class App extends Component {

    info = (user, config) => {
        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();

        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(config) + "/scouter/v1/kv/a",
            xhrFields: getWithCredentials(config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, config, user);
            }
        }).done((msg) => {
            if (msg && Number(msg.status) === 200) {
                if (getDefaultServerConfig(config).authentification === "bearer") {
                    this.props.setUserId(user.id, user.token, user.time);
                }

                if (getDefaultServerConfig(config).authentification === "cookie") {
                    this.props.setUserId(user.id, null, user.time);
                }

            } else {
                localStorage.removeItem("user");
            }
        }).fail((xhr, textStatus, errorThrown) => {
            // 응답이 왔고, 401코드인데, 인증 안함 설정한 경우
            if (xhr.readyState === 4 && xhr.responseJSON.resultCode === "401" && getDefaultServerConfig(config).authentification === "none") {
                this.props.pushMessage("error", "CHECK SETTINGS", "current setting does not require authentication, but it actually requires authentication.");
                this.props.setControlVisibility("Message", true);
            } else {
                errorHandler(xhr, textStatus, errorThrown, this.props);
            }
            localStorage.removeItem("user");
        }).always(() => {
            this.props.setControlVisibility("Loading", false);
        });
    };

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.config.fontSetting) !== JSON.stringify(nextProps.config.fontSetting)) {
            this.setFontSetting(nextProps.config.fontSetting);
        }

        if (this.props.config.theme !== nextProps.config.theme) {
            document.querySelector("html").setAttribute("class", nextProps.config.theme);
        }
    };

    componentWillMount() {
        let config = null;
        let str = localStorage.getItem("config");
        if (str) {
            config = JSON.parse(str);
            config = mergeDeep(this.props.config, config); //for added config's properties on later versions.
            localStorage.setItem("config", JSON.stringify(config));
        } else {
            config = this.props.config;
        }

        // URL로부터 스카우터 서버 정보를 세팅
        let params = getParam(this.props, "address,port,protocol,authentification");
        if (params[0] && params[1]) {
            let paramAddress = params[0];
            let paramPort = params[1];
            let paramProtocol = params[2] ? params[2] : "http";
            let paramAuthentification = params[3] ? params[3] : "none";

            let found = false;
            for (let i=0; i<config.servers.length; i++) {
                let server = config.servers[i];
                if (server.protocol === paramProtocol && server.address === paramAddress && String(server.port) === String(paramPort) && server.authentification === paramAuthentification) {
                    found = true;
                    server.default = true;
                } else {
                    server.default = false;
                }
            }

            if (!found) {
                config.servers.push({
                    protocol: paramProtocol,
                    address: paramAddress,
                    port: paramPort,
                    authentification :paramAuthentification,
                    default : true
                });
            }
        }

        this.props.setConfig(config);
        if (localStorage) {
            localStorage.setItem("config", JSON.stringify(config));
        }

        let user = localStorage.getItem("user");
        if (user) {
            user = JSON.parse(user);
            this.info(user, config);
        }

        if (user && getDefaultServerConfig(config).authentification === "bearer") {
            this.props.setUserId(user.id, user.token, user.time);
        }

        if (user && getDefaultServerConfig(config).authentification === "cookie") {
            this.props.setUserId(user.id, null, user.time);
        }

        if (!user && getDefaultServerConfig(config).authentification === "none") {
            this.info(user, config);
        }
    }

    componentDidMount() {
        document.querySelector("html").setAttribute("class", this.props.config.theme);
        this.setFontSetting(this.props.config.fontSetting);
    }

    getFontGeneric = (val) => {
        for (let i = 0; i < this.props.config.fonts.length; i++) {
            if (val === this.props.config.fonts[i].val) {
                return this.props.config.fonts[i].generic;
            }
        }

        return "";
    };

    setFontSetting = (fontSetting) => {
        let styles = document.querySelectorAll("style.custom-css");
        for (let i = 0; i < styles.length; i++) {
            styles[i].remove();
        }
        let css = document.createElement("style");
        css.classList.add("custom-css");
        css.type = "text/css";
        css.innerHTML = "";
        this.getFontGeneric(fontSetting.basic);
        css.innerHTML += "html,body,svg text,input,select,button { font-family: '" + fontSetting.basic + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.basic) + "; }";
        css.innerHTML += ".layout-manager .content-ilst { font-family: '" + fontSetting.basic + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.basic) + "; }";
        css.innerHTML += ".instance-selector .list-content { font-family: '" + fontSetting.basic + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.basic) + "; }";
        css.innerHTML += "svg text { font-family: '" + fontSetting.axis + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.axis) + "; }";
        css.innerHTML += ".tooltip { font-family: '" + fontSetting.tooltip + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.tooltip) + "; }";
        css.innerHTML += ".xlog-profiler { font-family: '" + fontSetting.profiler + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.profiler) + "; }";
        css.innerHTML += ".menu-div { font-family: '" + fontSetting.menu + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.menu) + "; }";
        css.innerHTML += ".alert-list { font-family: '" + fontSetting.tooltip + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.tooltip) + "; }";

        document.body.appendChild(css);
    };

    render() {
        return (
            <div className="black">
                {support &&
                <ContentWrapper>
                    <RequestBar/>
                    <Menu/>
                    <Switch>
                        <Route exact path='/' component={Home}/>
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