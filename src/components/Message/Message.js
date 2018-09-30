import React, {Component} from 'react';
import './Message.css';
import {connect} from 'react-redux';
import {clearAllMessage, setControlVisibility} from '../../actions';
import {withRouter} from 'react-router-dom';
import _ from "lodash";

class Message extends Component {

    constructor(props) {
        super(props);

        this.state = {
            index : 0
        };
    }

    componentDidMount() {

    }

    beforeMessage = () => {
        let index = this.state.index;
        if (index > 0) {
            index--;
            this.setState({
                index : index
            });
        }
    };

    afterMessage = () => {
        let index = this.state.index;
        if (index < (this.props.messages.length-1)) {
            index++;
            this.setState({
                index : index
            });
        }
    };

    done = () => {
        this.props.clearAllMessage();
        this.props.setControlVisibility("Message", false);
        const unauthorizedMessages = _.filter(this.props.messages, (m) => m.category === "unauthorized");
        if(unauthorizedMessages && unauthorizedMessages.length > 0) {
            this.props.history.push('/Login');
        }
    };

    render() {

        let title = "";
        let content = "";

        if (this.props.messages && this.props.messages.length > 0) {

            title = this.props.messages[this.state.index].title;
            content = this.props.messages[this.state.index].content;
        }


        return (
                <div className="system-message">
                    <div className="message-content-layout the-thing">
                        {(this.props.messages && this.props.messages.length <= 1) && <div className={"message-indexer-holder"}></div>}
                        {(this.props.messages && this.props.messages.length > 1) && <div className={"message-indexer"}><span>{(this.state.index) + 1}/{this.props.messages.length}</span></div>}
                        <div className="message-content">
                            <div className="before">{(this.state.index > 0) && <span onClick={this.beforeMessage}><i className="fa fa-angle-left" aria-hidden="true"></i></span>}</div>
                            <div className="center-message">
                                {this.props.messages && <div className="message-title"><span>{title}</span></div>}
                                <div className="center-message-content">{content}</div>
                            </div>
                            <div className="after">{(this.props.messages && this.state.index < (this.props.messages.length-1)) && <span onClick={this.afterMessage}><i className="fa fa-angle-right" aria-hidden="true"></i></span>}</div>
                        </div>
                    </div>
                    <div className="message-btns">
                        <button onClick={this.done}>OK</button>
                    </div>
                </div>

        );
    }
}

let mapDispatchToProps = (dispatch) => {
    return {
        setControlVisibility: (name, value) => dispatch(setControlVisibility(name, value)),
        clearAllMessage : () => dispatch(clearAllMessage())
    };
};

Message = connect(undefined, mapDispatchToProps)(Message);

export default withRouter(Message);