/* Manage Script to 
- Listen the Teensy'Serial port
- On message request to get GPS Possition
- Then save on InFlux
*/
var DEBUG = true;

var jsonfile = require('jsonfile')
jsonfile.spaces = 4;

var mqtt = require('mqtt'); //includes mqtt server 
const TamataPostgres = require('./actions/components/TamataPostgres')
const TamataInfluxDB = require('./actions/components/TamataInflux')

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
		console.log('MqttServer ='+ mqttServer);
		console.log('MqttUser ='+ mqttUser);
		console.log('MqttTopic ='+ mqttTopic);
		console.log('Postgres ='+ JSON.stringify(jsonConfig.system.postgres) ) ;
		console.log('SerialPort TEENSY ='+ JSON.stringify(jsonConfig.system.serialport_TEENSY) ) ;
		console.log('Baud TEENSY ='+ JSON.stringify(jsonConfig.system.baud_TEENSY) ) ;
		console.log('SerialPort GPS ='+ JSON.stringify(jsonConfig.system.serialport_GPS) ) ;
		console.log('Baud GPS ='+ JSON.stringify(jsonConfig.system.baud_GPS) ) ;
	}

    /* LISTENING on SERIAL for TEENSY & GPS */
    const SerialPort = require('serialport')
	const Readline = require('@serialport/parser-readline')
	
	/* LISTENING TEENSY */
	const port_TEENSY = new SerialPort( serialport_TEENSY, { baudRate: baud_TEENSY })
	port_TEENSY.on('error', function(err) {
		console.log('Error: ', err.message)
	})

	port_TEENSY.on('open', function () {
        port_TEENSY.write('Init_connection_from_Raspi', function(err) {
        if (err) {
        return console.log('Error: ', err.message);
        }
        console.log('message init sent');
        });
	})
	
	parser_TEENSY = port_TEENSY.pipe(new Readline({ delimiter: '\r\n' }))
	console.log("Listening on serial for TEENSY")

	parser_TEENSY.on('data', function(data) {
		console.log(data)
		if (data.includes("{\"state\":{\"reported\":{")) {
			console.log('Data sensors arrived')
			insertData('serial', data)
		}
	})

	/* LISTENING GPS */
	const port_GPS = new SerialPort( serialport_GPS, { baudRate: baud_GPS })
	port_GPS.on('error', function(err) {
			console.log('Error: ', err.message)
	})

	parser_GPS = port_GPS.pipe(new Readline({ delimiter: '\r\n' }))

	// **************************** 
    /* EXPRESS.JS -------------- */  
    // **************************** 
    var express = require('express');
    var session = require('cookie-session'); // Charge le middleware de sessions
    var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
    var urlencodedParser = bodyParser.urlencoded({ extended: false });
    var app = express();
    var ejs_index = 'indexW3.ejs';
    /* Using sessions */
    app.use(session({secret: 'SerialCommunication'}))
    /* --------------------------- Index print ------------------------ */
    /* ---------------------------------------------------------------- */
    .get('/', function(req, res) {
        // console.log('htttp request on / ');
        res.render(ejs_index, {
            title : "Serial Com - Home",
        });
        
    })

    /* --------------------------- Command?cmd_id --------------------- */
    /* ---------------------------------------------------------------- */
    .get('/command', function(req, res) {
        console.log('Command requested : '+ req.query.cmd_id);
        port_TEENSY.write(req.query.cmd_id , function(err){
            if (err) {
                return console.log('Error : ', err.message);
            }
            console.log('command ' + req.query.cmd_id + 'sent');
            res.redirect('/');
        })
    })

    /* ---------------------- Unknown Page -----------------------------*/
    /* -----------------------------------------------------------------*/
    .use(function(req, res, next){
        console.log('Invalid adress sent !! : '+res);
        res.redirect('/');
    });
    
    /* -----------------------------------------------------------------*/
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
    app.listen(8080);
    console.log('WEB SERVER started on port 8080');
    console.log('-------------------------------');

}

/***************************************
- function insertData(topic, message)
Parse message & position and INSERT into Database */
async function insertData(topic,message) {
	var parsedMessage = JSON.parse(message);

	if (DEBUG) console.log('***********************************');
	if (DEBUG) console.log('Serial Data Message received : ' + message );

	getGpsPosition().then( (parsedPosition) => {
		/* INSERT to Postgres database */
		console.log("Position : " + JSON.stringify( parsedPosition )) ;
		posgresDB = new TamataPostgres( jsonConfig.system.postgres );
		posgresDB.save( parsedMessage, parsedPosition );
		
		/* INSERT to influx database */
		influx = new TamataInfluxDB( jsonConfig.system.influxDB );
		influx.save( parsedMessage, parsedPosition );

		if (DEBUG) console.log('Inserted datas : ' + JSON.stringify(parsedMessage) ) ;
		if (DEBUG) console.log('At GPS position : LAT = ' + JSON.stringify(parsedPosition.geo.latitude) + ' LON=' + JSON.stringify(parsedPosition.geo.longitude) ) ;
	})
} 

/***************************************
- function getGpsPosition()
Return a Promise with position type NMEA */
function getGpsPosition() {
	console.log("getGpsPosition.... ")
	return new Promise( (resolve, reject) => {
		const nmea = require('node-nmea')
		const gprmc = require('gprmc-parser')

		parser_GPS.on('data', function (data) {
			console.log("Data from GPS")
			console.log(data)
			
			// Using emLead GPS
			//if (data.includes("$GNRMC")) {
			
			// Using USB GPS classic
			if (data.includes("$GPRMC")) {
				//console.log(nmea.parse(data))
				// Using USB GPS classic	
				resolve(nmea.parse(data));
				
				// Using emLid GPS 
				// resolve(gprmc(data));
			}
		})
	})
}

