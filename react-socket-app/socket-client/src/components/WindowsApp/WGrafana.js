import React from "react";
import IFrame from "react-iframe";
import "./WindowsApp.css";

class WGrafana extends React.Component {
  render() {
    return (
      <div className="WGrafana">
        {/* <h2>Grafana iFrame ;) </h2> */}
        <IFrame
          url="http://192.168.0.4:3000/d/acSzEZZRk/teensy-sensors?orgId=1&from=1574675791577&to=1574676091577"
          width="100%"
          height="100%"
          id="myId"
          className=""
          display="block"
          // display="flex"
          position="relative"
          flex-direction="column"
          overflow-y="scroll"
        />
      </div>
    );
  }
}

export default WGrafana;
