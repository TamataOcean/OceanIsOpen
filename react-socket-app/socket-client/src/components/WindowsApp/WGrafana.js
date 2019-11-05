import React from 'react';
import IFrame from 'react-iframe';
import './WindowsApp.css';

class WGrafana extends React.Component {

    render() {
        return (
            <div className="WGrafana">
                <h2>Grafana iFrame ;) </h2>
                <IFrame url="http://192.168.0.104:3000/d/rB2l-uiRk/server-monitoring?orgId=1&from=1571979683962&to=1572001283963"
                    width="100%"
                    height="100%"
                    id="myId"
                    className=""
                    display="block"
                    position="relative"
                    display="flex"
                    flex-direction="column"
                    overflow-y="scroll"
                />
            </div>
        );
    }
}

export default WGrafana;