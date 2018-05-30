
'use strict';

const Bme280Sensor = require('./bme280Sensor.js');
const SimulatedSensor = require('./simulatedSensor.js');
const AdcSensor = require('./ads1115Sensor.js');

var SimulatedData;

var dateTime = require('node-datetime');


/*

var JobIDString = "YMDHMS-000";


// button is attached to pin 17, led to 14
var GPIO = require('onoff').Gpio,
	led = new GPIO(14, 'out'),
	button = new GPIO(17, 'in', 'rising');
var JobidRunningNumber = 0;
// define the callback function
function light() {
   if(led.readSync()){
		 led.writeSync(0);
	 }else{
		 led.writeSync(1);
	 }

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
button.watch(light);
button.watch(UpdateJobID);*/


function MessageProcessor(option) {
  option = Object.assign({
    deviceId: '[Unknown device] node',
    temperatureAlert: 30
  }, option);
  this.sensor = option.simulatedData ? new SimulatedSensor() : new AdcSensor();
  //this.sensor = option.simulatedData ? new SimulatedSensor() : new Bme280Sensor(option.i2cOption);
  //this.sensor =  new AdcSensor();
  this.deviceId = option.deviceId;
  this.pressureAlert = option.pressureAlert;

  SimulatedData = option.simulatedData;
  /*
  this.sensor.init(() => {
    this.inited = true;
  });
  */

}

MessageProcessor.prototype.getMessage = function (messageId,JobIDString,PressureAlertFlag,FlowAlertFlag,cb) {
  //if (!this.inited) { return; }




  this.sensor.read((err, data) => {


    if (err) {
      console.log('[Sensor] Read data failed: ' + err.message);
      return;
    }
    //console.log ('>>data= ' + data);
    //console.log ('>>>>data.temperature= ' + data.temperature );
    var dt = dateTime.create();
    var Current_Time = dt.format('Y-m-d H:M:S'); //Current Timestamp--

    var PressureData = 0;
    var FlowData = 0;



    if(SimulatedData){

      cb(JSON.stringify({
        messageid: messageId,
        jobid : JobIDString,
        deviceid: this.deviceId,
        temperature: data.temperature,
        humidity: data.humidity
      }), data.temperature > this.temperatureAlert);

    }else{



      var data = JSON.parse(data);  //Important // Use this to convert string to js object back.So you can read data like data.temperature
      //console.log ('>>data= ' + data);
      //console.log ('>>>>data.temperature= ' + data.temperature );

      //console.log ('>>>>data.ADC1= ' + data.ADC1 );



      if (isNaN(data.ADC1)) {
        PressureData = '0'
      } else {
        PressureData = data.ADC1;
      }
      if (isNaN(data.ADC2)) {
        FlowData = '0'
      } else {
        FlowData = data.ADC2;
      }

      cb(JSON.stringify({
        messageId: messageId,
        jobid : JobIDString,//jobid : "001", //jobid : JobidRunningNumber,
        deviceId: this.deviceId,
        pressure: parseFloat((PressureData).replace(/,/g, '')),//pressure: data.ADC1,
        flowrate: parseFloat((FlowData).replace(/,/g, '')),//flowrate: data.ADC2,
        pressureAlert: PressureAlertFlag,
        flowrateAlert: FlowAlertFlag,
        time: Current_Time
      //}), data.ADC1 > this.pressureAlert);
    }), parseFloat((data.ADC1).replace(/,/g, '')) > this.pressureAlert,parseFloat((data.ADC2).replace(/,/g, '')) > this.FlowAlert);

    }


  });
}



module.exports = MessageProcessor;
