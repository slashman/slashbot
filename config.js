var IRCConnector = require("./classes/IRCConnector.class");
var JSONConnector = require("./classes/persistence/JSONConnector.class");

// Sample Slack-thru-IRC config
/*module.exports = {
	channel: "#slashbottest",
	server: "ffoundry.irc.slack.com",
	botName: "slashbotx",
	password: "ffoundry.MUr0IDVbPois5VgPtbYY",
	connector: IRCConnector,
	persistence: JSONConnector
};*/

// Sample plain IRC config
module.exports = {
	channel: "#slashbot",
	server: "verne.freenode.net",
	botName: "slashbot",
	connector: IRCConnector,
	persistence: JSONConnector
};
