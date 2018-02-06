const ImagesClient = require('google-images');
const puppeteer = require('puppeteer');
const util = require('util');
const request = require('request');
const fs = require('fs');
const StoryManager = require('./StoryManager.class');

function Slashbot(config) {
    this.version = '0.1';
    this.playersMap = {};
    this.currentPlayer = '';
    this.turnModes = ['random', 'roundRobin'];
    this.turnMode = 0;
    this.lastTurn = 0;
    this.players = [];
    this.currentStoryFragments = [];
    this.config = config;
    this.connector = new config.Connector(config);
    this.conversation = new config.Conversation(config);
    this.persistence = new config.Persistence(config);
    this.storyManager = new StoryManager(config);
    this.invitationExtended = false;
    this.currentPlayerIndex = 0;
    this.inviteAcceptResponses = ['yes', 'accept', "I'll go", 'alright', 'sure'];
    this.inviteDeclineResponses = ['no', 'decline', 'pass', 'busy', 'meeting', 'working'];
    this.images_client = new ImagesClient(config.cseId, config.cseKey);
    this.twitter = new config.Twitter(config);
    this.accountability = new config.Accountability(config);
    this.puppeteer = puppeteer;
    this.request = request;
    this.fs = fs;
}

function contains(array, text) {
    for (let i = 0; i < array.length; i += 1) {
        if (text.indexOf(array[i]) > -1) {
            return true;
        }
    }
    return false;
}

module.exports = Slashbot;

Slashbot.prototype = {

    start() {
        this.persistence.init();
        this.connector.init(this);
        this.storyManager.init(this);
        this.conversation.init();
    },

    channelJoined(channel, who) {
        if (who === this.config.botName) {
            return;
        }
        this.say(who, `${who}, welcome to the channel. I am teh slashbot, I can tell you the [story so far], or the [latest] part. To add something to the story start your message with [story:] without the brackets. Have fun!`);
        if (!this.playersMap[who]) {
            console.log('pushing ', who);
            this.players.push(who);
        }
    },

    message(from, text) {
        if (!text) {
            return;
        }
        if (text.indexOf('story:') === 0) {
            const storyText = text.substring('story:'.length);
            this.storyManager.addStoryPart(from.name, storyText);
        } else if (text.indexOf('correct:') === 0) {
            const storyText = text.substring('correct:'.length);
            this.storyManager.correctStoryPart(from.name, storyText);
        } else if (text.toLowerCase().indexOf('skynet') === 0) {
            const conversationPiece = text.substring('skynet '.length);
            this._converse(conversationPiece);
        } else if (text.toLowerCase().indexOf('tweet') === 0) {
            const conversationPiece = text.substring('tweet '.length);
            this._tweet(from, conversationPiece);
        } else if (text.toLowerCase().indexOf('aqi') === 0) {
            const conversationPiece = text.substring('aqi '.length);
            this._aqi(from, conversationPiece);
        } else if (text.toLowerCase().indexOf('i ') === 0) {
            this._img_search(text.substring('i '.length));
        } else if (text.toLowerCase().indexOf('def ') === 0) {
            this._define(text.substring('def '.length));
        } else if (this.invitationExtended && from.name === this.currentPlayer && contains(this.inviteAcceptResponses, text)) {
            this.storyManager.manageInvitation(true);
        } else if (this.invitationExtended && from.name === this.currentPlayer && contains(this.inviteDeclineResponses, text)) {
            this.storyManager.manageInvitation(false);
        } else if (text.indexOf('bot') === 0) {
            if (text.indexOf('introduce yourself') > -1) {
                this._introduce(from.name);
            } else if (text.indexOf('about') > -1) {
                this._about(from.name);
            } else if (text.toLowerCase().indexOf('first') > -1) {
                this._first_message(from);
            } else if (text.indexOf('help') > -1) {
                this.storyManager.help(from.name);
            } else if (text.indexOf('creator') > -1) {
                this._creator();
            } else if (text.indexOf('latest') > -1) {
                this._latest(from.name);
            } else if (text.indexOf('story so far') > -1) {
                this.storyManager.fullStory(from.name);
            } else if (text.indexOf('new story') > -1) {
                this.storyManager.newStory(text);
            } else if (text.indexOf('set story') > -1) {
                this.storyManager.setStory(text);
            } else if (text.indexOf('list stories') > -1) {
                this.storyManager.listStories();
            } else if (text.indexOf('share the story') > -1) {
                this.storyManager.fullStory(false);
            } else if (text.indexOf('next turn') > -1) {
                this.storyManager.nextTurn();
            } else if (text.indexOf('current turn') > -1) {
                this.storyManager.currentTurn();
            } else if (text.indexOf('turn mode') > -1) {
                this.storyManager.changeTurnMode();
            } else if (text.indexOf('dice') > -1 || text.indexOf('throw') > -1) {
                this._dice(from.name, text);
            } else {
                this._wtf(from.name);
            }
        }
    },

    registerPlayers(players) {
        console.log('players in channel: ', players);
        console.log(players.length);
        for (let i = 0; i < players.length; i += 1) {
            if (!this.playersMap[players[i]] && players[i] !== this.config.botName) {
                if (this.players.indexOf(players[i]) === -1) {
                    console.log(`pushing player: ${i} ${players[i]}`);
                    this.players.push(players[i]);
                }
            }
        }
    },

    _dice(from, text) {
        const dieNotation = /(\d+)?d(\d+)([+-]\d+)?$/.exec(text);
        if (!dieNotation) {
            this.share(`What's wrong with you, ${from}? This is crap: ${text}`);
        } else {
            const amount = (typeof dieNotation[1] === 'undefined') ? 1 : parseInt(dieNotation[1], 10);
            const faces = parseInt(dieNotation[2], 10);
            const mods = (typeof dieNotation[3] === 'undefined') ? 0 : parseInt(dieNotation[3], 10);
            const diceArray = [];
            let sum = 0;
            for (let i = 0; i < amount; i += 1) {
                const die = Math.floor(Math.random() * faces) + 1;
                diceArray.push(die);
                sum += die;
            }
            this.share(`Throw = [${diceArray}], Avg = ${sum / amount} Total+mods = ${sum + mods}`);
        }
    },

    _introduce() {
        this.share('I am the slashbotx, I can tell you the [story so far], or the [latest] part. If you want to add something to the story, be sure to start your message with [story:] without the brackets. Have fun!');
    },

    _about() {
        this.share(`I am Slashbot version ${this.version}. I'm running on ${this.config.environment} using the ${this.connector.name} interactivity connector and the ${this.persistence.name} persistance connector.`);
    },

    _creator() {
        this.share('I was created by Slash. Mojito defeated Slash in an epic battle described in many songs and captured me. Mojito is now my master and he keeps me at https://github.com/gaguevaras/slashbot.');
    },

    _latest(who) {
        if (this.currentStoryFragments.length === 0) {
            this.say(who, 'The current story has not begun.');
            return;
        }
        const storypart = this.currentStoryFragments[this.currentStoryFragments.length - 1];
        this.say(who, `Latest part of the story was from ${storypart.author}, he added: "${storypart.story}"`);
    },

    _wtf(playerName) {
        this.share(`@${playerName}, perhaps you need to rephrase... Or add behavior at: https://github.com/gaguevaras/slashbot`);
    },

    say(who, text) {
        this.connector.say(who, text);
    },

    share(text) {
        this.connector.share(text);
    },

    saveMessage(message) {
        this.persistence.saveMessage(message);
        // this.persistence.getMessageSentiment(message);
    },

    saveOrUpdateUser(user) {
        this.persistence.saveOrUpdateUser(user);
    },

    _converse(conversationPiece) {
        const slashbot = this;
        this.conversation.askSkynet(conversationPiece, (response) => {
            console.log(response);
            slashbot.share(response);
        });
    },

    _img_search(string) {
        const this_ = this;
        this.images_client.search(string, {
            safe: 'high',
        })
            .then((images) => {
                this_.connector.postImageAttachment(images[0].url);
            });
    },

    _define(string) {
        const this_ = this;
        (async () => {
            const browser = await this_.puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            await page.goto(`http://dle.rae.es/?w=${string}`, {
                waitUntil: 'networkidle0',
            });
            // const results = await page.$('div#resultados');
            await page.screenshot({
                path: `${string}.png`,
            });
            this_.request.post({
                url: 'https://slack.com/api/files.upload',
                formData: {
                    token: this_.config.token,
                    title: 'Image',
                    filename: `${string}.png`,
                    filetype: 'auto',
                    channels: this_.connector.slackChannel,
                    file: this_.fs.createReadStream(`${string}.png`),
                },
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(JSON.parse(response.body));
                fs.unlink(`${string}.png`, (error) => {
                    if (error) {
                        throw error;
                    }
                    console.log(`Deleted ${string}.png!!`);
                });
            });

            await browser.close();
        })();
    },

    _tweet(who, string) {
        const this_ = this;
        // I wonder which one of these guys will break through this first?

        this.persistence.getTwitterCredentials(
            who.id,
            (creds) => {
                if (!creds) {
                    this_.share(`${who.name}, you must master the forgotten art of OAuth before proceeding. Contact a GusCorp representative for assistance.`);
                    return;
                }
                this_.twitter.tweet(creds, who, string, (tweetedTweet) => {
                    this_.share(`${who.name} tweeted: ${tweetedTweet.text}`);
                });
            },
        );
    },

    _aqi(who, city) {
        const this_ = this;
        // console.log('https://api.waqi.info/search/?keyword='+city+'&token=30ba56606e67af7b9e9993df62e8071864ef9b4e');
        this.accountability.retrieveAqi(who, city, (result) => {
            if (!result) {
                this_.share('The stations are not transmitting data.');
                return;
            }
            this_.share(`min = ${result.min} max = ${result.max} avg = ${result.avg}`);
            this_.share(`minStation = ${result.minStation}\nmaxStation = ${result.maxStation}`);
            if (city === 'bogota') {
                this_._tweet(who, `Qué está haciendo @EnriquePenalosa? #Polución Bogotana en ${result.max} AQI! http://aqicn.org/map/bogota/#@g/4.6187/-74.1907/11z`);
            }
            if (city === 'medellín') {
                this_._tweet(who, `Qué pasa en #Medellín y el #ValleDeAburrá @FicoGutierrez? la #Polución esta en ${result.max} AQI! http://aqicn.org/map/colombia/medellin/#@g/6.208/-75.5957/12z`);
            }
        });
    },

    _first_message(who) {
        const this_ = this;
        this.persistence.getMessageList((messages) => {
            let result = '';
            if (!messages || messages.length === 0) {
                this_.share(`No words have been spoken today, ${who.name}`);
                return;
            }
            this_.share('This is today\'s top 5:');
            for (let i = 0; i < messages.length; i += 1) {
                const message = messages[i];
                result = util.format('%s\n%s by @%s', result, message.text, message.user.name);
            }
            this_.share(result);
        });
    },
};
