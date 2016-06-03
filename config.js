var IRCConnector = require("./classes/IRCConnector.class");
var SlackConnector = require("./classes/SlackConnector.class");
var JSONConnector = require("./classes/persistence/JSONConnector.class");
var MongoConnector = require("./classes/persistence/MongoConnector.class");

// Sample Slack-thru-IRC config
module.exports = {
	environment: "slashieMachine",
	channel: "slashbottest",
	server: "ffoundry.irc.slack.com",
	botName: "obibot",
	password: "ffoundry.MUr0IDVbPois5VgPtbYY",
	connector: SlackConnector,
	token: 'xoxb-3463721915-FMFl8maGS9yP5AXy835FjsKa',
	autoReconnect: true,
	autoMark: true,
	persistence: JSONConnector
};

// Sample plain IRC config

// module.exports = {
// 	environment: "slashieMachine",
// 	channel: "#slashbot",
// 	server: "verne.freenode.net",
// 	botName: "obibot",
// 	connector: IRCConnector,
// 	persistence: MongoConnector,
// 	dbURL: 'mongodb://localhost:27017/slashbot'
// };
