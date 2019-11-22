import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Hidden
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  }
}));

export default ({ toggleDrawer }) => {
  const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          OceanIsOpen
        </Typography>
        <Hidden smDown>
          <Button color="inherit">Acquisition</Button>
          <Button color="inherit">Calibration</Button>
          <Button color="inherit">Geopoppy</Button>
          <Button color="inherit">Grafana</Button>
          <Button color="inherit">System</Button>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};
