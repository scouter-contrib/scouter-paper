import React, {Component} from 'react';
import './Home.css';
import {withRouter} from 'react-router-dom';
import logo from './scouter.png';

const git = "https://github.com/KIMSEONGSEOB/scouter-page";

class Home extends Component {


    render() {
        return (
            <div className="home">
                <div>
                    <div>
                        <div className="home-content">
                            <div className="top-div">
                                <div className="logo-div"><img alt="scouter-logo" className="logo" src={logo}/></div>
                                <div className="product">SCOUTER PAPER</div>
                                <div className="version">V-1.0-release</div>
                                <div className="power-by">powered by <a href="https://github.com/scouter-project/scouter" target="scouter_paper">scouter</a></div>
                                <div className="compatibility">(SCOUTER Compatibility 1.8.4+)</div>
                                <div className="git"><span className="tag">GITHUB</span><a href={git} target="scouter_paper">{git}</a></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Home);