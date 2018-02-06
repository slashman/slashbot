
const Slack = require('@slack/client');
const { CLIENT_EVENTS } = require('@slack/client');
const { RTM_EVENTS } = require('@slack/client');
// console.log(Slack);
function SlackConnector(config) {
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

    init(slashbot) {
        const that = this;
        this.slashbot = slashbot;
        console.log('Initializing with SlackConnector...');

        const { RtmClient } = Slack;

        const { WebClient } = Slack;

        if (this.config.webapiTestToken) {
            this.web = new WebClient(this.config.webapiTestToken, { logLevel: 'info' });
        }

        this.rtm = new RtmClient(this.token, { logLevel: 'info' });

        this.rtm.start();

        this.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
            console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
        });

        this.rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
            // Get the user's name
            const user = that.rtm.dataStore.getUserById(that.rtm.activeUserId);

            // Get the team's name
            const team = that.rtm.dataStore.getTeamById(that.rtm.activeTeamId);

            // Log the slack team name and the bot's name
            console.log(`Connected to ${team.name} as ${user.name}`);
        });

        this.rtm.on(RTM_EVENTS.MESSAGE, (message) => {
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

            if (message.type !== 'message') {
                console.log(`Ignoring non-message message [${message.text}]`);
                return;
            }

            const user = that.rtm.dataStore.getUserById(message.user);

            if (!user) {
                console.log(`Error: user [${message.user}] not found.`);
                return;
            }

            if (message.channel) that.slackChannel = message.channel;

            slashbot.message(user, message.text);

            if (that.activeUsersArray.indexOf(user.name) === -1) {
                that.activeUsersArray.push(user.name);
            }

            that.slashbot.registerPlayers(that.activeUsersArray);

            // Replace the user id for the entire user object to be stored:
            const updatedMessage = message;
            updatedMessage.user = user;

            that.slashbot.saveMessage(message);
            that.slashbot.saveOrUpdateUser(user);
        });

        this.rtm.on(RTM_EVENTS.PRESENCE_CHANGE, (presenceChange) => {
            console.log('presenceChange', presenceChange);
        });
    },

    say(who, text) {
        console.log(typeof who);
        console.log(`Saying: ${text} to ${who}`);
        const dm = this.rtm.dataStore.getDMByName(who);
        if (!dm) {
            this.rtm.sendMessage(text, this.slackChannel);
            return;
        }
        this.rtm.sendMessage(text, dm.id);
    },

    share(text) {
        console.log(`Sharing: ${text}`);
        console.log('channel', this.slackChannel);
        this.rtm.sendMessage(text, this.slackChannel);
    },

    _registerAllChannelMembers(channel) {
        for (let i = 0; i < channel.members.length; i += 1) {
            if (this.slack.getUserByID(channel.members[i]).presence === 'active') {
                this.activeUsersArray.push(this.slack.getUserByID(channel.members[i]).name);
            }
        }
        this.slashbot.registerPlayers(this.activeUsersArray);
    },

    postImageAttachment(imageUrl) {
        const att2 = {
            color: '#764FA5',
            image_url: imageUrl,
        };

        const msgpack = {
            type: 'message',
            text: imageUrl,
            channel: this.slackChannel,
            attachments: [att2],
        };
        console.log(this.slackChannel);
        this.web._makeAPICall('chat.postMessage', msgpack, (err, res) => {
            console.error('postMessage result:', err, res);
        });
    },
};

module.exports = SlackConnector;
