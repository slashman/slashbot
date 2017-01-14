var IRCConnector = require("./classes/IRCConnector.class");
var SlackConnector = require("./classes/SlackConnector.class");
var JSONConnector = require("./classes/persistence/JSONConnector.class");
var MongoConnector = require("./classes/persistence/MongoConnector.class");
var ConversationConnector = require("./classes/conversation/ConversationCleverbot.class");

// Sample Slack-thru-IRC config
module.exports = {
	environment: "gusMachine",
	channel: "slashbottest",
	server: "ffoundry.irc.slack.com",
	botName: "lulz",
	password: "ffoundry.MUr0IDVbPois5VgPtbYY",
	connector: SlackConnector,
	conversation: ConversationConnector,
	// token: 'xoxb-47967087845-iMA1zwp2jHK5geu9emPyppM6', //lulz
	token: 'xoxb-3463721915-FMFl8maGS9yP5AXy835FjsKa', //obibot
	webapiTestToken: process.env.SLACK_WEB_API_TEST_TOKEN || '',
	autoReconnect: true,
	autoMark: true,
	persistence: MongoConnector,
	dbURL: process.env.MONGODB_URI || 'mongodb://localhost:27017/slashbot',
	cseId: process.env.CSE_ID || '',
	cseKey: process.env.CSE_KEY || ''

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
