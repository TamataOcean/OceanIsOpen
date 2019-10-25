import React from 'react';
import IFrame from 'react-iframe';
import './WindowsApp.css';

class WGrafana extends React.Component {

    render(){
        return (
            <div className="grafanaIFrame">
              <h2>Grafana iFrame ;) </h2>
              <IFrame url="http://192.168.0.104:3000/d/rB2l-uiRk/server-monitoring?orgId=1&from=1571979683962&to=1572001283963&var-Host=Mac-mini-de-FMS.local"
                      width="100%"
                      height="100%"
                      id="myId"
                      className = ""
                      display ="block"
                      position = "relative" />
            </div>
          );
    }
    }

export default WGrafana;