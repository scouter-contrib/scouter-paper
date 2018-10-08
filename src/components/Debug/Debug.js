import React, {Component} from 'react';
import './Debug.css';
import {connect} from "react-redux";
import copy from 'copy-to-clipboard';

class Debug extends Component {

    constructor(props) {
        super(props);
        this.state = {
            copyBtnText : "COPY TO CLIPBOARD"
        };
    }

    copyText = () => {
        let info = {
            objects : this.props.objects,
            config : this.props.config,
            template : this.props.template,
            counterInfo : this.props.counterInfo
        };

        copy(JSON.stringify(info));

        this.setState({
            copyBtnText : "COPIED!"
        });

        setTimeout(() => {
            this.setState({
                copyBtnText : "COPY TO CLIPBOARD"
            });
        }, 2000);
    };

    close = () => {
        this.props.closeDebug();
    };

    render() {
        return (
            <div className="debug-wrapper">
                <div>
                    <div className="title">
                        <div className="title-text">DEBUG INFO</div>
                        <div className="copy-btn"><span className="copy-url-btn" onClick={this.copyText}>{this.state.copyBtnText}</span></div>
                        <div className="close-btn"><div onClick={this.close}><i className="fa fa-times-circle-o" aria-hidden="true"></i></div></div>
                    </div>
                    <div>
                        <div className="row">
                            <div className="key">objects</div>
                            <div className="value">{JSON.stringify(this.props.objects)}</div>
                        </div>
                        <div className="row">
                            <div className="key">config</div>
                            <div className="value">{JSON.stringify(this.props.config)}</div>
                        </div>
                        <div className="row">
                            <div className="key">template</div>
                            <div className="value">{JSON.stringify(this.props.template)}</div>
                        </div>
                        <div className="row">
                            <div className="key">counterInfo</div>
                            <div className="value">{JSON.stringify(this.props.counterInfo)}</div>
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
        config: state.config,
        template: state.template,
        counterInfo: state.counterInfo
    };
};

Debug = connect(mapStateToProps, undefined)(Debug);
export default Debug;