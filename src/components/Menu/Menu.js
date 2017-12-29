import React, {Component} from 'react';
import {NavLink} from 'react-router-dom'
import './Menu.css';

class Menu extends Component {

    render() {
        return (
            <div className="menu-div">
                <div className="bar"></div>
                <div className="menu">
                    <div className="logo">
                        <NavLink to="/" activeClassName="active">
                        <div className="logo-icon"><i className="fa fa-bolt" aria-hidden="true"></i></div>
                        <div className="logo-text-div">
                            <div className="logo-text">SCOUTER PAPERS</div>
                        </div>
                        </NavLink>
                    </div>
                    <NavLink className="menu-item" to="/paper" activeClassName="active">
                        <div>
                            <div className="icon"><i className="fa fa-newspaper-o" aria-hidden="true"></i></div>
                            <div className="text">PAPER</div>
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
                </div>
            </div>
        );
    }
}

export default Menu;