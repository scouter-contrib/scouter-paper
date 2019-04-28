import React, {Component} from 'react';
import './Home.css';
import logo from '../../img/scouter.png';
import logoBlack from '../../img/scouter_black.png';
import {connect} from 'react-redux';
import jQuery from "jquery";
import * as common from '../../common/common';

const git = "https://github.com/mindplates/scouter-paper";
const version = common.version;

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            release : false,
            showNote : false
        };
    }

    componentDidMount = () => {
        let that = this;

        if(this.props.config.others.checkUpdate === "Y") {
            var url = 'https://api.github.com/repos/mindplates/scouter-paper/releases/latest';
            jQuery.get(url).done(function (data) {
                if (data.tag_name > version) {

                    let lines = data.body.split("\n");
                    let text = {
                        title: lines[0],
                        category: []
                    };

                    let current;
                    for (let i = 1; i < lines.length; i++) {
                        let line = lines[i];
                        if (!line || line.trim() === "") {
                            continue;
                        }

                        if (line[0] === "<") {
                            text.category.push({
                                title: line.substring(1, line.length - 2),
                                lines: []
                            });
                            current = text.category[text.category.length - 1];
                            continue;
                        } else {
                            if (!current) {
                                text.category.push({
                                    title: "MISC",
                                    lines: []
                                });
                                current = text.category[text.category.length - 1];
                            }

                            if (line[0] === "-") {
                                current.lines.push(line.substring(1, line.length - 1));
                            } else {
                                current.lines.push(line);
                            }

                        }
                    }

                    that.setState({
                        release: true,
                        version: data.name,
                        url: data.html_url,
                        _text: data.body,
                        text: text
                    });
                }
            });
        }
    };

    render() {
        return (
            <div className="home">
                <div>
                    <div>
                        {this.state.release &&
                        <div className="release">
                            <div className="msg">NEW VERSION({this.state.version}) RELEASED</div>
                            <div className="btns"><a href={this.state.url}><span>DOWNLOAD</span></a><span onClick={() => {this.setState({showNote:true})}}>RELEASE NOTE</span></div>
                        </div>
                        }
                        {(this.state.release && this.state.showNote) &&
                        <div className="note">
                            <div>
                                <div className="note-content">
                                    <div className="release-title">
                                        <div className="release-version">{this.state.version} RELEASE NOTES</div>
                                        <h2>{this.state.text.title}</h2>
                                        <div className="close-btn" onClick={() => {this.setState({showNote:false})}}></div>
                                    </div>
                                    <div className="release-note scrollbar">
                                        {this.state.text.category.map((d, jnx) => {
                                            return (
                                                <div className="category" key={jnx}>
                                                    <div className="category-title">{d.title}</div>
                                                    <div className="category-content">{d.lines.map((line, inx) => {
                                                        return <div className={line[0] === " " ? 'no-list' : ''} key={inx}>{line}</div>
                                                    })}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                        <div className="home-content">
                            <div className="top-div">
                                <div className="logo-div"><img alt="scouter-logo" className="logo" src={this.props.config.theme === "theme-gray" ? logoBlack : logo}/></div>
                                <div className="product">SCOUTER PAPER</div>
                                <div className="version">V-{version}</div>
                                <div className="power-by">powered by <a href="https://github.com/scouter-project/scouter" target="scouter_paper">scouter</a></div>
                                <div className="compatibility">(SCOUTER Compatibility 2.6.2+)</div>
                                <div className="git"><span className="tag">GITHUB</span><a href={git} target="scouter_paper">{git}</a></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


let mapStateToProps = (state) => {
    return {
        config: state.config
    };
};

Home = connect(mapStateToProps, undefined)(Home);
export default Home;