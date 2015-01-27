var Slack = require('slack-client');

function SlackConnector(config){
	this.name = 'SlackConnector';
	this.token = config.token;
	this.autoReconnect = config.autoReconnect;
	this.autoMark = config.autoMark;
	this.config = config;
    this.slack = null;
    this.activeUsersArray = [];
    this.slashbot = null;
    this.slackChannel = null;

}

SlackConnector.prototype = {
	init: function(slashbot){
		var that = this;
		this.slashbot = slashbot;
		console.log("Initializing with SlackConnector...");
		var slack = new Slack(this.token, this.autoReconnect, this.autoMark);
		slack.on('open', function() {
			var channelName = that.config.channel;
			var slackChannel = null;
			for (key in slack.channels) {
				console.log("Channel: "+slack.channels[key].name);
				if (/*slack.channels[key].is_member && */slack.channels[key].name === channelName) {
					slackChannel = slack.channels[key];
				}
			}
			if (!slackChannel){
				/*if (slack.groups[channelName].is_open && !slack.groups[channelName].is_archived) {
					slackChannel = slack.groups[channelName];
				} else { 
					console.log("Error: Channel or group ["+that.config.channel+"] not found or inaccessible by user");
					return;
				}*/
				console.log("Error: Channel ["+channelName+"] not found or inaccessible");
				return;
			} else if (!slackChannel.is_member) {
				console.log("Error: Bot is not member of channel ["+channelName+"]");
				return;
			}
			that.slackChannel = slackChannel;
			that._registerAllChannelMembers(slackChannel);
			console.log('Welcome to Slack. You are @%s of %s', slack.self.name, slack.team.name);
			console.log('You are in: %s', channelName);
			
		});

		slack.on('message', function(message){
			if (message.type != 'message'){
				console.log("Ignoring non-message message ["+message.text+"]")
				return;
			} 
		    var user = slack.getUserByID(message.user);
		    var text = message.text;
			if (!user){
				console.log("Error: user ["+message.user+"] not found.")
				return;
			}
			slashbot.message(user.name, text);
			if(that.activeUsersArray.indexOf(user.name) == -1){
				that.activeUsersArray.push(user.name);
			}
			that.slashbot.registerPlayers(that.activeUsersArray);
		});

		slack.on('error', function(error) {
			console.error('Error: %s', error);
		});

		slack.login();
		this.slack = slack;
	},
	say: function(who, text){
		console.log(typeof who);
		console.log("Saying: " + text + " to " + who);
		var dm = this.slack.getChannelGroupOrDMByName(who);
		dm.send(text);
	},
	share: function(text){
		console.log("Sharing: " + text);
		this.slackChannel.send(text);
	},
	_registerAllChannelMembers: function (channel){
		for(var i = 0; i < channel.members.length; i++){
			if(this.slack.getUserByID(channel.members[i]).presence == 'active'){
				this.activeUsersArray.push(this.slack.getUserByID(channel.members[i]).name);							
			}
		}
		this.slashbot.registerPlayers(this.activeUsersArray);
	}
}

module.exports = SlackConnector;