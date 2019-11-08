import React, {Component} from 'react';
import MqttSubscribe from './MqttSubscribe';
import MqttSubscribeLog from './MqttSubscribeV2'
import './Mqtt.css';

class MqttConsole extends Component{
    constructor(props){
        super(props);
    }

    //Test
    render() {
        console.log("MqttConsole Topic : ", this.props.topic );
        return (
            <div className='console'>               
                <MqttSubscribe topic={this.props.topic} />
            </div>
        )
      }
}

export default MqttConsole;