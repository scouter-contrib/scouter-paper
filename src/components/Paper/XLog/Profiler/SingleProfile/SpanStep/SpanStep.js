import React, {Component} from 'react';
import './SpanStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";
import JSONPretty from 'react-json-pretty';
/*
    public int hash;
    public int elapsed;
    public int error;
    public long timestamp;
    public byte spanType;
    public Endpoint localEndpoint;
    public Endpoint remoteEndpoint;
    public boolean debug;
    public boolean shared;
    public List<SpanAnnotation> annotations;
    public Map<String, String> tags;

    public static class SpanAnnotation {
        long timestamp;
        String value;
    }
    public static class Endpoint {
        int hash;
        String serviceName;
        String ip;
        int port;
    }
 */
class SpanStep extends Component {
    render() {
        const step = this.props.row.step;

        let localEndpoint = step.localEndpoint.serviceName ? JSON.stringify(step.localEndpoint) : null;
        let remoteEndpoint = step.remoteEndpoint.serviceName ? JSON.stringify(step.remoteEndpoint) : null;
        let tags = (step.tags && Object.keys(step.tags).length > 0) ? JSON.stringify(step.tags) : null;
        let annotations = (step.annotation && step.annotation.length > 0) ?JSON.stringify(step.annotations) : null;

        return (
            <div className="step span-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="SPAN"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                <div className="main-value">{this.props.row.mainValue}</div>
                {(localEndpoint) &&
                <div className="span-content">
                    <div className="span-title">localEndPoint</div>
                    {this.props.formatter && <div className="span-value"><JSONPretty json={localEndpoint}></JSONPretty></div>}
                    {!this.props.formatter && <div className="span-value">{localEndpoint}</div>}
                </div>}
                {(remoteEndpoint) &&
                <div className="span-content">
                    <div className="span-title">remoteEndPoint</div>
                    {this.props.formatter && <div className="span-value"><JSONPretty json={remoteEndpoint}></JSONPretty></div>}
                    {!this.props.formatter && <div className="span-value">{remoteEndpoint}</div>}
                </div>}
                {(tags) &&
                <div className="span-content">
                    <div className="span-title">tags</div>
                    {this.props.formatter && <div className="span-value"><JSONPretty json={tags}></JSONPretty></div>}
                    {!this.props.formatter && <div className="span-value">{tags}</div>}
                </div>}
                {(annotations) &&
                <div className="span-content">
                    <div className="span-title">annotations</div>
                    {this.props.formatter && <div className="span-value"><JSONPretty json={annotations}></JSONPretty></div>}
                    {!this.props.formatter && <div className="span-value">{annotations}</div>}
                </div>}
            </div>
        )
    }
}

export default SpanStep;
