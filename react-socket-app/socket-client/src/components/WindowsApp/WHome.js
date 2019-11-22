import React, { Component } from "react";
import { Button } from "@material-ui/core";

class WHome extends Component {
  render() {
    return (
      <div>
        <h2>Welcome Home</h2>
        <Button variant="contained" color="primary">
          Coucou
        </Button>
      </div>
    );
  }
}

export default WHome;
