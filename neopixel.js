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
rainbow.GoRainbow({}, strip);

xmas.GoXmas1({}, strip);

xmas.GoXmasIterate({}, strip);

fade.GoFade2({ Color1: 'FFB341', Color2: '41FF80' });


process.on('exit', function() {
  control.Stop();
});
