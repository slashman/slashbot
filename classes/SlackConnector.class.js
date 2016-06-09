
var Slack = require('@slack/client');
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
// console.log(Slack);
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
    this.rtm = null;

}

SlackConnector.prototype = {
	init: function(slashbot){
		var that = this;
		this.slashbot = slashbot;
		console.log("Initializing with SlackConnector...");
		
		var RtmClient = Slack.RtmClient;

		var WebClient = Slack.WebClient;

		if(this.config.webapiTestToken){ 
			this.web = new RtmClient(this.config.webapiTestToken, {logLevel: 'info'});	
		}		

		this.rtm = new RtmClient(this.token, {logLevel: 'info'});
		
		this.rtm.start();
		
		this.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
			console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
		});

		this.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
			// Get the user's name
			var user = that.rtm.dataStore.getUserById(that.rtm.activeUserId);

			// Get the team's name
			var team = that.rtm.dataStore.getTeamById(that.rtm.activeTeamId);

			// Log the slack team name and the bot's name
			console.log('Connected to ' + team.name + ' as ' + user.name);
		});

		this.rtm.on(RTM_EVENTS.MESSAGE, function (message) {
			/**
			{ 
				type: 'message',
				channel: 'C1DKYBV8E',
				user: 'U03DJ7SJZ',
				text: 'test',
				ts: '1464880174.000004',
				team: 'T03DJ7SJV' 
			}
			*/
			// Listens to all `message` events from the team
			console.log('message', message);
			
			if (message.type != 'message'){
				console.log("Ignoring non-message message ["+message.text+"]")
				return;
			}

			var user = that.rtm.dataStore.getUserById(message.user);
			
			if (!user){
				console.log("Error: user ["+message.user+"] not found.")
				return;
			}

			if (message.channel) that.slackChannel = message.channel;
			
			slashbot.message(user.name, message.text);

			if(that.activeUsersArray.indexOf(user.name) == -1){
				that.activeUsersArray.push(user.name);
			}

			that.slashbot.registerPlayers(that.activeUsersArray);
			
		});

		this.rtm.on(RTM_EVENTS.PRESENCE_CHANGE, function(presence_change){
			console.log('presence_change', presence_change);
		});
	},
	say: function(who, text){
		console.log(typeof who);
		console.log("Saying: " + text + " to " + who);
		var dm = this.rtm.dataStore.getDMByName(who);
		if (!dm) throw 'You should not initiate private messages.';
		this.rtm.sendMessage(text, dm.id);
	},
	share: function(text){
		console.log("Sharing: " + text);
		console.log('channel', this.slackChannel);
		this.rtm.sendMessage(text, this.slackChannel);
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