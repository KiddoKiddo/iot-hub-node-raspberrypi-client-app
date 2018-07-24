'use strict';

var strip = require("./ws2812controller/strip.js");
var rainbow = require("./ws2812controller/animations/rainbow.js");

var args = {};
rainbow.GoRainbow(args, strip);
