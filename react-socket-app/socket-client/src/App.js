import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import {
  MuiThemeProvider,
  createMuiTheme,
  CssBaseline
} from "@material-ui/core";
import { BrowserRouter as Router } from "react-router-dom";
import AppBar from "./AppBar/AppBar";
import Drawer from "./components/SideDrawer/Drawer";
import BottomNav from "./components/BottomNav/BottomNav";
import ContentContainer from "./components/ContentContainer/ContentContainer";

class App extends Component {
  constructor() {
    super();

    this.state = {
      endpoint: "localhost:4001",
      color: "white",
      teensy_user: "",
      teensy_version: "",
      isDrawerOpen: false,
      theme: {
        palette: {
          type: "light"
        }
      }
    };
  }

  toggleDarkTheme = () => {
    let newTheme = this.state.theme.palette.type === "light" ? "dark" : "light";
    this.setState({
      theme: {
        palette: {
          type: newTheme
        }
      }
    });
  };

  toggleDrawer = () => {
    this.setState(oldState => {
      return {
        isDrawerOpen: !oldState.isDrawerOpen
      };
    });
  };

  render() {
    const { theme, isDrawerOpen } = this.state;
    const muiTheme = createMuiTheme(theme);

    // testing for socket connections
    const socket = socketIOClient(this.state.endpoint);

    return (
      <MuiThemeProvider theme={muiTheme}>
        <Router>
          <CssBaseline />
          <AppBar toggleDrawer={this.toggleDrawer} />
          <Drawer
            isOpen={isDrawerOpen}
            toggleDrawer={this.toggleDrawer}
            theme={theme}
            toggleDarkTheme={this.toggleDarkTheme}
          />
          <ContentContainer
            theme={theme}
            toggleDarkTheme={this.toggleDarkTheme}
          />
          <BottomNav />
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
