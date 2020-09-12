import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Hidden,
  CircularProgress,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";
import { red, green } from "@material-ui/core/colors";
import { useSelector, useDispatch } from "react-redux";
import { ApiGetServerConfig } from "../../features/sensorsAPI";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  links: {
    color: "white",
  },
  serverConnected: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700],
    },
  },
  serverDisconnected: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
    "&:hover": {
      backgroundColor: red[700],
    },
  },
}));

export default ({ toggleDrawer }) => {
  const classes = useStyles();

  const serverConnected = useSelector((state) => state.server.isConnected);
  const isFetching = useSelector((state) => state.server.isFetching);
  const dispatch = useDispatch();

  const ServerButton = () => (
    <Button
      onClick={() => dispatch(ApiGetServerConfig())}
      className={
        serverConnected ? classes.serverConnected : classes.serverDisconnected
      }
    >
      Serveur
    </Button>
  );

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
        <ServerButton />
        {isFetching ? <CircularProgress color="inherit" size="1.5rem" /> : null}
      </Toolbar>
    </AppBar>
  );
};
