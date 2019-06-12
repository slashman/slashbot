const Slashbot = require('./classes/Slashbot.class');
const config = require('./config');

const slashbot = new Slashbot(config);

slashbot.start();
