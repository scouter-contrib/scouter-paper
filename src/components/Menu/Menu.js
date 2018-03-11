import React, {Component} from 'react';
import {NavLink} from 'react-router-dom'
import './Menu.css';
import {InstanceInfo, InstanceSelector} from "../../components";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selector: false,
            menu : null
        };
    }

    componentDidMount() {
        /*let menu = "";
        if (this.props.location.pathname === "/paper") {
            menu = "paper";
        }*/
    }

    toggleSelectorVisible = () => {
        this.setState({
            selector: !this.state.selector
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
        return (
            <div className="menu-div">
                <div className="menu">
                    <div className="logo">
                        <NavLink to="/" activeClassName="active" onClick={this.menuClick.bind(this, "/")}>
                            <div className="logo-icon"><i className="fa fa-bolt" aria-hidden="true"></i></div>
                            <div className="logo-text-div">
                                <div className="logo-text logo-text-1">SCOUTER</div>
                                <div className="logo-text logo-text-2">PAPERS</div>
                            </div>
                        </NavLink>
                    </div>
                    <NavLink className={"menu-item " + (this.state.menu === "/paper" ? "active" : "")} to={"/paper?instances=" + this.props.instances.map((d) => {return d.objHash})} onClick={this.menuClick.bind(this, "/paper")}>
                        <div>
                            <div className="icon"><i className="fa fa-newspaper-o" aria-hidden="true"></i></div>
                            <div className="text">PAPERS</div>
                        </div>
                    </NavLink>
                    <NavLink className={"menu-item " + (this.state.menu === "/settings" ? "active" : "")} to="/settings" activeClassName="active" onClick={this.menuClick.bind(this, "/settings")}>
                        <div>
                            <div className="icon"><i className="fa fa-cog" aria-hidden="true"></i></div>
                            <div className="text">SETTINGS</div>
                        </div>
                    </NavLink>
                    {/*<NavLink className={"menu-item " + (this.state.menu === "about" ? "active" : "")} to="/about" activeClassName="active" onClick={this.menuClick.bind(this, "/about")}>
                        <div>
                            <div className="icon"><i className="fa fa-info-circle" aria-hidden="true"></i></div>
                            <div className="text">ABOUT</div>
                        </div>
                    </NavLink>*/}
                    {(this.props.config.authentification && this.props.config.authentification.type !== "none") &&
                        <NavLink className={"menu-item right " + (this.state.menu === "login" ? "active" : "")} to="/login" activeClassName="active" onClick={this.menuClick.bind(this, "/login")}>
                            <div>
                                {(this.props.user && this.props.user.id) ? <div className="text"></div> : <div className="icon"><i className="fa fa-handshake-o" aria-hidden="true"></i></div>}
                                {(this.props.user && this.props.user.id) ? <div className="text"><i className="fa fa-child login-icon" aria-hidden="true"></i></div> : <div>LOGIN</div>}
                            </div>
                        </NavLink>
                    }
                    <InstanceInfo className="menu-instance-selector" toggleSelectorVisible={this.toggleSelectorVisible}/>
                </div>
                <div className="bar"></div>
                <InstanceSelector visible={this.state.selector} toggleSelectorVisible={this.toggleSelectorVisible}/>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        instances: state.target.instances,
        config: state.config,
        user: state.user
    };
};

Menu = connect(mapStateToProps, undefined)(Menu);
export default withRouter(Menu);

