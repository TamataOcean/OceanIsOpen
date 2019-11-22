import React, { Component } from "react";
import MqttSubscribe from "./MqttSubscribe";
import "./Mqtt.css";

class MqttConsole extends Component {
  //Test
  render() {
    console.log("MqttConsole Topic : ", this.props.topic);
    return (
      <div className="console">
        <MqttSubscribe topic={this.props.topic} />
      </div>
    );
  }
}

export default MqttConsole;
