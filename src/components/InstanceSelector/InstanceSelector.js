import React, {Component} from 'react';
import './InstanceSelector.css';
import {withRouter } from 'react-router-dom';
import {connect} from 'react-redux';


class InstanceSelector extends Component {

    componentDidMount() {
        setTimeout(() => {
            this.props.setLogin(false);


        }, 3000);
    }

    render() {
        console.log(this.props.login);

        return (
            <div className="Header">
                TPS 평균응답시간
            </div>
        );
    }

}
let mapStateToProps = (state) => {
    return {
        //login: state.control.login
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        //setLogin: (login) => dispatch(setLogin(login))
    };
};

InstanceSelector = connect(mapStateToProps, mapDispatchToProps)(InstanceSelector);

export default withRouter(InstanceSelector);