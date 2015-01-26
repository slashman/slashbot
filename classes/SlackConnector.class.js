var Slack = require('slack-client');

function SlackConnector(config){
	this.name = 'SlackConnector';
	this.token = config.token;
	this.autoReconnect = config.autoReconnect;
	this.autoMark = config.autoMark;
	this.type = null;
	this.channel = null,
    this.user = null,
    this.time = null,
    this.text = null,
    this.response = '';
    this.slack = null;

}

SlackConnector.prototype = {
	init: function(slashbot){
		
		console.log("Initializing with SlackConnector...");
		var slack = new Slack(this.token, this.autoReconnect, this.autoMark);
		slack.on('open', function() {
			var channels = ["#test-bot"],
			    groups = [],
			    unreads = slack.getUnreadCount(),
			    key;
			for (key in slack.channels) {
				if (slack.channels[key].is_member) {
					channels.push('#' + slack.channels[key].name);
					console.log('pushing: #' + slack.channels[key].name);
				}
			}

			for (key in slack.groups) {
				if (slack.groups[key].is_open && !slack.groups[key].is_archived) {
					groups.push(slack.groups[key].name);
				}
			}

			console.log('Welcome to Slack. You are @%s of %s', slack.self.name, slack.team.name);
			console.log('You are in: %s', channels.join(', '));
			console.log('As well as: %s', groups.join(', '));
			console.log('You have %s unread ' + (unreads === 1 ? 'message' : 'messages'), unreads);

		});

		slack.on('error', function(error) {
			console.error('Error: %s', error);
		});

		slack.on('message', function(message){
			this.type = message.type,
		    this.channel = slack.getChannelGroupOrDMByID(message.channel),
		    this.user = slack.getUserByID(message.user),
		    this.time = message.ts,
		    this.text = message.text,
		    this.response = '';
			slashbot.message(this.user.name, this.text);
		});

		slack.login();
		this.slack = slack;
	},
	say: function(who, text){
		console.log("Saying: " + text + " to " + who);
		var dm = this.slack.getChannelGroupOrDMByName(who.name);
		dm.send(text);
	},
	share: function(text){
		console.log("Sharing: " + text);
		this.slack.channel.send(text);
	}
}

module.exports = SlackConnector;