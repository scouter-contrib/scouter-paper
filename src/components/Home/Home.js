import React, {Component} from 'react';
import './Home.css';
import {withRouter} from 'react-router-dom';
import logo from './scouter.png';

const git = "https://github.com/KIMSEONGSEOB/scouter-page";
const issues = "https://github.com/KIMSEONGSEOB/scouter-page/issues";

class Home extends Component {


    render() {
        return (
            <div className="home">
                <div>
                    <div>
                        <div className="top-content">
                            <div className="top-div">
                                <div className="logo-div"><img alt="scouter-logo" className="logo" src={logo}/></div>
                                <div className="product">SCOUTER PAPER</div>
                                <div className="version">V-1.0-release</div>
                                <div className="power-by">powered by <a href="https://github.com/scouter-project/scouter" target="scouter_paper">scouter</a></div>
                            </div>
                            <div className="center-wrapper">
                                <div className="center-div">
                                    <div>
                                        <div className="center-content">
                                            <h3>SCOUTER PAPER</h3>
                                            <div>
                                                <p>[SCOUTER PAPER] is an open-source software for monitoring performance information from [SCOUTER] through a web browser.</p>
                                                <h4>GITHUB</h4>
                                                <p><a href={git} target="_blank">{git}</a></p>
                                                <h4>ISSUES</h4>
                                                <p><a href={issues} target="_blank">{issues}</a></p>
                                                <h4>CONTRIBUTION</h4>
                                                <p>THANKS ^-^</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="center-content">
                                            <h3>QUICK USAGE</h3>
                                            <div>
                                                <ol>
                                                    <li>GO TO [SETTINGS] TAB AND CLICK [EDIT] BUTTON. FILLS YOUR 'SCOUTER (WEB API) SERVER INFO' AND CLICK [APPLY] BUTTON.</li>
                                                    <li>IF YOUR SCOUTER SERVER NEEDS AUTHENTICATION, CLICK [LOGIN] BUTTON TO AUTHENTICATE.</li>
                                                    <li>CLICK [0 INSTANCE] SYMBOL TO SELECT INSTANCES TO MONITOR.</li>
                                                    <li>GO TO [PAPERS] AND CLICK [<i className="fa fa-plus-circle" aria-hidden="true"></i>] BUTTON TO ADD PAPER</li>
                                                    <li>DRAG METRIC TO PAPER AND ENJOY</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="center-content">
                                            <h3>TIPS</h3>
                                            <div>
                                                <ul>
                                                    <li>SCOUTER PAPER IS MADE OF RESPONSIVE WEB, SO YOU CAN BE ACCESSED IN MOBILE, TABLET</li>
                                                    <li>YOU CAN ADJUST LOCATION AND SIZE  OF PAPER</li>
                                                    <li>EXCEPTION A FEW SPECIAL METRICS, YOU CAN DROP METRIC TO PAPER OVER AND OVER.</li>
                                                    <li>LAYOUT (PAPER, METRIC, LOCATION, SIZE, CONFIG) AND SETTING INFORMATION ARE STORED IN CLIENT SIDE STORAGE (LOCATION STORAGE).</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Home);