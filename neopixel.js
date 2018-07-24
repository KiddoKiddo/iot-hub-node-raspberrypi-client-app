'use strict';


var strip = require("./ws2812controller/strip.js");
var xmas = require("./ws2812controller/animations/xmas.js");
var fade = require("./ws2812controller/animations/fade.js");
var rainbow = require("./ws2812controller/animations/rainbow.js");
var control = require("./ws2812controller/animations/control.js");

/*
  control
    Stop:
  fade
    GoFade2({ Color1: '66CCFF', Color2: '66CCFF' })
    FadeSpeed({ speed: 1-100 })
  rainbow:
    GoRainbow()
    RainbowSpeedd({ speed: 1-100 })
  xmas:
    GoXmas1();
    GoXmasIterate();
*/
console.log('MODE: ', process.argv[0]);
if(process.argv[0] == 0){
  rainbow.GoRainbow({}, strip);
}
if(process.argv[0] == 1){
  xmas.GoXmas1({}, strip);
}
if(process.argv[0] == 2){
  xmas.GoXmasIterate({}, strip);
}
if(process.argv[0] == 3){
  fade.GoFade2({ Color1: 'FFB341', Color2: '41FF80' }, strip);
}

process.on('SIGINT', function() {
  control.Stop();
});
