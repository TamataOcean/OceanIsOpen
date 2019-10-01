/* Manage Script to 
- Listen to Mqtt Broker
- On message
- Analyse message Type ( Sensor, jetpack, ConfigSys, RtcConfig... )
- Request for save on Mongo
- Request for save on InFlux
- If Internet connected, send to Cloud Mqtt Broker
- Winston Logger to get last actions... ( Debug process )
*/
var DEBUG = true;

var jsonfile = require('jsonfile')
jsonfile.spaces = 4;

var mqtt = require('mqtt'); //includes mqtt server 
var moment = require('moment')

const TamataInfluxDB = require('./actions/components/TamataInflux')
const TamataPostgres = require('./actions/components/TamataPostgres')

var jsonConfig ;

/* Config JSON indent mode */
// configFile = "/home/pi/node/config/config.json";
var configFile = "config.json";
var mqttTopicIn="" 
var mqttTopicOut="" 
var mqttServer=""
var mqttAWS= ""

var influx;
var mongo;
//---------------------
//get config
//---------------------
jsonfile.readFile(configFile, function(err, data) {
		jsonConfig = data;

		if (err) throw err;
		mqttTopic = jsonConfig.system.mqttTopic ;
		mqttServer = jsonConfig.system.mqttServer;
		mqttUser = jsonConfig.system.mqttUser;
		mqttAWS = jsonConfig.system.mqttAWS;
		user = jsonConfig.system.user;
		begin();
});

function begin() {
	if (DEBUG) {
		console.log('Config');
		console.log('MqttServer ='+ jsonConfig.system.mqttServer);
		console.log('MqttUser ='+ jsonConfig.system.mqttUser);
		console.log('MqttTopic ='+ jsonConfig.system.mqttTopic);
		console.log('Influx Config ='+ JSON.stringify(jsonConfig.system.influxDB) ) ;
	}
   
	client = mqtt.connect('mqtt://'+ jsonConfig.system.mqttServer );
    client.subscribe( jsonConfig.system.mqttTopic ); 
    client.on('connect', () => { console.log('Mqtt connected to ' + jsonConfig.system.mqttServer + "/ Topic : " + jsonConfig.system.mqttTopic  )} )
    client.on('message', insertEvent );
}

function insertEvent(topic,message) {
	var parsedMessage = JSON.parse(message);
	var parsedPosition = "";

	if (DEBUG) console.log('************************');
	if (DEBUG) console.log('Mqtt Message received : ' + message );
	if (DEBUG) console.log('Insert Message : ' + JSON.stringify(parsedMessage) ) ;

	const promisePosition = getGpsPosition();
	
	/* Checking Message 
	const promiseMeasurement = new Promise( (resolve, reject) => {
		return resolve();
	}) */
	
	// Then Connect to Database
	const promiseMeasurement = promisePosition.then( getMeasurement(parsedMessage)
		.then(  (measurement) => {
			if (measurement !== "unManaged") {	
				if (DEBUG) console.log('Begin saving... measurement = ' + measurement );
				/* Measurement received --> Looking for gps position */
				// getGpsPosition();

				/* Uncomment to add datas to InfluxDB */
				/**************************************/
				//influx = new TamataInfluxDB( jsonConfig.system.influxDB, measurement );
				//influx.save( parsedMessage, measurement );

				/* INSERT to Postgres database */
				/*******************************/
				posgresDB = new TamataPostgres( jsonConfig.system.postgres, measurement );
				posgresDB.save( parsedMessage );
			}
			else {
				if (DEBUG) console.log('UnManaged measurement = ' + measurement );
			}
		})
	);

	promiseMeasurement.then( () => {
		if (DEBUG) console.log('Last actions... ');
	});

} // End Insert Event


/***************************************
- function getGpsPosition()
Return a Promise with position type NMEA
*/
function getGpsPosition() {
	return new Promise( (resolve, reject) => {
		if (DEBUG) console.log("Function getGpsPosition...");
		
		const SerialPort = require('serialport')
		const Readline = require('@serialport/parser-readline')
		const port = new SerialPort('/dev/cu.SLAB_USBtoUART', { baudRate: 4800 })
		const nmea = require('node-nmea')

		// Open errors will be emitted as an error event
		port.on('error', function(err) {
  			console.log('Error: ', err.message)
		})

		const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
		parser.on('data', function (data) {
			if (data.includes("$GPRMC")) {
				console.log(nmea.parse(data));
				parsedPosition = nmea.parse(data);
				return resolve(parsedPosition);
			}
			// return resolve();
		})
		// return resolve();
	}).then ((position) => {
		console.log("End function getGpsPosition..." + position);
	})
}

/*********************************************
- function getMeasurement(parsedMessage)
Return a Promise with measurement type 
sensor, jetpack, coolboardconfig, rtcconfig... 
*/
function getMeasurement(parsedMessage) {
	return new Promise(  (resolve, reject) => {
		return resolve();
	}).then( () => {
		if (DEBUG) {console.log('Function getMeasurement start... ');}
		var measurement;
		if ( parsedMessage.state.reported.user === mqttUser ) { 
			measurement = "sensor";
			return measurement;
		} 
		else {
			return "unManaged";
		}
	});
}
