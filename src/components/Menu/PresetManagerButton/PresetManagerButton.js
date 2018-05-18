import React, {Component} from 'react';
import './PresetManagerButton.css';
import {clearAllMessage, setControlVisibility} from '../../../actions';
import {connect} from 'react-redux';

class PresetManagerButton extends Component {

    render() {
        return (
            <div className={"layout-manager-button " + this.props.className + " " + (this.props.selected ? "selected" : "")}>
                <div onClick={this.props.togglePresetManagerVisible}>PRESET</div>
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

PresetManagerButton = connect(mapStateToProps, mapDispatchToProps)(PresetManagerButton);

export default PresetManagerButton;