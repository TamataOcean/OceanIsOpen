import React from 'react';
import {subscribe} from 'mqtt-react';
import './Mqtt.css';

const MessageList = (props) => (
    <div className='subscriber'>
        <span>Console log</span>
        <ul>
            {props.data.map (message => <li> {message} </li>)}
        </ul>
    </div>
);

export default subscribe ({ topic : 'teensy/sensors'})(MessageList)
