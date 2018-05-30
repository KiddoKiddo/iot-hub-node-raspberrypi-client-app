/*
*
*/
'use strict';


const fs = require('fs');
const path = require('path');

const wpi = require('wiring-pi');

const Client = require('azure-iot-device').Client;
const ConnectionString = require('azure-iot-device').ConnectionString;
const Message = require('azure-iot-device').Message;
const Protocol = require('azure-iot-device-mqtt').Mqtt;

const bi = require('az-iot-bi');

const MessageProcessor = require('./messageProcessor.js');

var sendingMessage = false;//true
var messageId = 0;
var client, config, messageProcessor;



//For Code Flow control--start
var dateTime = require('node-datetime');
var sleep = require('sleep');

var JobIDString = "YMDHMS-000";
var BlockFlag = false;

var FlagForDataSend = false;

var PressureAlertFlag = false;
var FlowAlertFlag = false;

var OneTimeFlag = true;

// button is attached to pin 17, led to 14
var GPIO = require('onoff').Gpio,
	ClientLed = new GPIO(14, 'out'),
  DataSendLed = new GPIO(15,'out'),
	StartSendButton = new GPIO(17, 'in', 'falling'),
  PressureAlarmButton = new GPIO(18, 'in', 'falling'),
  FlowAlarmButton = new GPIO(22, 'in', 'falling');
var JobidRunningNumber = 0;


// define the callback function
function LightforFlag() {
   if(FlagForDataSend){
		 ClientLed.writeSync(0);
	 }else{
		 ClientLed.writeSync(1);
	 }
}

// define the callback function
function ReadyToSendData() {


 if (ClientLed.readSync() === 0) { //check the pin state, if the state is 0 (or off)
	 ClientLed.writeSync(1); //set pin state to 1 (turn LED on)
 } else {
	 ClientLed.writeSync(0); //set pin state to 0 (turn LED off)
 }

	setTimeout(ReadyToSendData, 500);


}





function blinkLED() {

  // Light up LED for 500 ms
  DataSendLed.writeSync(1);
  setTimeout(function () {
    DataSendLed.writeSync(0);
  }, 500);
}


// define the callback function
function PressureAlert() {

	if(PressureAlertFlag){
		PressureAlertFlag = false;
	} else{
		PressureAlertFlag = true;
	}

}

// define the callback function
function FlowAlert() {

	if(FlowAlertFlag){
		FlowAlertFlag = false;
	} else{
		FlowAlertFlag = true;
	}


}

// define the callback function
function ToggleFlagForDataSend() {
   if(FlagForDataSend){
		 FlagForDataSend = false;
	 } else{
		 FlagForDataSend = true;
		 UpdateJobID();
	 }

	 console.log('Sending message to Trigger... ');
	 //Change flag and trigger here again.
	 sendMessage();//This is the key This one call back when you press***---***



}

// define the callback function
function UpdateJobID() {
	var dt1 = dateTime.create();
	var CurrentDate = dt1.format('Ymd'); //Current Timestamp--
	JobidRunningNumber++;
	JobIDString = CurrentDate + "-" + JobidRunningNumber
  //console.log('JobidRunningNumber: ' + JobidRunningNumber);
	//console.log('JobIDString: ' + JobIDString);

}

// pass the callback function to the as the first argument to watch()
StartSendButton.watch(ToggleFlagForDataSend);
PressureAlarmButton.watch(PressureAlert);
FlowAlarmButton.watch(FlowAlert);

//For Code Flow control--stop



function sendMessage() {
  //if (!sendingMessage) { return; }



 //Send message Here
  messageId++;

  messageProcessor.getMessage(messageId,JobIDString,PressureAlertFlag,FlowAlertFlag,(content, PressureAlert) => {
    var message = new Message(content);
    message.properties.add('PressureAlert', PressureAlert ? 'true' : 'false');
    console.log('Sending message: ' + content);
    client.sendEvent(message, (err) => {
      if (err) {
        console.error('Failed to send message to Azure IoT Hub');
      } else {
        blinkLED();

        console.log('Message sent to Azure IoT Hub');
      }
      //To show status of the Data send flag. Light-ON>> Data Send Flag Not set /Light-OFF>> Data Send Flag set
      //LightforFlag();


			if(FlagForDataSend){
				//Send message trigger repeactively here
				setTimeout(sendMessage, config.interval);
			}else{


      //To show client is ready
      //Call only once , else call loop in the loop and ugly
			if(OneTimeFlag){
				ReadyToSendData();
			}
			OneTimeFlag= false;



			}




    });
  });
}

function onStart(request, response) {
  console.log('Try to invoke method start(' + request.payload || '' + ')');
  sendingMessage = true;

  response.send(200, 'Successully start sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
    }
  });
}

function onStop(request, response) {
  console.log('Try to invoke method stop(' + request.payload || '' + ')')
  sendingMessage = false;

  response.send(200, 'Successully stop sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
    }
  });
}

function receiveMessageCallback(msg) {
  blinkLED();
  var message = msg.getData().toString('utf-8');
  client.complete(msg, () => {
    console.log('Receive message: ' + message);
  });
}



function initClient(connectionStringParam, credentialPath) {
  var connectionString = ConnectionString.parse(connectionStringParam);
  var deviceId = connectionString.DeviceId;

  // fromConnectionString must specify a transport constructor, coming from any transport package.
  client = Client.fromConnectionString(connectionStringParam, Protocol);

  // Configure the client to use X509 authentication if required by the connection string.
  if (connectionString.x509) {
    // Read X.509 certificate and private key.
    // These files should be in the current folder and use the following naming convention:
    // [device name]-cert.pem and [device name]-key.pem, example: myraspberrypi-cert.pem
    var connectionOptions = {
      cert: fs.readFileSync(path.join(credentialPath, deviceId + '-cert.pem')).toString(),
      key: fs.readFileSync(path.join(credentialPath, deviceId + '-key.pem')).toString()
    };

    client.setOptions(connectionOptions);

    console.log('[Device] Using X.509 client certificate authentication');
  }
  return client;
}

(function (connectionString) {
  // read in configuration in config.json
  try {
    config = require('./config.json');
  } catch (err) {
    console.error('Failed to load config.json: ' + err.message);
    return;
  }

  // set up wiring
  wpi.setup('wpi');
  wpi.pinMode(config.LEDPin, wpi.OUTPUT);
  messageProcessor = new MessageProcessor(config);

  try {
    var firstTimeSetting = false;
    if (!fs.existsSync(path.join(process.env.HOME, '.iot-hub-getting-started/biSettings.json'))) {
      firstTimeSetting = true;
    }
    bi.start();
    var deviceInfo = { device: "RaspberryPi", language: "NodeJS" };
    if (bi.isBIEnabled()) {
      bi.trackEventWithoutInternalProperties('yes', deviceInfo);
      bi.trackEvent('success', deviceInfo);
    }
    else {
      bi.disableRecordingClientIP();
      bi.trackEventWithoutInternalProperties('no', deviceInfo);
    }
    if(firstTimeSetting) {
      console.log("Telemetry setting will be remembered. If you would like to reset, please delete following file and run the sample again");
      console.log("~/.iot-hub-getting-started/biSettings.json\n");
    }
    bi.flush();
  } catch (e) {
    //ignore
  }

  // create a client
  // read out the connectionString from process environment
  connectionString = connectionString || process.env['AzureIoTHubDeviceConnectionString'];
  client = initClient(connectionString, config);

  client.open((err) => {
    if (err) {
      console.error('[IoT hub Client] Connect error: ' + err.message);
      return;
    }

    // set C2D and device method callback
    client.onDeviceMethod('start', onStart);
    client.onDeviceMethod('stop', onStop);
    client.on('message', receiveMessageCallback);
    setInterval(() => {
      client.getTwin((err, twin) => {
        if (err) {
          console.error("get twin message error");
          return;
        }
        config.interval = twin.properties.desired.interval || config.interval;
      });
    }, config.interval);




      console.log('Sending message from Client(One time only)... ');
			//Send Message
			sendMessage();


  });
})(process.argv[2]);
