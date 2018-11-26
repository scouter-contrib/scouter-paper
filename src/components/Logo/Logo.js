import React, {Component} from 'react';
import './Logo.css';
import {NavLink} from 'react-router-dom';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {setControllerState} from '../../actions';

class Logo extends Component {

    toggleMinMax = () => {
        if (this.props.control.Controller === "min") {
            this.props.setControllerState("max");
        } else {
            this.props.setControllerState("min");
        }

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);
    };

    toggleFixed = () => {
        if (this.props.control.Controller === "fixed") {
            this.props.setControllerState("min");
        } else {
            this.props.setControllerState("fixed");
        }

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);
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
                        <div className="fixed-wrapper" onClick={this.toggleFixed}>
                            <span className={"fixed-btn " + this.props.control.Controller}>
                                <i className="fa fa-heart-o no-fixed" aria-hidden="true"></i>
                                <i className="fa fa-heart fixed" aria-hidden="true"></i>
                            </span>
                        </div>
                        <div className="max-wrapper" onClick={this.toggleMinMax}>
                            <span className={"max-btn " + this.props.control.Controller}>
                                <i className="fa fa-angle-left max" aria-hidden="true"></i>
                                <i className="fa fa-angle-right min" aria-hidden="true"></i>
                            </span>
                        </div>
                    </div>
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
        setControllerState: (state) => dispatch(setControllerState(state))
    };
};

Logo = connect(mapStateToProps, mapDispatchToProps)(Logo);
export default withRouter(Logo);