import React, {Component} from 'react';
import './ContentWrapper.css';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

class ContentWrapper extends Component {
    render() {
        return (
            <article className={"content-wrapper " + this.props.control.Controller + " " + (this.props.control.pin ? "pinned" : "")}>
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

ContentWrapper = connect(mapStateToProps, undefined)(ContentWrapper);
export default withRouter(ContentWrapper);