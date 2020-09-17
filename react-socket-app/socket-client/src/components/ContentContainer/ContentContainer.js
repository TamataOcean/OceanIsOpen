import React, { useEffect } from "react";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ApiGetServerConfig } from "../../features/sensorsAPI";

import HelloCard from "../HelloCard/HelloCard";
import WGeopoppy from "../WindowsApp/WGeopoppy";
import WGrafana from "../WindowsApp/WGrafana";
import WSystem from "../WindowsApp/WSystem";
import Acquisition from "../Acquisition";
import Calibration from "../Calibration";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(10),
  },
}));

export default ({ theme, toggleDarkTheme }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  useEffect(() => {
    async function getServerConfig() {
      dispatch(ApiGetServerConfig());
    }

    getServerConfig();
  }, [dispatch]);

  return (
    <Container maxWidth="md" className={classes.root}>
      <Route exact path="/">
        <HelloCard theme={theme} toggleDarkTheme={toggleDarkTheme} />
      </Route>
      <Route exact path="/acquisition" component={Acquisition} />
      <Route exact path="/calibration" component={Calibration} />
      <Route exact path="/geopoppy" component={WGeopoppy} />
      <Route exact path="/system" component={WSystem} />
      <Route exact path="/grafana" component={WGrafana} />
    </Container>
  );
};
