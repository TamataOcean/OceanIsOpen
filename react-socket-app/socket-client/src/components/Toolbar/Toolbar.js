import React, { Component } from "react";
import logoRecordOn from "../../images/logoRecording_On.png";
import logoRecordOff from "../../images/logoRecording_Off.png";
import logoAcquisition from "../../images/logoDataAcquisition.png";
import logoCalibration from "../../images/logoDataCalibration.png";
import logoGeoloc from "../../images/logoDataGeoloc.png";
import logoGraf from "../../images/logoDataGraph.png";
import logoSystem from "../../images/logoDataSystem.png";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch
} from "react-router-dom";

import { connect } from "react-redux";

//App Windows
import WAcquire from "../WindowsApp/WAcquire";
import WCalibration from "../WindowsApp/WCalibration";
import WGeopoppy from "../WindowsApp/WGeopoppy";
import WGrafana from "../WindowsApp/WGrafana";
import WSystem from "../WindowsApp/WSystem";
import WHome from "../WindowsApp/WHome";
import "./Toolbar.css";
import DrawerToggleButton from "../SideDrawer/DrawerToggleButton";

class toolbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { log } = this.props;

    return (
      <div>
        <header className="toolbar">
          <nav className="toolbar__nav">
            <div className="toggle-button">
              <DrawerToggleButton />
            </div>
            <div className="toolbar__logo">
              {" "}
              <a href="/"> OCEAN IS OPEN </a>
            </div>
            <div className="spacer" />
            <img src={log.state === "Pause" ? logoRecordOff : logoRecordOn} />
            <div className="toolbar__nav-items">
              <ul>
                <li>
                  <Link to={"/acquisistion"}>
                    {" "}
                    <img src={logoAcquisition} /> Acquisition
                  </Link>{" "}
                </li>
                <li>
                  <Link to={"/calibration"}>
                    {" "}
                    <img src={logoCalibration} /> Calibration
                  </Link>
                </li>
                <li>
                  <Link to={"/geopoppy"}>
                    {" "}
                    <img src={logoGeoloc} /> Geopoppy
                  </Link>{" "}
                </li>
                <li>
                  <Link to={"/grafana"}>
                    {" "}
                    <img src={logoGraf} /> Grafana
                  </Link>{" "}
                </li>
                <li>
                  <Link to={"/system"}>
                    {" "}
                    <img src={logoSystem} /> Systeme
                  </Link>{" "}
                </li>
              </ul>
            </div>
          </nav>

          <Switch>
            <Route exact path="/" component={WHome} />
            <Route path="/acquisistion" component={WAcquire} />
            <Route path="/calibration" component={WCalibration} />
            <Route path="/geopoppy" component={WGeopoppy} />
            <Route path="/system" component={WSystem} />
            <Route path="/grafana" component={WGrafana} />
          </Switch>
        </header>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    log: state.log
  };
};

export default connect(mapStateToProps)(toolbar);
