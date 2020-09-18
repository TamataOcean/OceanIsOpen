import React from "react";
import {
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import AddIcon from "@material-ui/icons/Add";
import CompassCalibrationIcon from "@material-ui/icons/CompassCalibration";
import PieChartIcon from "@material-ui/icons/PieChart";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import SettingsIcon from "@material-ui/icons/Settings";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import BrightnessHighIcon from "@material-ui/icons/BrightnessHigh";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
}));

export default ({ isOpen, toggleDrawer, theme, toggleDarkTheme }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Drawer
        open={isOpen}
        className={classes.drawer}
        variant="temporary"
        onClose={toggleDrawer}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          <Link to="/acquisition">
            <ListItem button>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText>Acquisition</ListItemText>
            </ListItem>
          </Link>
          <Link to="/calibration">
            <ListItem button>
              <ListItemIcon>
                <CompassCalibrationIcon />
              </ListItemIcon>
              <ListItemText>Calibration</ListItemText>
            </ListItem>
          </Link>
          <Link to="/geopoppy">
            <ListItem button>
              <ListItemIcon>
                <LocationOnIcon />
              </ListItemIcon>
              <ListItemText>Geopoppy</ListItemText>
            </ListItem>
          </Link>
          <Link to="/grafana">
            <ListItem button>
              <ListItemIcon>
                <PieChartIcon />
              </ListItemIcon>
              <ListItemText>Grafana</ListItemText>
            </ListItem>
          </Link>
          <Link to="/system">
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText>Système</ListItemText>
            </ListItem>
          </Link>
          <ListItem button onClick={toggleDarkTheme}>
            <ListItemIcon>
              {theme.palette.type === "light" && <Brightness4Icon />}
              {theme.palette.type === "dark" && <BrightnessHighIcon />}
            </ListItemIcon>
            <ListItemText>Thème</ListItemText>
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
};
