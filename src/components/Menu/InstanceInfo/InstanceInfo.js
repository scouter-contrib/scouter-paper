import React, {Component} from 'react';
import './InstanceInfo.css';
import {clearAllMessage, setControlVisibility} from '../../../actions';
import {connect} from 'react-redux';

class InstanceInfo extends Component {

    render() {
        return (
            <div className={"instance-info " + this.props.className + " " + (this.props.selected ? "selected" : "")}>
                <div>
                    <div className="instance-btn" onClick={this.props.toggleSelectorVisible}>{this.props.objects.length} <span className="big">OBJECTS</span><span className="small">OBJ</span></div>
                    <div className="preset-btn" onClick={this.props.togglePresetManagerVisible}><i className="fa fa-angle-down" aria-hidden="true"></i></div>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        objects: state.target.objects
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage: () => dispatch(clearAllMessage())
    };
};

InstanceInfo = connect(mapStateToProps, mapDispatchToProps)(InstanceInfo);

export default InstanceInfo;