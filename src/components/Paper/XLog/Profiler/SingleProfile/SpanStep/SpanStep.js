import React, {Component} from 'react';
import './SpanStep.css';
import StepGeneral from "../StepGeneral/StepGeneral";
import TxNavLink from "../TxNavLink/TxNavLink";
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
        console.log(this.props.row);
        const step = this.props.row.step;

        let localEndpoint = step.localEndpoint.serviceName ? JSON.stringify(step.localEndpoint) : null;
        let remoteEndpoint = step.remoteEndpoint.serviceName ? JSON.stringify(step.remoteEndpoint) : null;
        let tags = (step.tags && Object.keys(step.tags).length > 0) ? JSON.stringify(step.tags) : null;
        let annotations = (step.annotation && step.annotation.length > 0) ?JSON.stringify(step.annotations) : null;

        return (
            <div className="step span-step">
                <StepGeneral startTime={this.props.startTime} row={this.props.row} elapsed={this.props.row.step.elapsed} type="SPAN"/>
                <TxNavLink txLinkClick={this.props.txLinkClick} row={this.props.row}></TxNavLink>
                <div className="message-content">{this.props.row.mainValue}</div>
                {(localEndpoint) &&
                    <div className="message-content tag">localEndPoint: {localEndpoint}</div>}
                {(remoteEndpoint) &&
                    <div className="message-content tag">remoteEndPoint: {localEndpoint}</div>}
                {(tags) &&
                    <div className="message-content tag">tags: {tags}</div>}
                {(annotations) &&
                    <div className="message-content tag">annotations: {annotations}</div>}
            </div>
        )
    }
}

export default SpanStep;
