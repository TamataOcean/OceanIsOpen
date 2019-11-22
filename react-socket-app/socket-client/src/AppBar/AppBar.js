import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Hidden
} from "@material-ui/core";
import { Link } from "react-router-dom";
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  },
  links: {
    color: "white"
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
          <Link to="/acquisition">
            <Button className={classes.links}>Acquisition</Button>
          </Link>
          <Link to="/calibration">
            <Button className={classes.links}>Calibration</Button>
          </Link>
          <Link to="/geopoppy">
            <Button className={classes.links}>Geopoppy</Button>
          </Link>
          <Link to="/grafana">
            <Button className={classes.links}>Grafana</Button>
          </Link>
          <Link to="/system">
            <Button className={classes.links}>Système</Button>
          </Link>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};
