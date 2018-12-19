import React, {Component} from 'react';
import {NavLink} from 'react-router-dom'
import './Menu.css';
import {InstanceInfo, InstanceSelector} from "../../components";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import PresetManager from "./PresetManager/PresetManager";
import {getDefaultServerConfig} from '../../common/common';
class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selector: false,
            presetManager : false,
            menu : null
        };
    }

    componentDidMount() {
        this.setState({
            menu : this.props.location.pathname
        });
    }

    toggleSelectorVisible = () => {
        this.setState({
            selector: !this.state.selector,
            presetManager: !this.state.selector ? false : this.state.presetManager
        });
    };

    togglePresetManagerVisible = () => {
        this.setState({
            selector: !this.state.presetManager ? false : this.state.selector,
            presetManager: !this.state.presetManager
        });
    };

    menuClick = (name, e) => {
        if (this.state.menu !== name) {
            this.setState({
                menu : name
            });
        } else {
            if (this.props.location.pathname === name) {
                e.preventDefault();
            }
        }
    };

    render() {
        let instanceParam = (this.props.objects && this.props.objects.length > 0) ? "?objects=" + this.props.objects.map((d) => {return d.objHash}) : "";

        let defaultServerconfig = getDefaultServerConfig(this.props.config);
        let origin = defaultServerconfig.protocol + "://" + defaultServerconfig.address + ":" + defaultServerconfig.port;
        let user = this.props.user[origin];

        return (
            <div className="menu-div">
                <div className="menu">
                    {/*<div className="logo">
                        <NavLink to={"/" + instanceParam} activeClassName="active" onClick={this.menuClick.bind(this, "/")}>
                            <div className="logo-icon"><i className="fa fa-bolt" aria-hidden="true"></i></div>
                            <div className="logo-text-div">
                                <div className="logo-text logo-text-1">SCOUTER</div>
                                <div className="logo-text logo-text-2">PAPER</div>
                            </div>
                        </NavLink>
                    </div>*/}
                    <NavLink className={"menu-item " + (this.state.menu === "/topology" ? "active" : "")} to={"/topology"  + instanceParam} onClick={this.menuClick.bind(this, "/topology")}>
                        <div>
                            <div className="icon"><i className="fa fa-braille" aria-hidden="true"></i></div>
                            <div className="text">TOPOLOGY</div>
                        </div>
                    </NavLink>
                    <NavLink className={"menu-item " + (this.state.menu === "/paper" ? "active" : "")} to={"/paper"  + instanceParam} onClick={this.menuClick.bind(this, "/paper")}>
                        <div>
                            <div className="icon"><i className="fa fa-newspaper-o" aria-hidden="true"></i></div>
                            <div className="text">PAPERS</div>
                        </div>
                    </NavLink>
                    <NavLink className={"menu-item " + (this.state.menu === "/settings" ? "active" : "")} to={"/settings" + instanceParam}   activeClassName="active" onClick={this.menuClick.bind(this, "/settings")}>
                        <div>
                            <div className="icon"><i className="fa fa-cog" aria-hidden="true"></i></div>
                            <div className="text">
                                <span className="menu-text">SETTINGS</span>
                                <span className="menu-icon"><i className="fa fa-cog" aria-hidden="true"></i></span>
                            </div>
                        </div>
                    </NavLink>
                    {(getDefaultServerConfig(this.props.config).authentification !== "none") &&
                        <NavLink className={"menu-item right " + (this.state.menu === "login" ? "active" : "")} to={"/login" + instanceParam} activeClassName="active" onClick={this.menuClick.bind(this, "/login")}>
                            <div>
                                {(user && user.id) ? <div className="text"></div> : <div className="icon"><i className="fa fa-handshake-o" aria-hidden="true"></i></div>}
                                {(user && user.id) ? <div className="text"><i className="fa fa-child login-icon" aria-hidden="true"></i></div> : <div>LOGIN</div>}
                            </div>
                        </NavLink>
                    }
                    <InstanceInfo className="menu-instance-selector" selected={this.state.selector || this.state.presetManager} toggleSelectorVisible={this.toggleSelectorVisible} togglePresetManagerVisible={this.togglePresetManagerVisible} />
                </div>
                <div className="bar"></div>
                <InstanceSelector visible={this.state.selector} toggleSelectorVisible={this.toggleSelectorVisible}/>
                <PresetManager visible={this.state.presetManager} togglePresetManagerVisible={this.togglePresetManagerVisible}/>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        config: state.config,
        user: state.user
    };
};

Menu = connect(mapStateToProps, undefined)(Menu);
export default withRouter(Menu);

