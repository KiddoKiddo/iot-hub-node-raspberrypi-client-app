'use strict';

var delay = require('delay');

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
(async () => {
  rainbow.GoRainbow({}, strip);
  await delay(5000);
  xmas.GoXmas1({}, strip);
  await delay(5000);
  xmas.GoXmasIterate({}, strip);
  await delay(5000);
  fade.GoFade2({ Color1: 'FFB341', Color2: '41FF80' });
  await delay(5000);
  control.Stop();
})();
