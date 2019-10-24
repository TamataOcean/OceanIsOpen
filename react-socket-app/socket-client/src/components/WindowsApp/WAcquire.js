import React, {Component} from 'react';
import { Connector } from 'mqtt-react';
import MqttConsole from '../Mqtt/MqttConsole';

class WAcquire extends Component {

    render(){
        return (
          <div>
            <h2>Acquisition - Harvest Data</h2>
            <input type="submit" value="Begin Record" />
            
            <Connector mqttProps="ws://192.168.0.104:9001/"> 
              <MqttConsole /> 
            </Connector>
          </div>
          );
    }
    }

export default WAcquire;