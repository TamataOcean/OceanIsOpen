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
const TamataPostgres = require('./actions/components/TamataPostgres')

var configFile = "config.json";
var jsonConfig ;
var mqttTopicIn="" 
var mqttTopicOut="" 
var mqttServer=""
var mqttAWS= ""
var influx;
var mongo;

let parser;
//---------------------
//get config
//---------------------
jsonfile.readFile(configFile, function(err, data) {
		jsonConfig = data;

		if (err) throw err;
		mqttTopic = data.system.mqttTopic ;
		mqttServer = data.system.mqttServer;
		mqttUser = data.system.mqttUser;
		mqttAWS = data.system.mqttAWS;
		user = data.system.user;
		begin();
});

/***************************************
- function begin())
- Listening on MQTT & Serial 
- When MQTT message arrive, => insertData()
 */
function begin() {
	if (DEBUG) {
		console.log('.............. BEGIN .............');
		console.log('MqttServer ='+ mqttServer);
		console.log('MqttUser ='+ mqttUser);
		console.log('MqttTopic ='+ mqttTopic);
		console.log('Influx Config ='+ JSON.stringify(jsonConfig.system.influxDB) ) ;
	}
   	
   	/* LISTENING on MQTT */
	client = mqtt.connect('mqtt://'+ jsonConfig.system.mqttServer );
    client.subscribe( jsonConfig.system.mqttTopic ); 
    client.on('connect', () => { console.log('Mqtt connected to ' + jsonConfig.system.mqttServer + "/ Topic : " + jsonConfig.system.mqttTopic  )} )
    client.on('message', insertData );

    /* LISTENING on SERIAL */
    const SerialPort = require('serialport')
	const Readline = require('@serialport/parser-readline')
	const port = new SerialPort('/dev/cu.SLAB_USBtoUART', { baudRate: 4800 })
	port.on('error', function(err) {
			console.log('Error: ', err.message)
	})

	parser = port.pipe(new Readline({ delimiter: '\r\n' }))
}

/***************************************
- function insertData(topic, message)
Parse message & position and INSERT into Database */
async function insertData(topic,message) {
	var parsedMessage = JSON.parse(message);

	if (DEBUG) console.log('***********************************');
	if (DEBUG) console.log('Mqtt Message received : ' + message );

	getGpsPosition().then( (parsedPosition) => {
		/* INSERT to Postgres database */
		posgresDB = new TamataPostgres( jsonConfig.system.postgres );
		posgresDB.save( parsedMessage, parsedPosition );
		if (DEBUG) console.log('Inserted datas : ' + JSON.stringify(parsedMessage) ) ;
		if (DEBUG) console.log('At GPS position : LAT = ' + JSON.stringify(parsedPosition.geo.latitude) + ' LON=' + JSON.stringify(parsedPosition.geo.longitude) ) ;
	})
} 

/***************************************
- function getGpsPosition()
Return a Promise with position type NMEA */
function getGpsPosition() {
	return new Promise( (resolve, reject) => {
		const nmea = require('node-nmea')
		const gprmc = require('gprmc-parser')

		parser.on('data', function (data) {
			if (data.includes("$GPRMC")) {
				
				//resolve(nmea.parse(data));
				resolve(gprmc(data));
			}
		})
	})
}

