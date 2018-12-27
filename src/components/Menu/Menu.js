import React, {Component} from 'react';
import {NavLink} from 'react-router-dom'
import './Menu.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {getDefaultServerConfig} from '../../common/common';
import {
    setMenu
} from '../../actions';

class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            menu: null
        };
    }

    componentDidMount() {
        this.setState({
            menu: this.props.location.pathname
        });
        this.props.setMenu(this.props.location.pathname);
    }

    menuClick = (name, e) => {
        if (this.state.menu !== name) {
            this.setState({
                menu: name
            });
            this.props.setMenu(name);
        } else {
            if (this.props.location.pathname === name) {
                e.preventDefault();
            }
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
                </div>
                <div className="bar"></div>
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

let mapDispatchToProps = (dispatch) => {
    return {
        setMenu: (menu) => dispatch(setMenu(menu))
    };
};

Menu = connect(mapStateToProps, mapDispatchToProps)(Menu);
export default withRouter(Menu);

