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
var serialport;
var baud;
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

		begin();
});

/***************************************
- function begin())
- Listening on MQTT 
 */
function begin() {
	if (DEBUG) {
		console.log('.............. CONFIG .............');
		console.log('MqttServer ='+ mqttServer);
		console.log('MqttUser ='+ mqttUser);
		console.log('MqttTopic ='+ mqttTopic);
	}

	/* LISTENING on MQTT Upd*/
	client = mqtt.connect('mqtt://'+ jsonConfig.system.mqttServer );
    client.subscribe( jsonConfig.system.mqttTopic ); 
    client.on('connect', () => { console.log('Mqtt connected to ' + jsonConfig.system.mqttServer + "/ Topic : " + jsonConfig.system.mqttTopic  )} )
    client.on('message', insertEvent );
   	
	/* client.on('message', insertData );
	client.on('connect',function() {
		client.publish(mqttTopic,"UpdateNowPH")
		console.log("Desired requested on" + mqttTopic +" : "+"ordre 66 activé" )
		client.end()
		})
		*/
}  
	/* CHECK MESSAGE*/
function insertEvent(topic,message) {

	console.log("Function insertevent begin");
	var parsedMessage = JSON.parse(message);

	if (DEBUG) console.log('************************');
	if (DEBUG) console.log('Mqtt Message received : ');
	if (DEBUG) console.log('Insert Message : ' + message ) ;

	/* Checking Message 
	const promiseMeasurement = new Promise( (resolve, reject) => {
		return resolve();
	}) */
}
