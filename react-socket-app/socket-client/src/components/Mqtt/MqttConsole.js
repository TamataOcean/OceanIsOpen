import React, {Component} from 'react';
import MqttSubscribe from './MqttSubscribe';
import './Mqtt.css';

class MqttConsole extends Component{
    render() {
        return (
            <div className='console'>
                <p> Mqtt Console </p>
                
                <MqttSubscribe />
            </div>
        )
      }
}

export default MqttConsole;