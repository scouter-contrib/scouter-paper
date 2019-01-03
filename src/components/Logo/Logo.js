import React, {Component} from 'react';
import './Logo.css';
import {NavLink} from 'react-router-dom';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {setControllerState, setControllerPin} from '../../actions';

class Logo extends Component {

    toggleMinMax = () => {
        if (this.props.control.Controller === "min") {
            this.props.setControllerState("max");
        } else {
            this.props.setControllerState("min");
        }

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 1000);
    };

    togglePin = () => {
        if (this.props.control.pin) {
            this.props.setControllerPin(false);
        } else {
            this.props.setControllerPin(true);
        }

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 1000);
    };

    render() {

        let instanceParam = (this.props.objects && this.props.objects.length > 0) ? "?objects=" + this.props.objects.map((d) => {
            return d.objHash
        }) : "";

        return (
            <div className="paper-logo-wrapper">
                <div className="paper-logo">
                    <NavLink to={"/" + instanceParam} activeClassName="active">
                        <div className="logo-icon"><i className="fa fa-bolt" aria-hidden="true"></i></div>
                        <div className="logo-text-div">
                            <div className="logo-text logo-text-1">SCOUTER</div>
                            <div className="logo-text logo-text-2">PAPER</div>
                        </div>
                    </NavLink>
                </div>
                <div className="side-icon">
                    <div>
                        <div className="pin-wrapper" onClick={this.togglePin}>
                            <span className={"pin-btn " + (this.props.control.pin ? "pinned" : "no-pinned")}>
                                <i className="fa fa-heart pinned" aria-hidden="true"></i>
                                <i className="fa fa-heart-o no-pinned" aria-hidden="true"></i>
                            </span>
                        </div>
                        <div className="max-wrapper" onClick={this.toggleMinMax}>
                            <span className={"max-btn " + this.props.control.Controller}>
                                <i className="fa fa-angle-left max" aria-hidden="true"></i>
                                <i className="fa fa-bars min" aria-hidden="true"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="short-side-icon" onClick={this.toggleMinMax}>
                    <i className="fa fa-bars" aria-hidden="true"></i>
                </div>
            </div>
        );
    }
}


let mapStateToProps = (state) => {
    return {
        objects: state.target.objects,
        control: state.control
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setControllerState: (state) => dispatch(setControllerState(state)),
        setControllerPin: (pin) => dispatch(setControllerPin(pin))
    };
};

Logo = connect(mapStateToProps, mapDispatchToProps)(Logo);
export default withRouter(Logo);