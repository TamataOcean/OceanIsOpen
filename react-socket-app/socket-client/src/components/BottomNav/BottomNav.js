import React, { useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Hidden
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import AddIcon from "@material-ui/icons/Add";
import UpdateIcon from "@material-ui/icons/Update";
import PieChartIcon from "@material-ui/icons/PieChart";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import SettingsIcon from "@material-ui/icons/Settings";

const useStyles = makeStyles(theme => ({
  root: {
    position: "fixed",
    bottom: "0",
    width: "100%"
  },
  links: {
    textDecoration: "none"
  }
}));

export default () => {
  const classes = useStyles();
  // FIXME: selects first tab by default
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Hidden smUp>
      <BottomNavigation
        value={value}
        onChange={handleChange}
        className={classes.root}
      >
        <BottomNavigationAction
          label="Acqu."
          icon={<AddIcon />}
          component={Link}
          to="/acquisition"
          className={classes.links}
        />
        <BottomNavigationAction
          label="Calibration"
          icon={<UpdateIcon />}
          component={Link}
          to="/calibration"
          className={classes.links}
        />
        <BottomNavigationAction
          label="Geopoppy"
          icon={<LocationOnIcon />}
          component={Link}
          to="/geopoppy"
          className={classes.links}
        />
        <BottomNavigationAction
          label="Grafana"
          icon={<PieChartIcon />}
          component={Link}
          to="/grafana"
          className={classes.links}
        />
        <BottomNavigationAction
          label="Système"
          icon={<SettingsIcon />}
          component={Link}
          to="/system"
          className={classes.links}
        />
      </BottomNavigation>
    </Hidden>
  );
};
