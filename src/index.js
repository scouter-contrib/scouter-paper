import React from 'react';
import ReactDOM from 'react-dom';
import "./fonts.css";
import 'font-awesome/css/font-awesome.min.css';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import scouterApp from './reducers';
import { HashRouter } from 'react-router-dom'

const store = createStore(scouterApp);

ReactDOM.render(
    <HashRouter>
        <Provider store={store}>
            <App/>
        </Provider>
    </HashRouter>, document.getElementById('root'));
registerServiceWorker();