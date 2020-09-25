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

var jsonfile = require('jsonfile')
jsonfile.spaces = 4;

var mqtt = require('mqtt'); //includes mqtt server 
const TamataPostgres = require('./actions/components/TamataPostgres')
const TamataInfluxDB = require('./actions/components/TamataInflux')
const GNSS_Drotek = require('./actions/components/GNSS_Drotek')

var configFile = "config.json";
var jsonConfig ;
var mqttTopicIn="" 
var mqttTopicOut="" 
var mqttServer=""
var mqttAWS= ""
var influx;
var mongo;
var serialport_GPS;
var serialport_TEENSY;
var baud_TEENSY;
var baud_GPS;
let parser_GPS;
let parser_TEENSY;
var GPS_Modele;

var apiAnswer = "";
//---------------------
// INITIALISATION
//---------------------
jsonfile.readFile(configFile, function(err, data) {
		jsonConfig = data;

		if (err) throw err;
		mqttTopic = data.system.mqttTopic ;
		mqttServer = data.system.mqttServer;
		mqttUser = data.system.mqttUser;
		mqttAWS = data.system.mqttAWS;
		user = data.system.user;
		serialport_TEENSY = data.system.serialport_TEENSY.port;
		baud_TEENSY = data.system.serialport_TEENSY.baud;
		serialport_GPS = data.system.serialport_GPS.port;
		baud_GPS = data.system.serialport_GPS.baud;
		GPS_Modele = data.system.serialport_GPS.modele;
		begin();
});

/***************************************
- function begin())
- Listening on Serial for TEENSY & GPS
- When Data message arrive, => insertData()
 */
function begin() {
	if (DEBUG) {
		console.log('.............. CONFIG .............');
		console.log('MqttServer = '+ mqttServer);
		console.log('MqttUser = '+ mqttUser);
		console.log('MqttTopic = '+ mqttTopic);
		console.log('Postgres = '+ JSON.stringify(jsonConfig.system.postgres) ) ;
		console.log('SerialPort TEENSY = '+ JSON.stringify(jsonConfig.system.serialport_TEENSY) ) ;
		console.log('Baud TEENSY = '+ JSON.stringify(jsonConfig.system.serialport_TEENSY.baud) ) ;
		console.log('SerialPort GPS = '+ JSON.stringify(jsonConfig.system.serialport_GPS) ) ;
		console.log('Baud GPS = '+ JSON.stringify(jsonConfig.system.serialport_GPS.baud) ) ;
		console.log('GPS Modele = '+ GPS_Modele ) ;
	}

	/* ************************************ */
	/* LISTENING on SERIAL for TEENSY & GPS */
	/* ************************************ */
    const SerialPort = require('serialport')
	const Readline = require('@serialport/parser-readline')
	
	/* LISTENING TEENSY */
	/* **************** */
	const port_TEENSY = new SerialPort( serialport_TEENSY, { baudRate: baud_TEENSY })
	port_TEENSY.on('error', function(err) {
		console.log('Error: ', err.message)
	})
	
	port_TEENSY.on('open', function () {
		port_TEENSY.write('{\"order\":\"Init_connection_from_Raspi\"}', function(err) {
			if (err) {
				return console.log('Error: ', err.message);
        	}
        	console.log('message init sent');
        });
	})
	
	port_TEENSY.on('close', function () {
		console.log("Serial connection closed");
		open();
	})
	
	parser_TEENSY = port_TEENSY.pipe(new Readline({ delimiter: '\r\n' }))
	console.log("Listening on serial for TEENSY")
	
	/* ECOUTE LE PORT TEENSY */
	/* ********************* */
	parser_TEENSY.on('data', function(data) {
		console.log(data)
		if (data.includes("{\"state\":{\"reported\":{")) {
			console.log('Data sensors arrived')
			insertData('serial', data)
		} 
	})
	
	/* ************* */
	/* LISTENING GPS */
	/* ************* */
	const port_GPS = new SerialPort( serialport_GPS, { baudRate: baud_GPS })
	port_GPS.on('error', function(err) {
			console.log('Error: ', err.message)
	})

	parser_GPS = port_GPS.pipe(new Readline({ delimiter: '\r\n' }))
	getGpsPosition()

	// **************************** 
    /* EXPRESS.JS -------------- */  
    // **************************** 
    var express = require('express');
    var session = require('cookie-session'); // Charge le middleware de sessions
    var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
    var urlencodedParser = bodyParser.urlencoded({ extended: false });
	const path = require('path');
	var app = express();
    var ejs_index = 'indexW3.ejs';
	/* Using sessions */

	app.use(session({secret: 'SerialCommunication'}));
	app.use(bodyParser.json());
	app.use(express.static(path.join(__dirname, 'build')));
	app.use(bodyParser.urlencoded({extended: false}))
    /* --------------------------- Index print ------------------------ */
    /* ---------------------------------------------------------------- */
    .get('/', function(req, res) {
		// build directory, is the react app compiled
		res.sendFile(path.join(__dirname, 'build', 'index.html'));

		// TO DELETE
		// console.log('htttp request on / ');
        // res.render(ejs_index, {
        //     title : "Serial Com - Home",
        // });
    })

    /* --------------------------- Command?cmd_id --------------------- */
    /* ---------------------------------------------------------------- */
    .get('/command', function(req, res) {
        console.log('Command requested : '+ "{\"order\":\"" + req.query.cmd_id + "\"}" );
        port_TEENSY.write("{\"order\":\"" + req.query.cmd_id + "\"}" , function(err){
			if (err) {
				return console.log('Error : ', err.message);
            }
            console.log('command ' + req.query.cmd_id + ' sent');
            res.redirect('/');
        })
	})
	
	/* ------------------------- Command for SERVER -------------------- */
	/* ----------------------------------------------------------------- */
	.get('/server', function(req, res) {
        console.log('Command server requested : '+ "{\"order\":\"" + req.query.cmd_id + "\"}" );
        console.log('To see how to implement... ')
    })
	.post('/command', function(req, res) {
		console.log('Command requested with POST Method: '+ req.query.cmd_id);
		
		if (req.query.cmd_id = "update_interval") {
			var new_interval = parseFloat(req.body.interval_value);
			console.log('interval value : '+ new_interval);
			writeToTeensy(port_TEENSY, "update_interval" ).then((data) => {
				res.send({ apiAnswer:data})
			})
		}
	})

	/* ---------------------- API Service for REACT APP -----------------*/
	/* ------------------------------------------------------------------*/
	.get('/api/hello', (req, res) => {
		console.log('API hello requested with GET Method: ' + req.query.cmd_id);
		res.send({ express: 'Hello From Express' });
	})
	
	// Return Teensy config to ReactApp in JSON Format
	.get('/api/getConfig', (req, res) => {
		console.log('API getConfig requested with GET Method: ');
		writeToTeensy(port_TEENSY, "getConfig" ).then((data) => {
			res.send({ apiAnswer:data})
		})
	})
	
	// Return Calibration config to ReactApp in JSON Format
	.get('/api/getCalibrationStatus', (req, res) => {
		console.log('API getCalibrationStatus requested with GET Method: ');
		writeToTeensy(port_TEENSY, "getCalibrationStatus" ).then((data) => {
			res.send({ apiAnswer:data})
		})
	})
	
	// Sending calibrate order to Teensy
	.get('/api/calibrate', (req, res) => {
		var sensorId = req.query.sensorId
		console.log('API calibrate requested with GET Method: ' + req.query.sensorId);
		writeToTeensy(port_TEENSY, "calibrate", sensorId).then((data)=> {
			res.send({ apiAnswer: data })
		})
	})

	// Init calibration ( sensorId ) will push 0 to currentCalibrationStep
	.get('/api/initCalibration', (req, res) => {
		var sensorId = req.query.sensorId
		console.log('API initCalibration requested with GET Method: ' + req.query.sensorId);
		writeToTeensy(port_TEENSY, "initCalibration", sensorId).then((data)=> {
			res.send({ apiAnswer: data })
		})
	})

	// **********************************
	// get SensorInformation ( sensorId )
	// **********************************
	.get('/api/sensorInfo', (req, res) => {
		var sensorId = req.query.sensorId
		console.log('API sensorInfo requested with GET Method: ' + req.query.sensorId);
		writeToTeensy(port_TEENSY, "sensorInfo", sensorId).then( (data) => {
			res.send({ apiAnswer: data })
		})
	})

	.post('/api/command', ( req, res ) => {
		console.log('API Command requested with POST Method: ' + req.query.cmd_id);
		console.log('Command requested : '+ "{\"order\":\"" + req.query.cmd_id + "\"}" );
		console.log('Interval requested : '+ "{\"interval\":\"" + req.query.interval + "\"}" );
		
       	port_TEENSY.write("{\"order\":\"" + req.query.cmd_id + "\"}" , function(err){
			if (err) {
				return console.log('Error : ', err.message);
       	   	}
          	console.log('command ' + req.query.cmd_id + ' sent');
           	//res.redirect('/');
		   })
		   
		console.log(req.body);
		console.log("Interval : ", req.interval);
		res.send(`Server received your POST request. This : ${req.body.post}`);
	})

	.post('/api/updateLogInterval', ( req, res ) => {
		console.log('Interval requested : '+ "{\"interval\":\"" + req.query.interval + "\"}" );
		
		// writeToTeensy(port_TEENSY, "update_interval", req.query.interval).then( (data) => {
		// 	res.send({ apiAnswer: data })
		// })

       	port_TEENSY.write("{\"order\":\"" + req.query.cmd_id + "\",\"value\":\""+ req.query.interval + "\" }" , function(err){
			if (err) {
				return console.log('Error : ', err.message);
       	   	}
          	console.log('command ' + req.query.cmd_id + ' sent');
           	//res.redirect('/');
		   })
		   
		console.log(req.body);
		console.log("Interval : ", req.interval);
		res.send(`Server received your POST request. This : ${req.body.post}`);
	})

	
	
    /* ---------------------- Unknown Page -----------------------------*/
    /* -----------------------------------------------------------------*/
    .use(function(req, res, next){
        //console.log('Invalid adress sent !! : '+res);
        res.redirect('/');
    });
    
    /* STARTING HTTP SERVER
    /* -----------------------------------------------------------------*/
    app.on('connect',function(req,res) {
        port_TEENSY.write('WebUser_init', function(err) {
            if (err) {
            return console.log('Error: ', err.message);
            }
            console.log('message login sent');
        });
        console.log('new user arrived');
    });
    console.log('-------------------------------');
    app.listen(8080, () => console.log('Web server listening on 8080'));
}

/***************************************
- function insertData(topic, message)
Parse message & position and INSERT into Database */
async function insertData(topic,message) {
	var parsedMessage = JSON.parse(message);

	if (DEBUG) console.log('***********************************');
	if (DEBUG) console.log(' Serial Data Message received : ' + message );
	if (DEBUG) console.log('***********************************');
	
	getGpsPosition().then( (parsedPosition) => {
		if (DEBUG) console.log("Position get " + JSON.stringify( parsedPosition )) ;

	// 	/* INSERT to Postgres database */
	 	posgresDB = new TamataPostgres( jsonConfig.system.postgres );
	 	posgresDB.save( parsedMessage, parsedPosition, GPS_Modele );
	// 	/* INSERT to influx database */
	// 	influx = new TamataInfluxDB( jsonConfig.system.influxDB );
	// 	influx.save( parsedMessage, parsedPosition );

		if (DEBUG) console.log('Inserted datas : ' + JSON.stringify(parsedMessage) ) ;
		// Classic GPS on USB
		if( GPS_Modele == "standard" ) {
			if (DEBUG) console.log('At GPS position : LAT = ' + JSON.stringify(parsedPosition.loc.dmm.latitude) + ' LON=' + JSON.stringify(parsedPosition.loc.dmm.longitude) ) ;
		}
		else if ( GPS_Modele == "emLead") {
			// EmLid GPS 
			if (DEBUG) console.log('At GPS position : LAT = ' + JSON.stringify(parsedPosition.geo.latitude) + ' LON=' + JSON.stringify(parsedPosition.geo.longitude) ) ;
		}
		else if ( GPS_Modele == "Drotek" ) {
			//Drotek modele
			if (DEBUG) console.log('At GPS position : LAT = ' + JSON.stringify(parsedPosition.geo.latitude) + ' LON=' + JSON.stringify(parsedPosition.geo.longitude) ) ;
		}

	})
} 

/***************************************
- function getGpsPosition()
Return a Promise with position type NMEA */
function getGpsPosition() {
	if (DEBUG_GPS) {console.log("getGpsPosition.... ")}
	console.log("GPS MODELE in config.json : " + GPS_Modele);
	return new Promise( (resolve, reject) => {
		const nmea = require('node-nmea')
		const gprmc = require('gprmc-parser')
		
		parser_GPS.on('data', function (data) {
			if (DEBUG_GPS) {
			//	console.log(data)
			}

			// Using USB GPS classic
			if ( GPS_Modele == "standard" ) {
				if (data.includes("$GPRMC")) {
					//console.log("Using standard GPS : "+ GPS_Modele);
					resolve(nmea.parse(data));
				}
			}
			// Using emLead GPS
			else if ( GPS_Modele == "emLead") {
				//console.log("Using emLead GPS");
				if (data.includes("$GNRMC")) {
				resolve(gprmc(data)); 
				}
			}

			// Using Drotek GPS
			else if ( GPS_Modele == "Drotek") {
				if (data.includes("$GNRMC")) {
					// resolve(nmea.parse(data));
					resolve(GNSS_Drotek(data)); 
				}
			}
		})
	})
}

/***************************************
- function writeToTeensy()
Return a Promise when Teensy answer */
async function writeToTeensy(port_TEENSY, messageType, sensorId) {
	if (DEBUG_GPS) {console.log("writeToTeensy.... ")}
	
	if (messageType == "sensorInfo") {
		port_TEENSY.write("{\"order\":\"sensorInfo\", \"sensorId\":"+ sensorId +"}" , function(err){
			if (err) {
				return console.log('Error : ', err.message);
			}
			console.log('command sensorInfo for sensor '+ sensorId +' sent');
		})

		return new Promise( (resolve, reject) => {
			parser_TEENSY.on('data', function (data) {
				if (data.includes("sensorInfoAnswer")) {
					console.log('Api answer sensorInfo received')
					resolve(data);
				}	
			})
		})
	}

	if (messageType == "getConfig") {
		port_TEENSY.write("{\"order\":\"getConfig\"}" , function(err){
			if (err) {
					return console.log('Error : ', err.message);
				}
				console.log('command getConfig sent');
		})
		return new Promise( (resolve, reject) => {
			parser_TEENSY.on('data', function (data) {
				if (data.includes("Config_Teensy")) {
					console.log('Api answer Config_Teensy received')
					resolve(data);
				}	
			})
		})
	}

	if (messageType == "getCalibrationStatus") {
		port_TEENSY.write("{\"order\":\"calibrationStatus\"}" , function(err){
			if (err) {
				return console.log('Error : ', err.message);
			}
			console.log('command calibrationStatus sent');
		})
		return new Promise( (resolve, reject) => {
			parser_TEENSY.on('data', function (data) {
				if (data.includes("calibrationStatusAnswer")) {
					console.log('Api answer calibrationStatusAnswer received')
					resolve(data);
				}	
			})
		})
	}

	if (messageType == "calibrate") {
		port_TEENSY.write("{\"order\":\"calibrate\", \"sensorId\":"+ sensorId +"}" , function(err){
			if (err) {
				return console.log('Error : ', err.message);
				  }
			  console.log('command calibrate for sensor '+ sensorId +' sent');
			   //res.redirect('/');
		})

		return new Promise( (resolve, reject) => {
			parser_TEENSY.on('data', function (data) {
				if (data.includes("calibrationAnswer")) {
					console.log('Api answer calibrationAnswer received')
					resolve(data);
				}	
			})
		})
	}

	if (messageType == "initCalibration") {
		port_TEENSY.write("{\"order\":\"initCalibration\", \"sensorId\":"+ sensorId +"}" , function(err){
			if (err) {
				return console.log('Error : ', err.message);
				  }
			  console.log('command calibrate for sensor '+ sensorId +' sent');
		})

		return new Promise( (resolve, reject) => {
			parser_TEENSY.on('data', function (data) {
				if (data.includes("calibrationAnswer")) {
					console.log('Api answer calibrationAnswer received')
					resolve(data);
				}	
			})
		})
	}

	if (messageType == "update_interval") {
		port_TEENSY.write("{\"order\":\"" + sensorId + "\",\"value\":" + new_interval + "}" , function(err){
			if (err) {
				return console.log('Error : ', err.message);
			}
			console.log('command update_interval sent');
		})

		return new Promise( (resolve, reject) => {
			parser_TEENSY.on('data', function (data) {
				if (data.includes("update_intervalAnswer")) {
					console.log('Api answer update_intervalAnswer received')
					resolve(data);
				}	
			})
		})
	}

}