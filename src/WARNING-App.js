import React, {Component} from 'react';
import './App.css';
import {Header, ContentWrapper, TargetSelector, InstanceSelector} from './components';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {connect} from 'react-redux';

import Overlay from "./components/Overlay/Overlay";
import Message from "./components/Message/Message";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Realtime from "./components/Realtime/Realtime";
import {withRouter} from 'react-router-dom';

class App extends Component {

    componentDidMount() {

    }

    render() {


        //console.log(this.props.messages);
        //console.log(this.props.targetSelectorVisible);
        return (
            <ContentWrapper>

                <Switch>
                    <Route exact path='/realtime' component={Realtime}/>
                </Switch>
                <ReactCSSTransitionGroup transitionName="content-wrapper">
                    {
                    <Overlay visible={this.props.targetSelectorVisible}>
                        <TargetSelector/>
                    </Overlay>
                    }
                    {this.props.messageVisible &&
                    <Overlay>
                        <Message messages={this.props.messages}/>
                    </Overlay>
                    }
                </ReactCSSTransitionGroup>
            </ContentWrapper>
        );
    }
}


let mapStateToProps = (state) => {
    return {
        targetSelectorVisible: state.control.TargetSelector,
        messageVisible: state.control.Message,
        instances: state.target.instances,
        messages: state.message.messages
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        // setLogin: (login) => dispatch(setLogin(login))
    };
};

App = connect(mapStateToProps, mapDispatchToProps)(App);

export default withRouter(App);