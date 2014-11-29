var channel = "#fantasy-stories";
var config = {
	channels: [channel],
	server: "irc.freenode.net",
	botName: "rolebot"
};

var irc = require("irc");
var fs = require("fs");

var story = new Array();
var players = new Array();
var playersMap = {};

var turnModes = ["random", "roundRobin"];
var turnMode = 0;
var lastTurn = 0;

if (fs.existsSync("story.json")) {
	fs.readFile("story.json", "utf8", function (err, data) {
	  if (err) throw err;
	  story = JSON.parse(data);
	});
}

var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

bot.addListener("join", function(channel, who) {
	if (who.indexOf("slash") > -1)
		return;
	say(who, who + ", welcome to the channel. I am teh slashbot, I can tell you the [story so far], or the [latest] part. To add something to the story start your message with [story:] without the brackets. Have fun!");
	if (!playersMap[who] && who != config.botName){
		console.log("pushing ", who);
		players.push(who);		
	}
});

bot.addListener("names", function (channel, nicks) {
	console.log("channel: ", channel);
	var playerArray = Object.keys(nicks);
	console.log("players in channel: ", playerArray);
	
	for (var i = 0; i < playerArray.length; i++) {
		if (!playersMap[playerArray[i]] && playerArray[i] != config.botName) {
			console.log("pushing ", playerArray[i]);
			players.push(playerArray[i]);
		}
	}
	
});

bot.addListener("message", function(from, to, text, message) {
	if (!text)
		return;
	if (text.indexOf("story:") == 0){
		var storyText = text.substring("story:".length);
		addStoryPart(from, storyText);
	} else if (text.indexOf("correct:") == 0){
		var storyText = text.substring("correct:".length);
		correctStoryPart(from, storyText);
	} else if (text.indexOf("bot") == 0){
		if (text.indexOf("introduce yourself") > -1){
			introduce(from);
		} else if (text.indexOf("help") > -1){
			help(from);
		} else if (text.indexOf("joke") > -1){
			joke();
		} else	if (text.indexOf("Who is your creator?") > -1){
			creator();
		} else if (text.indexOf("latest") > -1){
			latest(from);
		} else if (text.indexOf("story so far") > -1){
			fullStory(from);
		} else if (text.indexOf("share the story") > -1){
			fullStory(false);
		} else if (text.indexOf("next turn") > -1){
			nextTurn();
		} else if (text.indexOf("turn mode") > -1){
			changeTurnMode();
		} else if (text.indexOf("dice") > -1 || text.indexOf("throw") > -1){
			dice(from, text);
		}
		else {
			wtf(from);
		}	
	}
});

function dice(from, text){
	var dieNotation = /(\d+)?d(\d+)([+-]\d+)?$/.exec(text);
    if (!dieNotation) {
        share("What's wrong with you, "+ from+ "? This is crap: " + text);
    }

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
	share("Throw = ["+diceArray+"], Avg = "+sum/amount+" Total+mods = "+(sum+mods));
}

function introduce(){
	share("I am the slashbot, I can tell you the [story so far], or the [latest] part. If you want to add something to the story, be sure to start your message with [story:] without the brackets. Have fun!");
}

function nextTurn(){
	var playerIndex = 0;
	if(turnModes[turnMode] == 'roundRobin'){
		playerIndex = lastTurn;
		lastTurn++;

		share(turnModes[turnMode]+": I suggest "+players[playerIndex]+" goes next." + playerIndex);
		if (lastTurn >= players.length) {
			lastTurn = 0;
			share("Round complete.");
		}
	} else if (turnModes[turnMode] == 'random'){
		playerIndex = Math.floor(Math.random() * players.length);
		share(turnModes[turnMode]+": I suggest "+players[playerIndex]+" goes next.");
	}
	
}

function changeTurnMode(){
	turnMode++;
	if(turnMode==turnModes.length)
		turnMode = 0;
	share("New turn mode: " + turnModes[turnMode] + ".");
}

function joke(){
	share("This is no time for jokes, my friend.");
}

function creator(){
	share("Slash did, @slashie_ on twitter.");
}

function latest(who){
	if (story.length == 0){
		say(who, "There's no story yet.");
		return;
	}
	var storypart = story[story.length-1];
	say(who, "Latest part of the story was from "+storypart.author+", he added: \""+storypart.story+"\"");
}

function fullStory(who){
	if (story.length == 0){
		if (!who){
			share("There's no story yet.");
		} else {
			say(who, "There's no story yet.");
		}
		return;
	}
	if (!who){
		share("This is the story so far:");
	}
	for (var i = 0; i < story.length; i++){
		var storypart = story[i];
		if (!who){
			share(storypart.story);
		} else {
			say(who, storypart.story);
		}
	}
}

function wtf(who){
	share("Perhaps you need to rephrase... Or add behavior at: https://github.com/slashman/slashbot");
}

function addStoryPart(from, storyText){
	var storypart = {
		author: from,
		story: storyText
	};
	story.push(storypart);	
	saveStory();	
	say(from, "Added.");
}

function saveStory(){
	var serializedStory = JSON.stringify(story);
	console.log(serializedStory);
	fs.writeFile('story.json', serializedStory, function (err) {
        if (err) throw err;
        console.log('It seems as if the file was saved, we shall see.');
    });
}

function correctStoryPart(from, storyText){
	if (story.length == 0){
		say(from, "There's no story yet.");
		return;
	}
	var storypart = story[story.length-1];
	if (storypart.author === from){
		storypart = {
			author: from,
			story: storyText
		};
		story[story.length-1] = storypart;
		saveStory();
		say(from, "Corrected.");
	} else {
		say(from, "Sorry, only "+storypart.author+" can correct his fragment.");
	}
}

function help(who){
	say(who, "[story:] Adds a new fragment to the story");
	say(who, "[correct:] Corrects the last fragment of the story");
	say(who, "[latest] Gets the latest fragment");
	say(who, "[story so far] Gets the complete story.");
	say(who, "[next turn] Suggest who should do the next turn.");
	say(who, "[share the story] Shows the full store for everyone.");	
}

function say(who, text){
	bot.notice(who, text);
}

function share(text){
	bot.say(channel, text);
}

bot.addListener('error', function(message) {
    console.log('error: ', message);
});