import React from "react";
import IFrame from "react-iframe";

class WGeopoppy extends React.Component {
  render() {
    return (
      <div>
        {/* <h2>Geopoppy iFrame ;) </h2> */}
        {/* <IFrame url="https://oio.tamataocean.fr/index.php/view/map/?repository=oio&project=oio_larochelle" */}
        <IFrame
          url="https://oio.tamataocean.fr/index.php/view/map/?repository=oio&project=oio_larochelle"
          width="100%"
          height="800"
          id="myId"
          className=""
          display="block"
          position="relative"
        />
      </div>
    );
  }
}

export default WGeopoppy;
