/* Node Server to 
- Listen the Teensy'Serial port
- On message request, get GPS Possition
- Then save on InFlux / postGres

- Execute also an Express Server to answer ReactApp Request(
	- logStart / logStop
	- Calibrate
	- ...
)
*/
var DEBUG = true;
var DEBUG_GPS = false;
var GNSS_CONNECTED = true; // FOR TEST ONLY - True if GNSS Connected

var jsonfile = require("jsonfile");
const updateJsonFile = require('update-json-file')

jsonfile.spaces = 4;

const { exec } = require("child_process");

var mqtt = require("mqtt"); //includes mqtt server
const TamataPostgres = require("./actions/components/TamataPostgres");
const TamataInfluxDB = require("./actions/components/TamataInflux");
const GNSS_Drotek = require("./actions/components/GNSS_Drotek");
const GNSS_Standard = require("./actions/components/GNSS_Standard");

const { cpuUsage } = require("process");

var configFile = "config.json";
var jsonConfig;
var mqttTopicUpdate = "";
var mqttTopicOrder = "";
var mqttServer = "";
var interval = 5000;
var serialport_GPS;
var serialport_TEENSY;
var baud_TEENSY;
var baud_GPS;
let parser_GPS;
let parser_TEENSY;
var GPS_Modele;
var new_interval;
var apiAnswer = "";
var data_sync;
//---------------------
// INITIALISATION
//---------------------
jsonfile.readFile(configFile, function (err, data) {
  jsonConfig = data;

  if (err) throw err;
  /* Mosquitto Config */
  mqttServer = data.system.mqtt.server;
  mqttTopicUpdate = data.system.mqtt.topicUpdate;
  mqttTopicOrder = data.system.mqtt.topicOrder;
  mqttUser = data.system.mqtt.user;

  /* state */
  satellite_Acquisition = data.state.satellite_Acquisition;
  teensy_Acquisition = data.state.teensy_Acquisition;
  interval = data.state.interval;
  new_interval = data.state.interval;
  data_sync = data.state.data_sync

  user = data.system.user;
  serialport_TEENSY = data.system.serialport_TEENSY.port;
  baud_TEENSY = data.system.serialport_TEENSY.baud;
  serialport_GPS = data.system.serialport_GPS.port;
  baud_GPS = data.system.serialport_GPS.baud;
  GPS_Modele = data.system.serialport_GPS.modele;

  /* Init State */
  if (data_sync) execService("auto_replay", "start")

  begin();
});

/***************************************
- function begin())
- Listening on Serial for TEENSY & GPS
- When Data message arrive, => insertData()
*/
function begin() {
  // ****************************
  /* EXPRESS.JS & SOCKET.IO -- */
  // ****************************
  var express = require("express");
  var session = require("cookie-session"); // Charge le middleware de sessions
  var bodyParser = require("body-parser"); // Charge le middleware de gestion des paramètres
  var urlencodedParser = bodyParser.urlencoded({ extended: false });
  const path = require("path");
  var app = express();
  const server = require("http").createServer(app);
  const io = require("socket.io")(server);


  const SerialPort = require("serialport");
  const Readline = require("@serialport/parser-readline");

  /* LISTENING TEENSY */
  /* **************** */
  const port_TEENSY = new SerialPort(serialport_TEENSY, {
    baudRate: baud_TEENSY,
  });

  /* LISTENING on MQTT ( Mosquitto ) */
  client = mqtt.connect('mqtt://'+ jsonConfig.system.mqtt.server );
  client.subscribe( jsonConfig.system.mqtt.topicUpdate ); 
  client.on('connect', () => { console.log('Mqtt connected to ' + jsonConfig.system.mqtt.server + "/ Topic : " + jsonConfig.system.mqtt.topicUpdate )} )
  //client.on('message', insertDataSatellite );
  
  io.on("connect", (socket) => {
    console.log("WebSocket Connected");
    socket.on("refreshGnss", (evt) => {
      console.log("WebSocket refreshGnss received");
      getGpsPosition().then((parsedPosition) => {
        if (DEBUG)
          console.log("Position get " + JSON.stringify(parsedPosition));
        socket.emit("gnssData", parsedPosition);
        if (DEBUG_GPS) {console.log("GNSS Position transmitted by Socket.io");}
      });
    });
  });

  var ejs_index = "indexW3.ejs";
  /* Using sessions */

  app.use(session({ secret: "SerialCommunication" }));
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, "../react-socket-app/socket-client/build")));
  app
    .use(bodyParser.urlencoded({ extended: false }))
    /* --------------------------- Index print ------------------------ */
    /* ---------------------------------------------------------------- */
    .get("/", function (req, res) {
      // build directory, is the react app compiled
      res.sendFile(path.join(__dirname, "build", "index.html"));

      // DEBUG TOOLS
      // console.log('htttp request on / ');
      // res.render(ejs_index, {
      //     title : "Serial Com - Home",
      // });
    })

    /* --------------------------- Command?cmd_id --------------------- */
    /* ---------------------------------------------------------------- */
    .get("/command", function (req, res) {
      console.log(
        "Command requested : " + '{"order":"' + req.query.cmd_id + '"}'
      );
      port_TEENSY.write('{"order":"' + req.query.cmd_id + '"}', function (err) {
        if (err) {
          return console.log("Error : ", err.message);
        }
        console.log("command " + req.query.cmd_id + " sent");
        res.redirect("/");
      });
    })

    /* ------------------------- Command for SERVER -------------------- */
    /* ----------------------------------------------------------------- */
    .get("/server", function (req, res) {
      console.log(
        "Command server requested : " + '{"order":"' + req.query.cmd_id + '"}'
      );
      console.log("To see how to implement... ");
    })
    .post("/command", function (req, res) {
      console.log("Command requested with POST Method: " + req.query.cmd_id);

      if ((req.query.cmd_id = "update_interval")) {
        new_interval = parseFloat(req.body.interval_value);
        console.log("interval value : " + new_interval);
        writeToTeensy(port_TEENSY, "update_interval").then((data) => {
          res.send({ apiAnswer: data });
        });
      }
    })

    /* ---------------------- API Service for REACT APP -----------------*/
    /* ------------------------------------------------------------------*/
    .get("/api/syncAutoReplay", (req, res) => {
      console.log("API Sync requested with GET Method: " + req.query.command);
      var cmd = req.query.command;
      execService( "auto_replay", cmd )
    })

    .get("/api/hello", (req, res) => {
      console.log("API hello requested with GET Method: " + req.query.cmd_id);
      res.send({ express: "Hello From Express" });
    })

    // Return Teensy config to ReactApp in JSON Format
    .get("/api/getConfig", (req, res) => {
      console.log("API getConfig requested with GET Method: ");
      writeToTeensy(port_TEENSY, "getConfig").then((data) => {
        res.send({ apiAnswer: data });
      });
    })

    // Return Calibration config to ReactApp in JSON Format
    .get("/api/getCalibrationStatus", (req, res) => {
      console.log("API getCalibrationStatus requested with GET Method: ");
      writeToTeensy(port_TEENSY, "getCalibrationStatus").then((data) => {
        res.send({ apiAnswer: data });
      });
    })

    // Sending calibrate order to Teensy
    .get("/api/calibrate", (req, res) => {
      var sensorId = req.query.sensorId;
      console.log(
        "API calibrate requested with GET Method: " + req.query.sensorId
      );
      writeToTeensy(port_TEENSY, "calibrate", sensorId).then((data) => {
        res.send({ apiAnswer: data });
      });
    })

    // Init calibration ( sensorId ) will push 0 to currentCalibrationStep
    .get("/api/initCalibration", (req, res) => {
      var sensorId = req.query.sensorId;
      console.log(
        "API initCalibration requested with GET Method: " + req.query.sensorId
      );
      writeToTeensy(port_TEENSY, "initCalibration", sensorId).then((data) => {
        res.send({ apiAnswer: data });
      });
    })

    // **********************************
    // get SensorInformation ( sensorId )
    // **********************************
    .get("/api/sensorInfo", (req, res) => {
      var sensorId = req.query.sensorId;
      console.log(
        "API sensorInfo requested with GET Method: " + req.query.sensorId
      );
      writeToTeensy(port_TEENSY, "sensorInfo", sensorId).then((data) => {
        res.send({ apiAnswer: data });
      });
    })

    // **********************************
    // get Position
    // **********************************
    .get("/api/getPosition", function (req, res) {
      console.log("Command requested getPosition");
      getGpsPosition().then((parsedPosition) => {
        if (DEBUG)
          console.log("Position get " + JSON.stringify(parsedPosition));
        io.emit("gnssData", parsedPosition);
        console.log("GNSS Position transmitted by API getPosition ");
        res.send({ apiAnswer: parsedPosition });
      });
    })

    // ************************************
    // Start / Stop Acquisition Teensy 
    // ************************************
    .post("/api/command", (req, res) => {
      console.log(
        "API Command requested with POST Method: " + req.query.cmd_id
      );
      console.log(
        "Command requested : " + '{"order":"' + req.query.cmd_id + '"}'
      );

      port_TEENSY.write('{"order":"' + req.query.cmd_id + '"}', function (err) {
        if (err) {
          return console.log("Error : ", err.message);
        }
        console.log("command " + req.query.cmd_id + " sent");
        })
      console.log(req.body);
      res.send(`Server received your POST request. This : ${req.body.post}`);

      // Writing state to JSON File
      if ( req.query.cmd_id == "startLog") {
        updateJsonFile(configFile, (data) => {
          data.state.teensy_Acquisition = true;
          return data
        })
      }
      else if ( req.query.cmd_id == "stopLog") {
        updateJsonFile(configFile, (data) => {
          data.state.teensy_Acquisition = false;
          return data
        })
      }
      console.log("state.teensy_Acquisition saved " + req.query.cmd_id  )
    })
    

    /* REACT - UPDATE INTERVAL TO TEENSY  */
    /************************************ */
    .post("/api/updateLogInterval", (req, res) => {
      console.log("Interval requested : " + '{"interval":"' + req.query.interval + '"}');
      port_TEENSY.write(
        '{"order":"' + req.query.cmd_id 
        + '","value":"' + req.query.interval +
        '" }',
        function (err) {
          if (err) {
            return console.log("Error : ", err.message);
          }
          console.log("command " + req.query.cmd_id + " sent");
          //res.redirect('/');
        }
      );
      
      // Writing state to JSON File
      updateJsonFile(configFile, (data) => {
        data.state.interval = parseFloat(req.query.interval);
        return data
      })

      console.log(req.body);
      console.log("Interval : ", req.interval);
      res.send(`Server received your POST request. This : ${req.body.post}`);
    })

    /* ---------------------- Unknown Page -----------------------------*/
    /* -----------------------------------------------------------------*/
    .use(function (req, res, next) {
      //console.log('Invalid adress sent !! : '+res);
      res.redirect("/");
    });

    app.on("connect", function (req, res) {
      port_TEENSY.write("WebUser_init", function (err) {
        if (err) {
          return console.log("Error: ", err.message);
        }
        console.log("message login sent");
      });
      console.log("new user arrived");
    });
    
    /* STARTING HTTP SERVER
    /* -----------------------------------------------------------------*/
    console.log("-------------------------------");
    server.listen(8080, () => console.log("Web server listening on 8080"));

  if (DEBUG) {
    console.log(".............. CONFIG .............");
    console.log("MqttServer = " + mqttServer);
    console.log("MqttUser = " + mqttUser);
    console.log("MqttTopic Update = " + mqttTopicUpdate);
    console.log("Postgres = " + JSON.stringify(jsonConfig.system.postgres));
    console.log(
      "SerialPort TEENSY = " +
        JSON.stringify(jsonConfig.system.serialport_TEENSY)
    );
    console.log(
      "Baud TEENSY = " +
        JSON.stringify(jsonConfig.system.serialport_TEENSY.baud)
    );
    console.log(
      "SerialPort GPS = " + JSON.stringify(jsonConfig.system.serialport_GPS)
    );
    console.log(
      "Baud GPS = " + JSON.stringify(jsonConfig.system.serialport_GPS.baud)
    );
    console.log("GPS Modele = " + GPS_Modele);
  }

  /* ************************************ */
  /* LISTENING on SERIAL for TEENSY & GPS */
  /* ************************************ */
  port_TEENSY.on("error", function (err) {
    console.log("Error: ", err.message);
  });

  port_TEENSY.on("open", function () {
    console.log("Port Teensy opened");
    
    /* First order to teensy regarding the state */
    if (teensy_Acquisition) {   
      //Launching interval value
      new_interval = interval;
      console.log("Reloading config Teensy since last Reboot");
      writeToTeensy(port_TEENSY, "startLog");
      // TO DO ... SENDING Interval after the startlog ... without overloading Teensy port... 
    }
  });

  port_TEENSY.on("close", function () {
    console.log("Serial connection closed");
    open();
  });

  parser_TEENSY = port_TEENSY.pipe(new Readline({ delimiter: "\r\n" }));
  console.log("Listening on serial for TEENSY");

  /* ECOUTE LE PORT TEENSY */
  /* ********************* */
  parser_TEENSY.on("data", function (data) {
    console.log(data);
    if (data.includes('{"state":{"reported":{')) {
      console.log("Data sensors arrived");

      io.emit("data", data);
      insertData("serial", data, io);
    }
  });

  /* ************* */
  /* LISTENING GPS */
  /* ************* */
  const port_GPS = new SerialPort(serialport_GPS, { baudRate: baud_GPS });
  port_GPS.on("error", function (err) {
    console.log("Error: ", err.message);
  });

  parser_GPS = port_GPS.pipe(new Readline({ delimiter: "\r\n" }));
  //	getGpsPosition()
}

/***************************************
 * - function execService( service, cmd )
 * Exec the service with cmd ( start / stop )
 */
function execService( service, cmd ) {
  if (cmd == "start") {
    execCmd = "sudo service "+ service + " " + cmd;
    if (DEBUG) console.log("Exec command = " + execCmd);

    updateJsonFile(configFile, (data) => {
      data.state.data_sync = true;
      return data})
  } else {
    execCmd = "sudo service auto_replay stop";
    updateJsonFile(configFile, (data) => {
      data.state.data_sync = false;
      return data})
  }
  console.log("Exec Cmd => " + execCmd);

  exec(execCmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      res.send({ apiAnswer: error.message });
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      res.send({ apiAnswer: stderr });

      return;
    }

    console.log(`stdout:\n${stdout}`);
    res.send({ apiAnswer: stdout });
  });
}

/***************************************
- function insertData(topic, message)
Parse message & position and INSERT into Database */
async function insertData(topic, message, socket) {
  var parsedMessage = JSON.parse(message);

  if (DEBUG) console.log("***********************************");
  if (DEBUG) console.log(" Serial Data Message received : " + message);
  if (DEBUG) console.log("***********************************");

  getGpsPosition().then((parsedPosition) => {
    if (DEBUG) console.log("Position get " + JSON.stringify(parsedPosition));

    // 	/* INSERT to Postgres database */
    posgresDB = new TamataPostgres(jsonConfig.system.postgres);
    posgresDB.save(parsedMessage, parsedPosition, GPS_Modele, "Teensy");
    
    socket.emit("dataSaved", JSON.stringify(parsedPosition));
    
    // 	/* INSERT to influx database */
    // 	influx = new TamataInfluxDB( jsonConfig.system.influxDB );
    // 	influx.save( parsedMessage, parsedPosition );

    if (DEBUG) console.log("Inserted datas : " + JSON.stringify(parsedMessage));
    // EmLid GPS
    if (GPS_Modele == "emLead") {
      if (DEBUG)
        console.log(
          "At GPS position : LAT = " +
            JSON.stringify(parsedPosition.geo.latitude) +
            " LON=" +
            JSON.stringify(parsedPosition.geo.longitude)
        );
        //Drotek & standard Model
    } else if (GPS_Modele == "Drotek" || GPS_Modele == "standard") {
      if (DEBUG)
        console.log(
          "At GPS position : LAT = " +
            JSON.stringify(parsedPosition.geo.latitude) +
            " LON=" +
            JSON.stringify(parsedPosition.geo.longitude)
        );
    }
  });
}

/***************************************
- function insertDataSatellite(topic, message)
Parse message & position and INSERT into Database */
async function insertDataSatellite(topic, message, socket) {
  var parsedMessage = JSON.parse(message);

  if (DEBUG) console.log("***********************************");
  if (DEBUG) console.log(" Satellite Data Message received : " + message);
  if (DEBUG) console.log("***********************************");

  if ( satellite_Acquisition ) {
    console.log("Satellite message arrived will be saved")
    getGpsPosition().then((parsedPosition) => {
      if (DEBUG) console.log("Position get " + JSON.stringify(parsedPosition));
  
      // 	/* INSERT to Postgres database */
      posgresDB = new TamataPostgres(jsonConfig.system.postgres);
      posgresDB.save(parsedMessage, parsedPosition, GPS_Modele, "Satellite");
      
      // socket.emit("dataSaved", JSON.stringify(parsedPosition));
  
      if (DEBUG) console.log("Inserted datas : " + JSON.stringify(parsedMessage));
      // Classic GPS on USB
      if (GPS_Modele == "standard") {
        if (DEBUG)
          console.log(
            "At GPS position : LAT = " +
              JSON.stringify(parsedPosition.loc.dmm.latitude) +
              " LON=" +
              JSON.stringify(parsedPosition.loc.dmm.longitude)
          );
      } else if (GPS_Modele == "emLead") {
        // EmLid GPS
        if (DEBUG)
          console.log(
            "At GPS position : LAT = " +
              JSON.stringify(parsedPosition.geo.latitude) +
              " LON=" +
              JSON.stringify(parsedPosition.geo.longitude)
          );
      } else if (GPS_Modele == "Drotek") {
        //Drotek modele
        if (DEBUG)
          console.log(
            "At GPS position : LAT = " +
              JSON.stringify(parsedPosition.geo.latitude) +
              " LON=" +
              JSON.stringify(parsedPosition.geo.longitude)
          );
      }
    });

  }
  else {
    console.log("Satellite message arrived without saving")

  }


}


/***************************************
- function getGpsPosition()
Return a Promise with position type NMEA */
function getGpsPosition() {
  if (DEBUG_GPS) {
    console.log("getGpsPosition.... ");
  }
  console.log("GPS MODELE in config.json : " + GPS_Modele);
  return new Promise((resolve, reject) => {
    const gprmc = require("gprmc-parser");

    // DEBUG MODE Without GPS
    if (!GNSS_CONNECTED) {
      resolve(
        gprmc(
          "$GNRMC,133333.33,A,4609.31519,N,00108.72949,W,0.038,,180920,,,A,V*02"
        )
      );
    } else {
      parser_GPS.on("data", function (data) {
        if (DEBUG_GPS) {
          	//console.log(data)
        }

        // Using USB GPS classic
        if (GPS_Modele == "standard") {
          if (data.includes("$GPRMC")) {
            resolve( GNSS_Standard(data, GPS_Modele));
          }
        }

        // Using Drotek GPS
        else if (GPS_Modele == "Drotek") {
          if (data.includes("$GNRMC")) {
            resolve(GNSS_Drotek(data, GPS_Modele ));
          }
        }

        // Using emLead GPS
        else if (GPS_Modele == "emLead") {
          //console.log("Using emLead GPS");
          if (data.includes("$GNRMC")) {
            resolve(gprmc(data));
          }
        }
      });
    }
  });
}

/***************************************
- function writeToTeensy()
Return a Promise when Teensy answer */
async function writeToTeensy(port_TEENSY, messageType, sensorId) {
  if (DEBUG) {
    console.log("writeToTeensy.... ");
  }

  if (messageType == "sensorInfo") {
    port_TEENSY.write(
      '{"order":"sensorInfo", "sensorId":' + sensorId + "}",
      function (err) {
        if (err) {
          return console.log("Error : ", err.message);
        }
        if (DEBUG) {console.log("command sensorInfo for sensor " + sensorId + " sent");}
      }
    );

    return new Promise((resolve, reject) => {
      parser_TEENSY.on("data", function (data) {
        if (data.includes("sensorInfoAnswer")) {
          if (DEBUG) {console.log("Api answer sensorInfo received");}
          resolve(data);
        }
      });
    });
  }

  if (messageType == "getConfig") {
    port_TEENSY.write('{"order":"getConfig"}', function (err) {
      if (err) {
        return console.log("Error : ", err.message);
      }
      console.log("command getConfig sent");
    });
    return new Promise((resolve, reject) => {
      parser_TEENSY.on("data", function (data) {
        if (data.includes("Config_Teensy")) {
          if (DEBUG) {console.log("Api answer Config_Teensy received");}
          resolve(data);
        }
      });
    });
  }

  if (messageType == "getCalibrationStatus") {
    port_TEENSY.write('{"order":"calibrationStatus"}', function (err) {
      if (err) {
        return console.log("Error : ", err.message);
      }
      console.log("command calibrationStatus sent");
    });
    return new Promise((resolve, reject) => {
      parser_TEENSY.on("data", function (data) {
        if (data.includes("calibrationStatusAnswer")) {
          if (DEBUG) {console.log("Api answer calibrationStatusAnswer received");}
          resolve(data);
        }
      });
    });
  }

  if (messageType == "calibrate") {
    port_TEENSY.write(
      '{"order":"calibrate", "sensorId":' + sensorId + "}",
      function (err) {
        if (err) {
          return console.log("Error : ", err.message);
        }
        if (DEBUG) {console.log("command calibrate for sensor " + sensorId + " sent");}
        //res.redirect('/');
      }
    );

    return new Promise((resolve, reject) => {
      parser_TEENSY.on("data", function (data) {
        if (data.includes("calibrationAnswer")) {
          if (DEBUG){console.log("Api answer calibrationAnswer received");}
          resolve(data);
        }
      });
    });
  }

  if (messageType == "initCalibration") {
    port_TEENSY.write(
      '{"order":"initCalibration", "sensorId":' + sensorId + "}",
      function (err) {
        if (err) {
          return console.log("Error : ", err.message);
        }
        if (DEBUG) {console.log("command calibrate for sensor " + sensorId + " sent");}
      }
    );

    return new Promise((resolve, reject) => {
      parser_TEENSY.on("data", function (data) {
        if (data.includes("calibrationAnswer")) {
          if (DEBUG){console.log("Api answer calibrationAnswer received");}
          resolve(data);
        }
      });
    });
  }

  if (messageType == "update_interval") {
    console.log("Function WriteToTeensy / update_interval")
    port_TEENSY.write(
      '{"order":"update_interval","value":' + new_interval + "}",
      function (err) {
        if (err) {
          return console.log("Error : ", err.message);
        }
        if (DEBUG){console.log("command update_interval sent");}
      }
      );
      
      return new Promise((resolve, reject) => {
        parser_TEENSY.on("data", function (data) {
          if (data.includes("update_intervalAnswer")) {
            if (DEBUG){console.log("Api answer update_intervalAnswer received");}
            resolve(data);
          }
        });
      });
    }
    
    if (messageType == "startLog") {
      console.log("Function WriteToTeensy / startLog")
      port_TEENSY.write(
      '{"order":"startLog"}',
      function (err) {
        if (err) {
          return console.log("Error : ", err.message);
        }
        if (DEBUG){console.log("command startLog sent");}
      }
    );

    return new Promise((resolve, reject) => {
      parser_TEENSY.on("data", function (data) {
        if (data.includes("Start log received")) {
          if (DEBUG){console.log("Api answer Start log received");}
          resolve(data);
        }
      });
    });
  }
}
