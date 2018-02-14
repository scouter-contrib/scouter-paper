import React, {Component} from 'react';
import './App.css';
import {
    Settings,
    Paper,
    Loading,
    RequestBar,
    Menu,
    Login,
    Overlay,
    Message,
    ContentWrapper
} from './components';
import {Route, Switch} from 'react-router-dom';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {setConfig} from './actions';

class App extends Component {

    constructor(props) {
        super(props);

        let str = localStorage.getItem("config");
        if (str) {
            let config = JSON.parse(str);
            this.props.setConfig(config);
        }

    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        //document.querySelector("body").style.backgroundColor = this.props.bgColor;
    }

    render() {
        return (
            <ContentWrapper>
                <RequestBar/>
                <Menu/>
                <Switch>
                    <Route exact path='/login' component={Login}/>
                    <Route exact path='/paper' component={Paper}/>
                    <Route exact path='/settings' component={Settings}/>
                </Switch>
                {this.props.control.Message &&
                <Overlay>
                    <Message messages={this.props.messages}/>
                </Overlay>
                }
                <Loading visible={this.props.control.Loading}></Loading>
            </ContentWrapper>
        );
    }
}


let mapStateToProps = (state) => {
    return {
        control: state.control,
        instances: state.target.instances,
        messages: state.message.messages,
        bgColor: state.style.bgColor,
        config: state.config
    };
};

let mapDispatchToProps = (dispatch) => {
    return {
        setConfig: (config) => dispatch(setConfig(config))
    };
};

App = connect(mapStateToProps, mapDispatchToProps)(App);

export default withRouter(App);