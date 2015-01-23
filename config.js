var IRCConnector = require("./classes/IRCConnector.class");

// Sample Slack-thru-IRC config
module.exports = {
	channel: "#slashbottest",
	server: "ffoundry.irc.slack.com",
	botName: "slashbotx",
	password: "milkyway",
	connector: IRCConnector
};

// Sample plain IRC config
module.exports = {
	channel: "#slashbot",
	server: "verne.freenode.net",
	botName: "slashbot",
	connector: IRCConnector
};
