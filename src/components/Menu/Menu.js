import React, {Component} from 'react';
import {NavLink} from 'react-router-dom'
import './Menu.css';
import {InstanceInfo, InstanceSelector} from "../../components";

class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selector: false
        };
    }

    toggleSelectorVisible = () => {
        this.setState({
            selector: !this.state.selector
        });
    };

    render() {
        return (
            <div className="menu-div">
                <div className="menu">
                    <div className="logo">
                        <NavLink to="/" activeClassName="active">
                            <div className="logo-icon"><i className="fa fa-bolt" aria-hidden="true"></i></div>
                            <div className="logo-text-div">
                                <div className="logo-text logo-text-1">SCOUTER</div>
                                <div className="logo-text logo-text-2">PAPERS</div>
                            </div>
                        </NavLink>
                    </div>
                    <NavLink className="menu-item" to="/paper" activeClassName="active">
                        <div>
                            <div className="icon"><i className="fa fa-newspaper-o" aria-hidden="true"></i></div>
                            <div className="text">PAPERS</div>
                        </div>
                    </NavLink>
                    <NavLink className="menu-item" to="/settings" activeClassName="active">
                        <div>
                            <div className="icon"><i className="fa fa-cog" aria-hidden="true"></i></div>
                            <div className="text">SETTINGS</div>
                        </div>
                    </NavLink>
                    <NavLink className="menu-item" to="/about" activeClassName="active">
                        <div>
                            <div className="icon"><i className="fa fa-info-circle" aria-hidden="true"></i></div>
                            <div className="text">ABOUT</div>
                        </div>
                    </NavLink>
                    <NavLink className="menu-item right" to="/login" activeClassName="active">
                        <div>
                            <div className="icon"><i className="fa fa-handshake-o" aria-hidden="true"></i></div>
                            <div className="text">LOGIN</div>
                        </div>
                    </NavLink>
                    <InstanceInfo className="menu-instance-selector" toggleSelectorVisible={this.toggleSelectorVisible}/>
                </div>
                <div className="bar"></div>
                <InstanceSelector visible={this.state.selector} toggleSelectorVisible={this.toggleSelectorVisible}/>
            </div>
        );
    }
}

export default Menu;