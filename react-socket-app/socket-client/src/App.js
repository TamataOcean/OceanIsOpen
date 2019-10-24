// Updated. Thanks to: Paul Luna
import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import Toolbar from './components/Toolbar/Toolbar';

import {
  BrowserRouter as Router
} from "react-router-dom";

class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: "localhost:4001",
      color: 'white',
      teensy_user: '',
      teensy_version : ''
    };
  }

  render() {
    // testing for socket connections

    const socket = socketIOClient(this.state.endpoint);

    return (
      <div classname="App">
       
        <Router>
            <Toolbar />
                <main style={{ marginTop: '30px' }}>
                  <p> This is the beginning </p>
                </main>
        </Router>
      </div>
    )
  }
}
export default App;