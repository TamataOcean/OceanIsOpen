// Updated. Thanks to: Paul Luna
import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import Toolbar from './components/Toolbar/Toolbar';
import Sidenav from './components/Sidenav/Sidenav';
import SideDrawer from './components/SideDrawer/SideDrawer'
import Backdrop from './components/Backdrop/Backdrop'


class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: "localhost:4001",

      ///
      color: 'white',
      // Teensy Config
      teensy_user: '',
      teensy_version : ''
    };
  }

  // sending sockets
  send = () => {
    const socket = socketIOClient(this.state.endpoint);
    socket.emit('change color', this.state.color) // change 'red' to this.state.color
  }
  ///

  // adding the function
  setColor = (color) => {
    this.setState({ color })
  }

  componentDidMount = () => {
      const socket = socketIOClient(this.state.endpoint);
      setInterval(this.send(), 1000)
      socket.on('change color', (col) => {
          document.body.style.backgroundColor = col
      })
  }

  render() {
    // testing for socket connections

    const socket = socketIOClient(this.state.endpoint);

    return (
      <div style={{height: '100%'}} classname="App">
        
        <Toolbar />
        <SideDrawer />      
        <Backdrop />
 
        <main style={{ marginTop: '30px' }}>
          <p> This is the beginning </p>
        </main>


        <div style={{ textAlign: "center" }}>
          <button onClick={() => this.send() }>Change Color</button>
          <button id="blue" onClick={() => this.setColor('blue')}>Blue</button>
          <button id="red" onClick={() => this.setColor('red')}>Red</button>
        </div>
      </div>
    )
  }
}
export default App;