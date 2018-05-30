// To run this Do the following
//
// install modules
// npm install node-ads1x15 --save
//
//
// nodejs i2c.js
//


var ads1x15 = require('node-ads1x15');
var chip = 1; //0 for ads1015, 1 for ads1115



//Simple usage (default ADS address on pi 2b or 3):
//var adc = new ads1x15(chip);
var adc = new ads1x15(chip, 0x48, '/dev/i2c-1');



var channel = 0; //channel 0, 1, 2, or 3...
var samplesPerSecond = '250'; // see index.js for allowed values for your chip
var progGainAmp = '4096'; // see index.js for allowed values for your chip

var ChData =[]; //somewhere to store values
var dev = 1;

//var Active = "0, 1, 2, 3"; //channels and the order to scan in
var Active = "0, 1"; // Only ch 0 and 1
// var Active = "1, 3"; // Only ch 1 and 3
var ActiveCh = Active.split(", ") ;
var Count = 0; // Counter in the loop back

var DebugFlag = 0;






function Sensor1() {
  // Optionally i2c address as (chip, address) or (chip, address, i2c_dev)
  // So to use /dev/i2c-0 use the line below instead...:
  //this.ads1115 = new ads1x15(chip, 0x48, '/dev/i2c-1');
}



function ChannelRead() {
  var ch = ActiveCh[Count]; // Getting the ActiveCh number
  adc.readADCSingleEnded(ch, progGainAmp, samplesPerSecond, function(err, data) {
    if(err){
      //logging / troubleshooting code goes here...
      throw err;
    }
    // if you made it here, then the data object contains your reading!
    ChData[ch] = data // Putting data into

    // Checking the Loop
    if (Count == (ActiveCh.length - 1)) {// Checking if is the last change
         Count = 0; // Reset the counter and do NOT call ChannelRead
         // Output the Voltages
         if(DebugFlag)
         {
         console.log ('CH1: ' + (ChData[0]/dev).toFixed(2) +
                   '\tCH2: ' + (ChData[1]/dev).toFixed(2) +
                   '\tCH3: ' + (ChData[2]/dev).toFixed(2) +
                   '\tCH4: ' + (ChData[3]/dev).toFixed(2) );
         }
    }else { // going to read the next channel
         Count++;
         ChannelRead();  // Calling ChannelRead again with Count +1
    }



    return 1; // need to return to the starting call to TempRead

  });


}

Sensor1.prototype.read = function (callback) {

  if(!adc.busy)
  {

    ChannelRead();
    var data1 = JSON.stringify({
      ADC1  : (ChData[0]/dev).toFixed(0),
      ADC2  : (ChData[1]/dev).toFixed(0),
      ADC3  : (ChData[2]/dev).toFixed(0),
      ADC4  : (ChData[3]/dev).toFixed(0)
    });
    callback(null, data1);


    /*
    ChannelRead()
      .then((ChData) => {
        var data2 = JSON.stringify({
          ADC1  : (ChData[0]/dev).toFixed(2),
          ADC2  : (ChData[1]/dev).toFixed(2),
          ADC3  : (ChData[2]/dev).toFixed(2),
          ADC4  : (ChData[3]/dev).toFixed(2)
        });
        callback(null, data2);
      })
      .catch(callback);*/

  }
}


module.exports = Sensor1;
