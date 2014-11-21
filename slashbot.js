var channel = "#slashbottest";
var config = {
	channels: [channel],
	server: "irc.freenode.net",
	botName: "slashbot7"
};

var irc = require("irc");

var story = new Array();
var players = new Array();
var playersMap = {};

var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

bot.addListener("join", function(channel, who) {
	if (who.indexOf("slash") > -1)
		return;
	say(who, who + ", welcome to the channel. I am teh slashbot, I can tell you the [story so far], or the [latest] part. To add something to the story start your message with [story:] without the brackets. Have fun!");
	if (!playersMap[who])
		players.push(who);
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
	} else if (text.indexOf("slashbot") == 0){
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
		} else {
			wtf(from);
		}
	}
});

function introduce(){
	share("I am the slashbot, I can tell you the [story so far], or the [latest] part. If you want to add something to the story, be sure to start your message with [story:] without the brackets. Have fun!");
}

function joke(){
	share("I am not a joker, I am an historian.");
}

function creator(){
	share("The almighty Slash, of course.");
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
	share("I am a primitive bot, unable to honor your complex request.");
}

function addStoryPart(from, storyText){
	var storypart = {
		author: from,
		story: storyText
	};
	story.push(storypart);
	say(from, "Added.");
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
	say(who, "[share the story] Shows the full store for everyone.");	
}

function say(who, text){
	bot.notice(who, text);
}

function share(text){
	bot.say(channel, text);
}