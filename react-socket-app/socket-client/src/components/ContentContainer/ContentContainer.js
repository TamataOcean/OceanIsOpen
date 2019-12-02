import React from "react";
import { Container, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Route, Switch, Link } from "react-router-dom";

import HelloCard from "../HelloCard/HelloCard";
import WAcquire from "../WindowsApp/WAcquire";
import WCalibration from "../WindowsApp/WCalibration";
import WGeopoppy from "../WindowsApp/WGeopoppy";
import WGrafana from "../WindowsApp/WGrafana";
import WSystem from "../WindowsApp/WSystem";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(10)
  }
}));

export default ({ theme, toggleDarkTheme }) => {
  const classes = useStyles();

  return (
    <Container maxWidth="md" className={classes.root}>
      <Route exact path="/">
        <HelloCard theme={theme} toggleDarkTheme={toggleDarkTheme} />
      </Route>
      <Route exact path="/acquisition" component={WAcquire} />
      <Route exact path="/calibration" component={WCalibration} />
      <Route exact path="/geopoppy" component={WGeopoppy} />
      <Route exact path="/system" component={WSystem} />
      <Route exact path="/grafana" component={WGrafana} />
    </Container>
  );
};
