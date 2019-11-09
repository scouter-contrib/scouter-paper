import React, {Component} from 'react';
import {NavLink} from 'react-router-dom'
import './Menu.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {getDefaultServerConfig} from '../../common/common';
import AlertList from "../Paper/PaperControl/AlertList";
import moment from "moment";
import {
    setMenu,
    setRangeAll,
    setAlert,
    setSearchCondition
} from '../../actions';

class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            menu: null,
            showAlert: false
        };
    }
    componentWillReceiveProps(nextProps) {
        const {pathname}= nextProps.location;
        if( pathname !== this.props.pathname){
            this.setState({
                menu: pathname
            });
            this.props.setMenu(pathname);
        }
    }
    componentDidMount() {
        this.setState({
            menu: this.props.location.pathname
        });
        this.props.setMenu(this.props.location.pathname);
        if (this.props.config.alert.notification === "Y") {
            if( typeof Notification === 'function' && Notification.hasOwnProperty('permission')) {
                if( Notification.permission !== "granted" || Notification.permission === "denied") {
                    Notification.requestPermission();
                }
            }
        }
    }

    menuClick = (name, e) => {
        if (this.state.menu !== name) {
            this.setState({
                menu: name
            });
            this.props.setMenu(name);
        } else {
            if (this.props.location.pathname === name) {
                if (e) {
                    e.preventDefault();
                }
            }
        }
    };

    toggleShowAlert = () => {
        this.setState({
            showAlert : !this.state.showAlert
        });
    };

    clearAllAlert = () => {
        let clearTime;
        let clearItem;
        if (this.props.alert.data && this.props.alert.data.length > 0) {
            let last = this.props.alert.data[0];
            clearTime = Number(last.time);
            clearItem = {};
        } else {
            clearTime = (new Date()).getTime();
            clearItem = {};
        }

        this.props.setAlert({
            data : [],
            offset : this.props.alert.offset,
            clearTime: clearTime,
            clearItem: clearItem
        });

        this.setState({
            showAlert : false
        });

        if (localStorage) {
            localStorage.setItem("alert", JSON.stringify({
                clearTime: clearTime,
                clearItem: clearItem
            }));
        }
    };

    clearOneAlert = (objHash, time) => {

        let clearItem = this.props.alert.clearItem;

        if (!clearItem[objHash]) {
            clearItem[objHash] = {};
        }

        clearItem[objHash][time] = true;

        let data = this.props.alert.data;
        if (data && data.length > 0) {
            for (let i=0; i<data.length; i++) {
                if (data[i].objHash === objHash && Number(data[i].time) === Number(time)) {
                    data.splice(i, 1);
                    break;
                }
            }
        }

        this.props.setAlert({
            data: data,
            offset: this.props.alert.offset,
            clearTime: this.props.alert.clearTime,
            clearItem: clearItem
        });

        if (localStorage) {
            localStorage.setItem("alert", JSON.stringify({
                clearTime: this.props.alert.clearTime,
                clearItem: clearItem
            }));
        }
    };

    setRewind = (time) => {

        let start = moment(Math.floor(time / (1000 * 60)) * (1000 * 60));
        start.subtract(5, "minutes");
        let end = start.clone().add(10, "minutes");
        this.menuClick("/paper");
        this.props.setRangeAll(start, start.hours(), start.minutes(), 10, false, false, this.props.config.range.shortHistoryRange, this.props.config.range.shortHistoryStep);

        if (this.props.history.location.pathname === "/paper") {
            setTimeout(() => {
                this.props.setSearchCondition(start, end, (new Date()).getTime());
            }, 100);

        } else {
            let search = new URLSearchParams(this.props.history.location.search);

            search.set("realtime", false);
            search.set("longterm", false);

            search.set("from", start.format("YYYYMMDDHHmmss"));
            search.set("to", end.format("YYYYMMDDHHmmss"));

            this.props.history.push({
                pathname: '/paper',
                search: search.toString()
            });

            setTimeout(() => {
                this.props.setSearchCondition(start, end, (new Date()).getTime());
            }, 100);
        }


    };

    render() {
        let instanceParam = (this.props.objects && this.props.objects.length > 0) ? "?objects=" + this.props.objects.map((d) => {
            return d.objHash
        }) : "";

        let defaultServerconfig = getDefaultServerConfig(this.props.config);
        let origin = defaultServerconfig.protocol + "://" + defaultServerconfig.address + ":" + defaultServerconfig.port;
        let user = this.props.user[origin];

        return (
            <div className="menu-div">
                <div className="menu">
                    <NavLink className={"menu-item " + (this.state.menu === "/topology" ? "active" : "")}
                             to={"/topology" + instanceParam} onClick={this.menuClick.bind(this, "/topology")}>
                        <div>
                            <div className="icon"><i className="fa fa-braille" aria-hidden="true"></i></div>
                            <div className="text">TOPOLOGY</div>
                        </div>
                    </NavLink>
                    <NavLink className={"menu-item " + (this.state.menu === "/paper" ? "active" : "")}
                             to={"/paper" + instanceParam} onClick={this.menuClick.bind(this, "/paper")}>
                        <div>
                            <div className="icon"><i className="fa fa-newspaper-o" aria-hidden="true"></i></div>
                            <div className="text">PAPERS</div>
                        </div>
                    </NavLink>
                    <NavLink className={"menu-item " + (this.state.menu === "/settings" ? "active" : "")}
                             to={"/settings" + instanceParam} activeClassName="active"
                             onClick={this.menuClick.bind(this, "/settings")}>
                        <div>
                            <div className="icon"><i className="fa fa-cog" aria-hidden="true"></i></div>
                            <div className="text">
                                <span className="menu-text">SETTINGS</span>
                                <span className="menu-icon"><i className="fa fa-cog" aria-hidden="true"></i></span>
                            </div>
                        </div>
                    </NavLink>
                    {(getDefaultServerConfig(this.props.config).authentification !== "none") &&
                    <NavLink className={"menu-item right " + (this.state.menu === "login" ? "active" : "")}
                             to={"/login" + instanceParam} activeClassName="active"
                             onClick={this.menuClick.bind(this, "/login")}>
                        <div>
                            {(user && user.id) ? <div className="text"></div> :
                                <div className="icon"><i className="fa fa-handshake-o" aria-hidden="true"></i></div>}
                            {(user && user.id) ?
                                <div className="text"><i className="fa fa-child login-icon" aria-hidden="true"></i>
                                </div> : <div>LOGIN</div>}
                        </div>
                    </NavLink>
                    }
                    <div className="right-panel">
                        <div className="template-name">
                            <div className="preset">{this.props.templateName ? this.props.templateName.preset : null}</div>
                            <div className="layout">{this.props.templateName ? this.props.templateName.layout : null}</div>
                        </div>
                        <div className="alert-btn menu-item" data-count={this.props.alert.data.length > 99 ? "99+" : this.props.alert.data.length} onClick={this.toggleShowAlert} data-tip="CLICK TO SHOW ALERT">
                            <span className={"alert-icon " + (this.props.alert.data.length > 0 ? "has-alert" : "")}><i className="fa fa-exclamation-circle" aria-hidden="true"></i></span>
                        </div>
                    </div>
                    
                </div>
                <div className="bar"></div>
                <AlertList alert={this.props.alert} show={this.state.showAlert} setRewind={this.setRewind} clearAllAlert={this.clearAllAlert} clearOneAlert={this.clearOneAlert} />
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        config: state.config,
        user: state.user,
        alert: state.alert,
        templateName: state.templateName
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setMenu: (menu) => dispatch(setMenu(menu)),
        setRangeAll: (date, hours, minutes, value, realTime, longTerm, range, step) => dispatch(setRangeAll(date, hours, minutes, value, realTime, longTerm, range, step)),
        setAlert: (alert) => dispatch(setAlert(alert)),
        setSearchCondition: (from, to, time) => dispatch(setSearchCondition(from, to, time))
    };
};

Menu = connect(mapStateToProps, mapDispatchToProps)(Menu);
export default withRouter(Menu);

