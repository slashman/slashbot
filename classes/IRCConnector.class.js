var irc = require("irc");

function IRCConnector(config){
	this.name = 'IRCConnector';
	this.client = null;
	this.config = config;
	this.channel = config.channel;
}

IRCConnector.prototype = {
	init: function(slashbot){
		var that = this;
		this.client = new irc.Client(this.config.server, this.config.botName, {
			channels: [this.config.channel], password: this.config.password
		});
		this.client.addListener("join", function(channel, who) {
			slashbot.channelJoined(channel, who);
		});
		this.client.addListener("message", function(from, to, text, message) {
			slashbot.message(from, text);
		});
		this.client.addListener("names", function (channel, nicks) {
			console.log("Channel: " + channel);
			if(channel == slashbot.config.channel){
				console.log('CHANNEL FOUND. Registering players...');
				slashbot.registerPlayers(Object.keys(nicks));				
			}
		});
		this.client.addListener('error', function(message) {
		    console.log('error: ', message);
		});
	},
	say: function(who, text){
		this.client.notice(who, text);
	},
	share: function (text){
		this.client.say(this.channel, text);
	}
}

module.exports = IRCConnector;