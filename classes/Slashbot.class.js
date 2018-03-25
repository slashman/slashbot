const ImagesClient = require('google-images');
const puppeteer = require('puppeteer');
const util = require('util');
const request = require('request');
const fs = require('fs');
const StoryManager = require('./StoryManager.class');
const FinanceDataManager = require('./FinanceDataManager.class');
const ManagerRegistry = require('./ManagerRegistry.class');

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
    this.financeManager = new FinanceDataManager(config);
    this.invitationExtended = false;
    this.currentPlayerIndex = 0;
    this.inviteAcceptResponses = ['yes', 'accept', "I'll go", 'alright', 'sure'];
    this.inviteDeclineResponses = ['no', 'decline', 'pass', 'busy', 'meeting', 'working'];
    this.images_client = new ImagesClient(config.cseId, config.cseKey);
    this.twitter = new config.Twitter(config);
    this.accountabilityManager = new config.Accountability(config);
    this.puppeteer = puppeteer;
    this.request = request;
    this.fs = fs;
    this.managerRegistry = new ManagerRegistry(config);
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
        this.conversation.init();

        console.log('Registering story manager.');
        this.managerRegistry.register(this.storyManager.init(this));
        console.log('Registering finance manager.');
        this.managerRegistry.register(this.financeManager.init(this));
        console.log('Registering accountability manager.');
        this.managerRegistry.register(this.accountabilityManager.init(this));

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

        this.managerRegistry.processMessage(from, text);

        if (!text) {
            return;
        }
        if (text.toLowerCase().indexOf('skynet') === 0) {
            const conversationPiece = text.substring('skynet '.length);
            this._converse(conversationPiece);
        } else if (text.toLowerCase().indexOf('tweet') === 0) {
            const conversationPiece = text.substring('tweet '.length);
            this._tweet(from, conversationPiece);
        } else if (text.toLowerCase().indexOf('i ') === 0) {
            this._img_search(text.substring('i '.length));
        } else if (text.toLowerCase().indexOf('def ') === 0) {
            this._define(text.substring('def '.length));
        } else if (text.indexOf('dice') === 0 || text.indexOf('throw') === 0) {
            this._dice(from.name, text);
        }
        else if (text.indexOf('bot') === 0) {
            if (text.indexOf('introduce yourself') > -1) {
                this._introduce(from.name);
            } else if (text.indexOf('about') > -1) {
                this._about(from.name);
            } else if (text.toLowerCase().indexOf('first') > -1) {
                this._first_message(from);
            } else if (text.indexOf('creator') > -1) {
                this._creator();
            } else if (text.indexOf('latest') > -1) {
                this._latest(from.name);
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
            const resultsText = await page.$eval('div#resultados', e => e.innerText);
            this_.share(resultsText);
            this_.share(`http://dle.rae.es/?w=${string}`);
            // await page.screenshot({
            //     path: `${string}.png`,
            // });
            // this_.request.post({
            //     url: 'https://slack.com/api/files.upload',
            //     formData: {
            //         token: this_.config.token,
            //         title: 'Image',
            //         filename: `${string}.png`,
            //         filetype: 'auto',
            //         channels: this_.connector.slackChannel,
            //         file: this_.fs.createReadStream(`${string}.png`),
            //     },
            // }, (err, response) => {
            //     if (err) {
            //         console.log(err);
            //         return;
            //     }
            //     console.log(JSON.parse(response.body));
            //     fs.unlink(`${string}.png`, (error) => {
            //         if (error) {
            //             throw error;
            //         }
            //         console.log(`Deleted ${string}.png!!`);
            //     });
            // });

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
