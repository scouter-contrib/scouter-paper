import React, {Component} from 'react';
import './App.css';
import {Overlay, Message, Realtime, ContentWrapper, TargetSelector} from './components';
import {Route, Switch} from 'react-router-dom';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import TargetInfo from "./components/TargetInfo/TargetInfo";
import Login from "./components/Login/Login";
import Menu from "./components/Menu/Menu";
import RequestBar from "./components/RequestBar/RequestBar";
import Loading from "./components/Loading/Loading";
import Paper from "./components/Paper/Paper";
import Settings from "./components/Settings/Settings";
import {setConfig} from './actions';

class App extends Component {

    constructor(props){
        super(props);

        let str = localStorage.getItem("config");
        if (str) {
            let config = JSON.parse(str);
            this.props.setConfig(config)

        }

    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState){
        document.querySelector("body").style.backgroundColor = this.props.bgColor;
    }

    render() {
        console.log(this.props.config);

        return (
            <ContentWrapper>
                <RequestBar/>
                <Menu/>
                { false &&
                <TargetInfo/>
                }
                <Switch>
                    <Route exact path='/login' component={Login}/>
                    <Route exact path='/paper' component={Paper}/>
                    <Route exact path='/settings' component={Settings}/>
                    <Route exact path='/realtime' component={Realtime}/>
                </Switch>
                { false &&
                    <Overlay visible={this.props.control.TargetSelector}>
                        <TargetSelector/>
                    </Overlay>
                }
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