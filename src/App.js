import React, {Component} from 'react';
import './App.css';
import './Theme.css';
import './fonts/technology-icons-gh-pages/styles/technology-icons.css';
import './fonts/glyphter/css/Glyphter.css';
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
import {setSupported, setConfig, addRequest, clearAllMessage, setControlVisibility, setUserId, setUserData, pushMessage, setCounterInfo, setAlert} from './actions';
import {detect} from 'detect-browser';
import Unsupport from "./components/Unsupport/Unsupport";
import jQuery from "jquery";
import {
    errorHandler,
    mergeDeep,
    getParam,
    setAuthHeader,
    getWithCredentials,
    getHttpProtocol,
    getDefaultServerConfig,
    getCurrentUser
} from './common/common';

import Home from "./components/Home/Home";
import Topology from "./components/Topology/Topology";
import * as common from "./common/common";
import Debug from "./components/Debug/Debug";
import Controller from "./components/Controller/Controller";
import _ from "lodash";
import notificationIcon from './img/notification.png';

const browser = detect();
const support = (browser.name !== "ie" && browser.name !== "edge");

class App extends Component {

    // 차트 크기가 변경되었을 경우, 차트가 다시 그려지지 않음 (window event만 동작)

    alertTimer = null;
    initAlert = false;


    constructor(props) {
        super(props);

        this.state = {
            debug : false
        };
    }

    info = (user, config) => {
        this.props.setControlVisibility("Loading", true);
        this.props.addRequest();

        let origin = getHttpProtocol(config);
        jQuery.ajax({
            method: "GET",
            async: true,
            url: origin + "/scouter/v1/kv/a",
            xhrFields: getWithCredentials(config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, config, user);
            }
        }).done((msg) => {
            if (msg && Number(msg.status) === 200) {
                if (getDefaultServerConfig(config).authentification === "bearer") {
                    if (user) {
                        this.props.setUserId(origin, user.id, user.token, user.time);
                    }
                }

                if (getDefaultServerConfig(config).authentification === "cookie") {
                    if (user) {
                        this.props.setUserId(origin, user.id, null, user.time);
                    }

                }

            } else {
                localStorage.removeItem("user");
            }
        }).fail((xhr, textStatus, errorThrown) => {
            // 응답이 왔고, 401코드인데, 인증 안함 설정한 경우
            if (xhr.readyState === 4 && xhr.responseJSON && xhr.responseJSON.resultCode === "401" && getDefaultServerConfig(config).authentification === "none") {
                this.props.pushMessage("error", "CHECK SETTINGS", "current setting does not require authentication, but it actually requires authentication.");
                this.props.setControlVisibility("Message", true);
            } else {
                errorHandler(xhr, textStatus, errorThrown, this.props, "info", true);
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

        // 스카우터 API 서버가 변경되었는지 확인
        if  (nextProps.config) {
            let currentApiServer = this.props.config.servers.filter((server) => {
                return server.default;
            });
            let nextApiServer = nextProps.config.servers.filter((server) => {
                return server.default;
            });
            if (JSON.stringify(currentApiServer) !== JSON.stringify(nextApiServer)) {
                this.getCounterModel(nextProps.config, nextProps.user, true);
            }


            // 사용자 정보가 변경된다면, 카운터 정보를 다시 가져온다
            let defaultServerconfig = getDefaultServerConfig(this.props.config);
            let origin = defaultServerconfig.protocol + "://" + defaultServerconfig.address + ":" + defaultServerconfig.port;
            if (this.props.config && defaultServerconfig.authentification !== "none") {
                let nextUser = nextProps.user[origin];
                let currentUser = this.props.user[origin];
                if (nextUser && (JSON.stringify(currentUser) !== JSON.stringify(nextUser))) {
                    this.getCounterModel(nextProps.config, nextProps.user, true);
                }
            }
        }


        if (JSON.stringify(this.props.objects) !== JSON.stringify(nextProps.objects) || JSON.stringify(this.props.user) !== JSON.stringify(nextProps.user) || JSON.stringify(this.props.config) !== JSON.stringify(nextProps.config)) {
            this.checkRealtimeAlert(nextProps);
        }


    };

    checkRealtimeAlert = (props) => {

        if (!this.initAlert) {
            this.getRealTimeAlert(props.objects);
            this.initAlert = true;
        }


        if (this.alertTimer === null) {
            let seconds = this.props.config.alertInterval;
            if (!seconds) {
                seconds = 60;
            }

            this.alertTimer = setInterval(() => {
                this.getRealTimeAlert(props.objects);
            }, seconds * 1000);
        }
    };

    getRealTimeAlert = (objects) => {
        const that = this;

        let objTypes = [];
        if (objects && objects.length > 0) {
            objTypes = _.chain(objects).map((d) => d.objType).uniq().value();
        }

        if (objTypes && objTypes.length > 0) {
            objTypes.forEach((objType) => {
                this.props.addRequest();

                let offset1 = this.props.alert.offset[objType] ? this.props.alert.offset[objType].offset1 : 0;
                let offset2 = this.props.alert.offset[objType] ? this.props.alert.offset[objType].offset2 : 0;

                jQuery.ajax({
                    method: "GET",
                    async: true,
                    url: getHttpProtocol(this.props.config) + "/scouter/v1/alert/realTime/" + offset1 + "/" + offset2 + "?objType=" + objType,
                    xhrFields: getWithCredentials(that.props.config),
                    beforeSend: function (xhr) {
                        setAuthHeader(xhr, that.props.config, getCurrentUser(that.props.config, that.props.user));
                    }
                }).done((msg) => {
                    if (msg) {

                        let alert = Object.assign({}, this.props.alert);
                        if (!alert.offset[objType]) {
                            alert.offset[objType] = {};
                        }

                        alert.offset[objType].offset1 = msg.result.offset1;
                        alert.offset[objType].offset2 = msg.result.offset2;
                        alert.data = alert.data.concat(msg.result.alerts);

                        if (alert.data.length > 0) {
                            alert.data = alert.data.sort((a, b) => {
                                return Number(b.time) - Number(a.time)
                            });

                            alert.data = alert.data.filter((alert) => {
                                if (this.props.alert.clearTime) {
                                    if (this.props.alert.clearTime >= Number(alert.time)) {
                                        return false;
                                    } else {
                                        if (this.props.alert.clearItem[alert.objHash] && this.props.alert.clearItem[alert.objHash][alert.time]) {
                                            return false;
                                        } else {
                                            return true;
                                        }
                                    }
                                } else {
                                    if (this.props.alert.clearItem[alert.objHash] && this.props.alert.clearItem[alert.objHash][alert.time]) {
                                        return false;
                                    } else {
                                        return true;
                                    }
                                }
                            });

                            if (Notification && this.props.config.alert.notification === "Y" && Notification.permission === "granted") {
                                for (let i=0; i<alert.data.length; i++) {
                                    if (Number(alert.data[i].time) > this.mountTime && !alert.data[i]["_notificated"]) {
                                        alert.data[i]["_notificated"] = true;

                                        var options = {
                                            body: alert.data[i].objName + "\n" + alert.data[i].message,
                                            icon: notificationIcon
                                        };
                                        new Notification("[" + alert.data[i].level + "]" +  alert.data[i].title, options);
                                    }
                                }
                            }

                            this.props.setAlert(alert);

                        }
                    }
                }).fail((xhr, textStatus, errorThrown) => {
                    clearInterval(this.alertTimer);
                    this.alertTimer = null;
                    errorHandler(xhr, textStatus, errorThrown, this.props, "getRealTimeAlert", true);
                });
            });
        }
    };

    getCounterModel = (config, user, handleError) => {
        jQuery.ajax({
            method: "GET",
            async: true,
            url: getHttpProtocol(config) + "/scouter/v1/info/counter-model",
            xhrFields: getWithCredentials(config),
            beforeSend: function (xhr) {
                setAuthHeader(xhr, config, getCurrentUser(config, user));
            }
        }).done((msg) => {
            if (Number(msg.status) === 200) {
                this.props.setSupported(true);
                this.props.setCounterInfo(msg.result.families, msg.result.objTypes);
            }
        }).fail((xhr, textStatus, errorThrown) => {
            if (handleError) {
                if (xhr.status === 404) {
                    this.props.setSupported(false);
                    this.props.pushMessage("error", "Not Supported", "failed to get matrix information. paper 2.0 is available only on scouter 2.0 and later.");
                    this.props.setControlVisibility("Message", true);
                } else {
                    errorHandler(xhr, textStatus, errorThrown, this.props, "getCounterModel", true);
                }
            }
        });
    };

    getNotice = () => {
        let noticeTokenKey = "scouter-notice-token";
        const noticeToken = localStorage.getItem(noticeTokenKey);

        jQuery.ajax({
            method: "GET",
            async: true,
            url: "http://notice.scouterapm.com:6181/scouter-paper/latest-notice",
            // xhrFields: getWithCredentials(config),
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-SCCH', noticeToken || '');
                xhr.setRequestHeader('X-SCV', "v" + common.version);
            }
        }).done((msg, statusText, request) => {
            if (statusText === "success") {
                const noticeTokenReceived = request.getResponseHeader('X-Scouter-Notice-Token');
                if(noticeTokenReceived && noticeTokenReceived.length > 5 && noticeTokenReceived !== noticeToken) {
                    localStorage.setItem(noticeTokenKey, noticeTokenReceived);
                }
            }
        }).fail((xhr, textStatus, errorThrown) => {
            // skip
        });
    };

    componentWillMount() {
        let config = null;
        let str = localStorage.getItem("config");
        if (str) {
            config = JSON.parse(str);
            config = mergeDeep(this.props.config, config); //for added config's properties on later versions.

            if (config.fonts && config.fonts.filter(d => d.val === "NanumSquare").length < 1) {
                config.fonts.unshift({val : "NanumSquare",name : "NanumSquare", generic: "sans-serif", type : "display"});
            }
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
                if (server.protocol === paramProtocol && server.address === paramAddress
                    && String(server.port) === String(paramPort))
                {
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

        if (config && config.servers) {
            config.servers.forEach((server) => {
                server.name = server.protocol + "://" + server.address + ":" + server.port
            });
        }
        const paramXlogClassicMode = common.getParam(this.props,"xlogClassicMode");
        if(paramXlogClassicMode && ( paramXlogClassicMode === 'Y' ||  paramXlogClassicMode === 'N')){
            config.others.xlogClassicMode = paramXlogClassicMode;
        }


        this.props.setConfig(config);
        if (localStorage) {
            localStorage.setItem("config", JSON.stringify(config));
        }
        let origin = getHttpProtocol(config);

        let userData = localStorage.getItem("user");
        
        let user = null;
        if (userData) {
            userData = JSON.parse(userData);
            this.props.setUserData(userData);
            user = userData[origin];            
            this.info(user, config);
        }

        if (user && getDefaultServerConfig(config).authentification === "bearer") {
            this.props.setUserId(origin, user.id, user.token, user.time);
        }

        if (user && getDefaultServerConfig(config).authentification === "cookie") {
            this.props.setUserId(origin, user.id, null, user.time);
        }

        if (!user && getDefaultServerConfig(config).authentification === "none") {
            this.info(user, config);
        }
    }

    componentDidMount() {
        document.querySelector("html").setAttribute("class", this.props.config.theme);
        this.setFontSetting(this.props.config.fontSetting);

        // 처음 카운터 모델을 조회하는데, 에러 처리는 하지 않는다
        this.getCounterModel(this.props.config, this.props.user, false);

        // Notice를 조회한다. 이미 조회한 Notice인지 확인하여 하루에 한번만 보여주던지..
        // X-Scouter-Notice-Token 응답 헤더는 LocalStorage에 저장하여 다음 요청 헤더로 사용한다.
        // TODO Notice가 관리되면 화면에 보여준다.
        if(this.props.config.others.checkUpdate === "Y") {
            this.getNotice();
        }

        window.addEventListener("keydown", this.keyDown.bind(this));

    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.keyDown.bind(this));
    }

    keyDown = (event) => {

        var key;
        var isShift;
        var isCtrl;
        if (window.event) {
            key = window.event.keyCode;
            isShift = !!window.event.shiftKey;
            isCtrl = !!window.event.ctrlKey;
        } else {
            key = event.which;
            isShift = !!event.shiftKey;
            isCtrl = !!event.ctrlKey;
        }

        if (isShift && isCtrl) {
            if (key === 85) {//u
                this.setState({
                    debug : !this.state.debug
                });
            }
        }
    };

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
        css.innerHTML += `svg text { font-family: '${fontSetting.axis}','Nanum Gothic',${this.getFontGeneric(fontSetting.axis)}; font-size: ${fontSetting.axisFontSize}; }`;
        css.innerHTML += ".tooltip { font-family: '" + fontSetting.tooltip + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.tooltip) + "; }";
        css.innerHTML += ".xlog-profiler { font-family: '" + fontSetting.profiler + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.profiler) + "; }";
        css.innerHTML += ".menu-div { font-family: '" + fontSetting.menu + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.menu) + "; }";
        css.innerHTML += ".alert-list { font-family: '" + fontSetting.tooltip + "','Nanum Gothic'," + this.getFontGeneric(fontSetting.tooltip) + "; }";

        document.body.appendChild(css);
    };

    closeDebug = () => {
        this.setState({
            debug : false
        });
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
                        <Route exact path='/topology' component={Topology}/>
                        <Route exact path='/settings' component={Settings}/>
                    </Switch>
                    {this.props.control.Message &&
                    <Overlay>
                        <Message messages={this.props.messages}/>
                    </Overlay>
                    }
                    <Loading visible={this.props.control.Loading}></Loading>
                    {this.state.debug && <Debug closeDebug={this.closeDebug}/>}
                </ContentWrapper>
                }
                {support && <Controller>
                    {/*<ObjectSelector></ObjectSelector>*/}

                </Controller>
                }
                {!support && <Unsupport name={browser.name} version={browser.version}/>}

            </div>
        );
    }
}


let mapStateToProps = (state) => {
    return {
        control: state.control,
        counterInfo: state.counterInfo,
        messages: state.message.messages,
        bgColor: state.style.bgColor,
        config: state.config,
        user: state.user,
        supported : state.supported,
        objects: state.target.objects,
        alert: state.alert
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage()),
        addRequest: () => dispatch(addRequest()),
        setConfig: (config) => dispatch(setConfig(config)),
        setUserId: (origin, id, token, time) => dispatch(setUserId(origin, id, token, time)),
        setUserData: (userData) => dispatch(setUserData(userData)),
        pushMessage: (category, title, content) => dispatch(pushMessage(category, title, content)),
        setCounterInfo: (families, objTypes) => dispatch(setCounterInfo(families, objTypes)),
        setSupported: (supported) => dispatch(setSupported(supported)),
        setAlert: (alert) => dispatch(setAlert(alert))
    };
};

App = connect(mapStateToProps, mapDispatchToProps)(App);

export default withRouter(App);