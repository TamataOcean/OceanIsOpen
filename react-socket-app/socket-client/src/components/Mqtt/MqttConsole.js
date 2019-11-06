import React, {Component} from 'react';
import MqttSubscribe from './MqttSubscribe';
import './Mqtt.css';

class MqttConsole extends Component{
    //Test
    render() {
        return (
            <div className='console'>               
                <MqttSubscribe />
            </div>
        )
      }
}

export default MqttConsole;