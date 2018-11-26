import React, {Component} from 'react';
import './Controller.css';
import {setControllerState} from '../../actions';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

class Controller extends Component {
    render() {
        return (
            <article className={"controller-wrapper " + this.props.control.Controller}>
                <div>{this.props.children}</div>
            </article>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        control: state.control
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControllerState: (state) => dispatch(setControllerState(state))
    };
};

Controller = connect(mapStateToProps, mapDispatchToProps)(Controller);
export default withRouter(Controller);
