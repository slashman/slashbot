var Slashbot = require("./classes/Slashbot.class");
var config = require("./config");
var slashbot = new Slashbot(config);
slashbot.start();