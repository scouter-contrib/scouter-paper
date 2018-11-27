import React, {Component} from 'react';
import {NavLink} from 'react-router-dom'
import './Navigator.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getDefaultServerConfig} from '../../common/common';
class Navigator extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selector: false,
            layoutManager : false,
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
            layoutManager: !this.state.selector ? false : this.state.layoutManager,
            presetManager: !this.state.selector ? false : this.state.presetManager
        });
    };

    toggleLayoutManagerVisible = () => {
        this.setState({
            selector: !this.state.layoutManager ? false : this.state.selector,
            layoutManager: !this.state.layoutManager,
            presetManager: !this.state.layoutManager ? false : this.state.presetManager
        });
    };

    togglePresetManagerVisible = () => {
        this.setState({
            selector: !this.state.presetManager ? false : this.state.selector,
            layoutManager: !this.state.presetManager ? false : this.state.layoutManager,
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
            <div className="navigator-wrapper">
                <div className="navigator">
                    <div>
                        <NavLink className={"menu-item " + (this.state.menu === "/" ? "active" : "")} to={"/" + instanceParam} activeClassName="active" onClick={this.menuClick.bind(this, "/")}>
                            <div>
                                <div className="icon"><i className="fa fa-home" aria-hidden="true"></i></div>
                                <div className="text">HOME</div>
                            </div>
                        </NavLink>
                    </div>
                    <div>
                        <NavLink className={"menu-item " + (this.state.menu === "/topology" ? "active" : "")} to={"/topology"  + instanceParam} onClick={this.menuClick.bind(this, "/topology")}>
                            <div>
                                <div className="icon"><i className="fa fa-braille" aria-hidden="true"></i></div>
                                <div className="text">TOPOLOGY</div>
                            </div>
                        </NavLink>
                    </div>
                    <div>
                        <NavLink className={"menu-item " + (this.state.menu === "/paper" ? "active" : "")} to={"/paper"  + instanceParam} onClick={this.menuClick.bind(this, "/paper")}>
                            <div>
                                <div className="icon"><i className="fa fa-newspaper-o" aria-hidden="true"></i></div>
                                <div className="text">PAPERS</div>
                            </div>
                        </NavLink>
                    </div>
                    <div>
                        <NavLink className={"menu-item " + (this.state.menu === "/settings" ? "active" : "")} to={"/settings" + instanceParam}   activeClassName="active" onClick={this.menuClick.bind(this, "/settings")}>
                            <div>
                                <div className="icon"><i className="fa fa-cog" aria-hidden="true"></i></div>
                                <div className="text">SETTINGS</div>
                            </div>
                        </NavLink>
                    </div>
                    {(getDefaultServerConfig(this.props.config).authentification !== "none") &&
                    <div>
                        <NavLink className={"menu-item " + (this.state.menu === "login" ? "active" : "")} to={"/login" + instanceParam} activeClassName="active" onClick={this.menuClick.bind(this, "/login")}>
                            {(user && user.id) &&
                            <div>
                                <div className="icon"><i className="fa fa-child" aria-hidden="true"></i></div>
                                <div className="text">USER</div>
                            </div>
                            }
                            {!(user && user.id) &&
                            <div>
                                <div className="icon"><i className="fa fa-handshake-o" aria-hidden="true"></i></div>
                                <div className="text">LOGIN</div>
                            </div>
                            }

                        </NavLink>
                    </div>
                    }
                </div>
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

Navigator = connect(mapStateToProps, undefined)(Navigator);
export default withRouter(Navigator);

