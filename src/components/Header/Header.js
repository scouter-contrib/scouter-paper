import React, {Component} from 'react';
import './Header.css';
import {withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import { setLogin } from '../../actions';

class Header extends Component {

    componentDidMount() {
        setTimeout(() => {
            this.props.setLogin(false);


        }, 3000);
    }

    render() {
        console.log(this.props.login);

        return (
            <div className="Header"></div>
        );
    }

}
let mapStateToProps = (state) => {
    return {
        //login: state.control.login
    };
}

let mapDispatchToProps = (dispatch) => {
    return {
        //setLogin: (login) => dispatch(setLogin(login))
    };
}

Header = connect(mapStateToProps, mapDispatchToProps)(Header);

export default withRouter(Header);