import React, {Component} from 'react';
import './OldVersion.css';
import logo from '../../img/scouter.png';
import logoBlack from '../../img/scouter_black.png';
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';

class OldVersion extends Component {

    render() {
        return (
            <article className="old-version">
                <div>
                    <div className="logo-wrapper">
                        <div>
                            <div className="logo-div"><img alt="scouter-logo" className="logo" src={this.props.config.theme === "theme-gray" ? logoBlack : logo}/></div>
                        </div>
                    </div>
                    <div className="msg"><span>PAPER 2.0 is available only on scout server 2.0 and later.</span></div>
                </div>
            </article>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

OldVersion = connect(mapStateToProps, undefined)(OldVersion);
export default withRouter(OldVersion);