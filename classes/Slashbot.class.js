var ImagesClient = require('google-images');

function Slashbot(config){
	this.version = "0.1";
	this.playersMap = {};
	this.currentPlayer = "";
	this.turnModes = ["random", "roundRobin"];
	this.turnMode = 0;
	this.lastTurn = 0;
	this.players = new Array();
	this.currentStoryFragments = [];
	this.config = config;
	this.connector = new config.connector(config);
	this.conversation = new config.conversation(config);
	this.persistence = new config.persistence(config);
	this.invitationExtended = false;
	this.currentPlayerIndex = 0;
	this.inviteAcceptResponses = ["yes", "accept", "I'll go", "alright", "sure"];
	this.inviteDeclineResponses = ["no", "decline", "pass", "busy", "meeting", "working"];
	this.images_client = new ImagesClient(config.cseId, config.cseKey);
	this.twitter = new config.twitter(config);
	this.accountability = new config.accountability(config);
}

function contains(array, text) {
    for (var i = 0; i < array.length; i++) {
        if (text.indexOf(array[i]) > -1) {
            return true;
        }
    }
    return false;
}

module.exports = Slashbot;

Slashbot.prototype = {
	start: function(){
		this.persistence.init();
		this.connector.init(this);
		this.conversation.init();
	},
	channelJoined: function(channel, who){
		if (who === this.config.botName)
			return;
		this.say(who, who + ", welcome to the channel. I am teh slashbot, I can tell you the [story so far], or the [latest] part. To add something to the story start your message with [story:] without the brackets. Have fun!");
		if (!this.playersMap[who]){
			console.log("pushing ", who);
			this.players.push(who);		
		}
	},
	message: function(from, text){
		if (!text)
			return;
		if (text.indexOf("story:") == 0){
			var storyText = text.substring("story:".length);
			this._addStoryPart(from.name, storyText);
		} else if (text.indexOf("correct:") == 0){
			var storyText = text.substring("correct:".length);
			this._correctStoryPart(from.name, storyText);
		} else if (text.toLowerCase().indexOf("skynet") == 0){
			var conversationPiece = text.substring("skynet ".length);
			this._converse(conversationPiece);
		} else if (text.toLowerCase().indexOf("tweet") == 0){
			var conversationPiece = text.substring("tweet ".length);
			this._tweet(from, conversationPiece);
		} else if (text.toLowerCase().indexOf("aqi") == 0){
			var conversationPiece = text.substring("aqi ".length);
			this._aqi(from, conversationPiece);
		} else if (text.toLowerCase().indexOf("i ") == 0){
				this._img_search(text.substring("i ".length));
		} else if (this.invitationExtended && from.name === this.currentPlayer && contains(this.inviteAcceptResponses, text)) {
			this._manageInvitation(true);
		} else if (this.invitationExtended && from.name === this.currentPlayer && contains(this.inviteDeclineResponses,text)) {
			this._manageInvitation(false);
		} else if (text.indexOf("bot") == 0){
			if (text.indexOf("introduce yourself") > -1){
				this._introduce(from.name);
			} else if (text.indexOf("about") > -1){
				this._about(from.name);
			} else if (text.indexOf("help") > -1){
				this._help(from.name);
			} else if (text.indexOf("joke") > -1){
				this._joke();
			} else	if (text.indexOf("creator") > -1){
				this._creator();
			} else if (text.indexOf("latest") > -1){
				this._latest(from.name);
			} else if (text.indexOf("story so far") > -1){
				this._fullStory(from.name);
			} else if (text.indexOf("new story") > -1){
				this._newStory(text);
			} else if (text.indexOf("set story") > -1){
				this._setStory(text);
			} else if (text.indexOf("list stories") > -1){
				this._listStories();
			} else if (text.indexOf("share the story") > -1){
				this._fullStory(false);
			} else if (text.indexOf("next turn") > -1){
				// this._nextTurn();
			} else if (text.indexOf("current turn") > -1){
				// this._currentTurn();
			} else if (text.indexOf("turn mode") > -1){
				// this._changeTurnMode();
			} else if (text.indexOf("dice") > -1 || text.indexOf("throw") > -1){
				this._dice(from.name, text);
			} else {
				this._wtf(from.name);
			}	
		}
	},
	registerPlayers: function(players){
		console.log("players in channel: ", players);
		console.log(players.length);
		for (var i = 0; i < players.length; i++) {
			if (!this.playersMap[players[i]] && players[i] != this.config.botName) {
				if(this.players.indexOf(players[i]) == -1){
					console.log("pushing player: "+ i + ' ' + players[i]);
					this.players.push(players[i]);					
				}
			}
		}
	},
	_dice: function (from, text){
		var dieNotation = /(\d+)?d(\d+)([+-]\d+)?$/.exec(text);
	    if (!dieNotation) {
	        this.share("What's wrong with you, "+ from + "? This is crap: " + text);
	    } else {
		    var amount = (typeof dieNotation[1] == 'undefined') ? 1 : parseInt(dieNotation[1]);
		    var faces = parseInt(dieNotation[2]);
		    var mods = (typeof dieNotation[3] == 'undefined') ? 0 : parseInt(dieNotation[3]);
			var diceArray = [];
			var sum = 0;
			for(var i = 0; i < amount; i++) {
				var die = Math.floor(Math.random() * faces) + 1;
				diceArray.push(die);
				sum += die;
			}
			this.share("Throw = ["+diceArray+"], Avg = "+sum/amount+" Total+mods = "+(sum+mods));
	    	
	    }
	},
	_introduce: function (){
		this.share("I am the slashbotx, I can tell you the [story so far], or the [latest] part. If you want to add something to the story, be sure to start your message with [story:] without the brackets. Have fun!");
	},
	_about: function (){
		this.share("I am Slashbot version "+this.version+". I'm running on "+this.config.environment+" using the "+this.connector.name+" interactivity connector and the "+this.persistence.name+" persistance connector.");
	},
	_nextTurn: function(){
		if(this.invitationExtended) {
			this.share("Still no word from @" + this.currentPlayer + "...");
			this.invitationExtended = false;
			return;
		}		

		var playerIndex = 0;
		var turnMode = this.turnModes[this.turnMode];
		console.log("Choosing among " + this.players.length + " players...");
		
		if(turnMode === 'roundRobin'){
			playerIndex = this.lastTurn;
			this.lastTurn++;
			this.share(turnMode+": I suggest @"+this.players[playerIndex]+" goes next. What say you?");
			this.invitationExtended = true;
		} else if (turnMode === 'random'){
			playerIndex = Math.floor(Math.random() * this.players.length);
			this.share(turnMode+": I suggest @"+this.players[playerIndex]+" goes next. What say you?");
			this.invitationExtended = true;
		}
		console.log("Players " + this.players);
		console.log("Chose player " + playerIndex);
		this.currentPlayer = this.players[playerIndex];
	},
	_manageInvitation: function(accepted) {
		this.invitationExtended = false;		

		if(!accepted) {
			this.share("Well that sucks...");			
			console.log(this.currentPlayer + " has declined the invitation to write. Moving on");			
			
			if (this.turnModes[this.turnMode] === 'roundRobin' && this.lastTurn >= this.players.length) {
				this.lastTurn = 0;
				this.share("Round complete.");
			}
			else {			
				this._nextTurn();
			}	
		} else {
			this.share("Alright! That's the spirit. Take it away, @" + this.currentPlayer + "!");
			console.log(this.currentPlayer + " has accepted the invitation to write.");	
		}	

	},
	_currentTurn: function(){		
		this.share("@" + this.currentPlayer + " is working on the story.");
	},
	_changeTurnMode: function(){
		//Cancel any invitations
		var invitationMessage = "";

		if(this.invitationExtended) {
			this.invitationExtended = false;
			invitationMessage = "Invitation to @" + this.currentPlayer + " cancelled. ";
		}
		
		this.turnMode++;
		if(this.turnMode == this.turnModes.length)
			this.turnMode = 0;
		this.share(invitationMessage + "New turn mode: " + this.turnModes[this.turnMode] + ".");
	},
	_joke: function(){
		this.share("This is no time for jokes, my friend.");
	},
	_creator: function(){
		this.share("I was created by Slash. Mojito defeated Slash in an epic battle described in many songs and captured me. Mojito is now my master and he keeps me at https://github.com/gaguevaras/slashbot.");
	},
	_latest: function(who){
		if (this.currentStoryFragments.length == 0){
			this.say(who, "The current story has not begun.");
			return;
		}
		var storypart = this.currentStoryFragments[this.currentStoryFragments.length-1];
		this.say(who, "Latest part of the story was from "+storypart.author+", he added: \""+storypart.story+"\"");
	},
	_fullStory: function(who){
		if (this.currentStoryFragments.length == 0){
			if (!who){
				this.share("The current story has not begun");
			} else {
				this.say(who, "The current story has not begun");
			}
			return;
		}
		
		var frags = [];
		for (var i = 0; i < this.currentStoryFragments.length; i++){
			frags.push(this.currentStoryFragments[i].story);
		}

		var chunk_size = 10;
		var chunked_frags = []; //array of arrays
		while (frags.length > 0) {
    		chunked_frags.push(frags.splice(0, chunk_size).join(" "));
		}

		if (!who){
			this.share("This is the story so far: ");
		} else {
			this.say(who, "This is the story so far: ");
		}
		for (var i = 0; i < chunked_frags.length; i++){
			if (!who){
				this.share(chunked_frags[i]);
			} else {
				this.say(who, chunked_frags[i]);
			}
		}		
	},
	_wtf: function(who){
		this.share("Perhaps you need to rephrase... Or add behavior at: https://github.com/gaguevaras/slashbot");
	},
	_addStoryPart: function (from, storyText){
		if (!this.story){
			this.say(from, "There's no story yet, you can ask me to create one using \"new story\"");
			this._listStories();
			return;
		}
		var storypart = {
			author: from,
			story: storyText
		};
		this.currentStoryFragments.push(storypart);	
		this._saveStory();	
		this.share("Added " +  from + "'s contribution.");
	},
	_correctStoryPart: function (from, storyText){
		if (this.currentStoryFragments.length == 0){
			this.say(from, "The current story is empty.");
			return;
		}
		var storypart = this.currentStoryFragments[this.currentStoryFragments.length-1];
		if (storypart.author === from){
			storypart = {
				author: from,
				story: storyText
			};
			this.currentStoryFragments[this.currentStoryFragments.length-1] = storypart;
			this._saveStory();
			this.say(from, "Corrected.");
		} else {
			this.say(from, "Sorry, only "+storypart.author+" can correct his fragment.");
		}
	}, 
	_help: function (who){
		this.say(who, "[story:] Adds a new fragment to the story");
		this.say(who, "[correct:] Corrects the last fragment of the story");
		this.say(who, "[bot latest] Gets the latest fragment");
		this.say(who, "[bot story so far] Gets the complete story.");
		this.say(who, "[bot next turn] Suggest who should do the next turn.");
		this.say(who, "[bot current turn] Shows the player whose turn it is.");	
		this.say(who, "[bot list stories] Shows the stories known by the bot.");
		this.say(who, "[bot new story] Creates a new story and sets it as current.");
		this.say(who, "[bot set story] Sets a story as the current one..");
		this.say(who, "[bot about] Gets some information about the slashbot.");
		this.say(who, "[yes, accept, I'll go, alright, sure] to accept an invitation to write");
		this.say(who, "[no, decline, pass, busy, meeting, working] to decline an invitation to write");
	},
	say: function(who, text){
		this.connector.say(who, text);
	},
	share: function(text){
		this.connector.share(text);
	},
	_newStory: function(text){
		var storyName = text.substr(text.indexOf("new story")+"new story".length+1);
		if (!storyName || storyName.trim() === ''){
			this.share('I need a name for the story');
			return;
		}
		var slashbot = this;
		
		this.persistence.createStory(storyName, function(story){
			if (!story) throw 'story was not created';
			
			slashbot.story = story;
			slashbot.share('Let\'s create the story "'+slashbot.story.name+'"');
			slashbot.currentStoryFragments = slashbot.story.fragments;
		});
	},
	_setStory: function (text){
		var storyPIN = text.substr(text.indexOf("set story")+"set story".length+1);
		if (!storyPIN || storyPIN.trim() === ''){
			this.share('I need a PIN for the story');
			return;
		}
		var slashbot = this;
		this.persistence.getStory(storyPIN, 
			function (story){
				slashbot.story = story;
				if (!slashbot.story){
					slashbot.share('I don\'t know a story with PIN ('+storyPIN+')');
					return;
				}
				slashbot.share('Let\'s continue the story "'+slashbot.story.name+'"');
				slashbot.currentStoryFragments = slashbot.story.fragments;
			}
		);
	},
	_listStories: function (text){
		var slashbot = this;
		this.persistence.getStoriesList( 
			function(stories){
				if (!stories || stories.length == 0){
					slashbot.share('I know no stories. Create one with `bot new story` ');
					return;
				}
				slashbot.share('I know these stories, use `bot set story <PIN>` to choose one.');
				for (var i = 0; i < stories.length; i++){
					var story = stories[i];
					slashbot.share(story.pin+" - "+story.name);
				}
			}
		);
	},
	_saveStory: function(){
		this.persistence.saveStory(this.story);
	},
	saveMessage: function(message) {
		this.persistence.saveMessage(message);	
	},
	saveOrUpdateUser: function(user) {
		this.persistence.saveOrUpdateUser(user);	
	},
	_converse: function(conversationPiece) {
		var slashbot = this;
		this.conversation.askSkynet(conversationPiece, function(response){
			console.log(response);
			slashbot.share(response);			
		});		
	},
	_img_search: function(string) {
		var this_ = this;
		this.images_client.search(string, {
			safe: 'high'
		})
	    .then(function (images) {
	    	this_.connector.postImageAttachment(images[0].url);	        
	    });
	},
	_tweet: function(who, string) {
		var this_ = this;
		// I wonder which one of these guys will break through this first?
		
		this.persistence.getTwitterCredentials(who.id, 
			function (creds){
				if (!creds){
					this_.share(who.name + ', you must master the forgotten art of OAuth before proceeding. Contact a GusCorp representative for assistance.');
					return;
				}
				this_.twitter.tweet(creds, who, string, function(tweeted_tweet){
					this_.share(who.name + ' tweeted: ' + tweeted_tweet.text );
					console.log('Tweeted: ', tweeted_tweet);
				});
				return;					
			}
		);
	},
	_aqi: function(who, city) {
	    var this_ = this;
    	// console.log('https://api.waqi.info/search/?keyword='+city+'&token=30ba56606e67af7b9e9993df62e8071864ef9b4e');
	    this.accountability.retrieveAqi(who, city, function(result) {
	    	if (!result) { 
	    		this_.share("The stations are not transmitting data.");
	    		return; 
	    	}
    		this_.share("min = " + result.min + " max = " + result.max + " avg = " + result.avg);
        	this_.share("minStation = " + result.minStation + "\nmaxStation = " + result.maxStation);
        	if (city === 'bogota') {
        		this_._tweet(who, "Qué está haciendo @EnriquePenalosa? #Polución Bogotana en " + result.max + " AQI! http://aqicn.org/map/bogota/#@g/4.6187/-74.1907/11z")
        	}
        	if (city === 'medellin') {
        		this_._tweet(who, "Qué pasa en #Medellín y el #ValleDeAburrá @FicoGutierrez? la #Polución esta en " + result.max + " AQI! http://aqicn.org/map/colombia/medellin/#@g/6.208/-75.5957/12z")
        	}
	    });

	},	
}
