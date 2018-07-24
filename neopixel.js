'use strict';

var sleep = require('sleep');

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
sleep.sleep(3);
xmas.GoXmas1({}, strip);
sleep.sleep(3);
xmas.GoXmasIterate({}, strip);
sleep.sleep(3);
fade.GoFade2({ Color1: 'FFB341', Color2: '41FF80' });
sleep.sleep(3);
control.Stop();
