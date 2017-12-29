import React, {Component} from 'react';
import './TargetInfo.css';
import {connect} from 'react-redux';
import {clearAllMessage, setControlVisibility} from '../../actions';
import {withRouter} from 'react-router-dom';

class TargetInfo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            index: 0
        };
    }

    componentDidMount() {


    }

    render() {
        return (
            <div className="target-info">
                <div>
                    <div className="target-instances">
                        {(!this.props.instances || this.props.instances.length === 0) && 'NO OBJECT'}
                        {(this.props.instances && this.props.instances.length > 0) &&
                        <div>
                            <span className="object-count">{this.props.instances.length} OBJECTS SELECTED</span>
                            <span className="object-show-btn"><i className="fa fa-chevron-down" aria-hidden="true"></i></span>
                        </div>
                        }
                    </div>
                    <div className="logo">
                        <div className="icon"><span><i className="fa fa-bolt" aria-hidden="true"></i></span></div>
                        <div className="text"><span>PAPER</span></div>
                    </div>
                    <div className="target-controls">
                        <span><i className="fa fa-cog" aria-hidden="true"></i></span>
                    </div>
                </div>
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

TargetInfo = connect(mapStateToProps, mapDispatchToProps)(TargetInfo);

export default withRouter(TargetInfo);