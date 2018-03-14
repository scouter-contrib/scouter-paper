import React, {Component} from 'react';
import './LayoutManagerButton.css';
import {clearAllMessage, setControlVisibility} from '../../../actions';
import {connect} from 'react-redux';

class LayoutManagerButton extends Component {

    render() {
        return (
            <div className={"layout-manager-button " + this.props.className}>
                <div onClick={this.props.toggleLayoutManagerVisible}>LAYOUT</div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        instances: state.target.instances
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage())
    };
};

LayoutManagerButton = connect(mapStateToProps, mapDispatchToProps)(LayoutManagerButton);

export default LayoutManagerButton;