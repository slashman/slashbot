var IRCConnector = require("./classes/IRCConnector.class");
var SlackConnector = require("./classes/SlackConnector.class");
var JSONConnector = require("./classes/persistence/JSONConnector.class");
var MongoConnector = require("./classes/persistence/MongoConnector.class");

// Sample Slack-thru-IRC config
module.exports = {
	channel: "#slashbottest",
	server: "ffoundry.irc.slack.com",
	botName: "slashbotx",
	password: "ffoundry.MUr0IDVbPois5VgPtbYY",
	connector: SlackConnector,
	token: 'xoxb-3463721915-mXLDStOphmDcva9aBNBuYCcT',
	autoReconnect: true,
	autoMark: true,
	persistence: JSONConnector
};

// Sample plain IRC config
/*
module.exports = {
	channel: "#slashbot",
	server: "verne.freenode.net",
	botName: "slashbot",
	connector: IRCConnector,
	persistence: MongoConnector,
	dbURL: 'mongodb://localhost:27017/slashbot'
};
*/