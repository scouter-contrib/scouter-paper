import React, {Component} from 'react';
import './LayoutManagerButton.css';
import {clearAllMessage, setControlVisibility} from '../../../actions';
import {connect} from 'react-redux';

class LayoutManagerButton extends Component {

    render() {
        return (
            <div className={"layout-manager-button " + this.props.className + " " + (this.props.selected ? "selected" : "")}>
                <div onClick={this.props.toggleLayoutManagerVisible}>LAYOUT</div>
            </div>
        );
    }
}

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage())
    };
};

LayoutManagerButton = connect(undefined, mapDispatchToProps)(LayoutManagerButton);

export default LayoutManagerButton;