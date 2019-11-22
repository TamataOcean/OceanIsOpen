import React, { Component } from "react";
import { subscribe } from "mqtt-react";
import "./Mqtt.css";

const topic = "teensy/console";

export class MqttSubscribe extends Component {
  render() {
    return (
      <div className="subscriber">
        <span>Console log for : {this.props.topic}</span>
        <ul>
          {this.props.data.map(message => (
            <li> {message} </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default subscribe({ topic: topic })(MqttSubscribe);
